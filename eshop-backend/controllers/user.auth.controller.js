import crypto from "crypto";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import asyncHandler from "express-async-handler";
import User from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { successResponse } from "../utils/apiResponse.js";
import { generateAccessToken, setAuthCookies, clearAuthCookies } from "../utils/generateTokens.js";
import {
  issueRefreshToken,
  verifyRefreshToken,
  revokeRefreshToken,
  revokeAllRefreshTokens,
} from "../services/refreshToken.service.js";
import { requestOtp, verifyOtpCode } from "../services/otp.service.js";
import { sendEmail } from "../utils/sendEmail.js";

const issueSessionAndRespond = async (res, req, user, rememberMe, statusCode, message) => {
  const accessToken = generateAccessToken(user._id, "user");
  const refreshToken = await issueRefreshToken({
    accountId: user._id,
    accountModel: "User",
    req,
    rememberMe,
  });

  setAuthCookies(res, { accessToken, refreshToken, rememberMe });

  const userObj = user.toObject();
  delete userObj.password;

  return successResponse(res, statusCode, message, { user: userObj });
};

/**
 * @route POST /api/user/signup
 */
export const signupUser = asyncHandler(async (req, res) => {
  const { fullName, email, phone, password } = req.body;
  // Field-level validation already ran via the validate() middleware

  const existing = await User.findOne({ $or: [{ email }, { phone }] });
  if (existing) {
    throw new ApiError(409, "An account with this email or phone already exists");
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const emailVerificationToken = crypto.randomBytes(32).toString("hex");

  const user = await User.create({
    fullName,
    email,
    phone,
    password: hashedPassword,
    emailVerificationToken: crypto
      .createHash("sha256")
      .update(emailVerificationToken)
      .digest("hex"),
    emailVerificationExpire: Date.now() + 24 * 60 * 60 * 1000,
  });

  const verifyUrl = `${process.env.CLIENT_URL}/verify-email/${emailVerificationToken}`;
  try {
    await sendEmail({
      to: user.email,
      subject: "Verify your email - E-Shop",
      html: `<p>Hi ${user.fullName},</p>
             <p>Welcome to E-Shop! Please verify your email:</p>
             <a href="${verifyUrl}">${verifyUrl}</a>`,
    });
  } catch (err) {
    console.error("Verification email failed:", err.message);
  }

  const userObj = user.toObject();
  delete userObj.password;

  return successResponse(res, 201, "Account created. Please check your email to verify.", {
    user: userObj,
  });
});

/**
 * @route POST /api/user/verify-email/:token
 */
export const verifyEmail = asyncHandler(async (req, res) => {
  const hashedToken = crypto.createHash("sha256").update(req.params.token).digest("hex");

  const user = await User.findOne({
    emailVerificationToken: hashedToken,
    emailVerificationExpire: { $gt: Date.now() },
  });

  if (!user) throw new ApiError(400, "Verification link is invalid or has expired");

  user.isEmailVerified = true;
  user.emailVerificationToken = undefined;
  user.emailVerificationExpire = undefined;
  await user.save();

  return successResponse(res, 200, "Email verified successfully");
});

/**
 * @route POST /api/user/login
 * Accepts either email or phone in `emailOrPhone`.
 * If isMobileVerified is false, an OTP is auto-sent and the response
 * signals the frontend to redirect to the verify-mobile screen.
 */
export const loginUser = asyncHandler(async (req, res) => {
  const { emailOrPhone, password, rememberMe } = req.body;

  const user = await User.findOne({
    $or: [{ email: emailOrPhone }, { phone: emailOrPhone }],
  }).select("+password");

  if (!user) throw new ApiError(404, "Invalid credentials");

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) throw new ApiError(401, "Invalid credentials");

  if (!user.isMobileVerified) {
    // Issue a short-lived access token so the person can reach the
    // verify-mobile screen (a protected route) without being fully logged in yet.
    const accessToken = generateAccessToken(user._id, "user");
    setAuthCookies(res, { accessToken, refreshToken: null, rememberMe: false });

    try {
      await requestOtp({
        accountId: user._id,
        accountModel: "User",
        purpose: "MOBILE_VERIFY",
        mobile: user.phone,
      });
    } catch (err) {
      console.error("Auto-OTP send on login failed:", err.message);
    }

    return successResponse(res, 200, "Mobile verification required", {
      requiresMobileVerification: true,
    });
  }

  await issueSessionAndRespond(res, req, user, !!rememberMe, 200, `Welcome back, ${user.fullName}`);
});

/**
 * @route POST /api/user/refresh-token
 * Called by the frontend's Axios interceptor when an access token expires.
 */
export const refreshUserToken = asyncHandler(async (req, res) => {
  const token = req.cookies?.refreshToken;
  if (!token) throw new ApiError(401, "No refresh token provided");

  let decoded;
  try {
    decoded = await verifyRefreshToken(token);
  } catch (err) {
    throw new ApiError(401, "Invalid or expired refresh token");
  }

  if (!decoded || decoded.role !== "user") {
    throw new ApiError(401, "Invalid or expired refresh token");
  }

  const user = await User.findById(decoded.id);
  if (!user) throw new ApiError(401, "Account no longer exists");

  const accessToken = generateAccessToken(user._id, "user");
  res.cookie("accessToken", accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "strict" : "lax",
    maxAge: 15 * 60 * 1000,
  });

  return successResponse(res, 200, "Access token refreshed");
});

/**
 * @route POST /api/user/logout
 */
export const logoutUser = asyncHandler(async (req, res) => {
  const token = req.cookies?.refreshToken;
  if (token) await revokeRefreshToken(token);

  clearAuthCookies(res);
  return successResponse(res, 200, "Logged out successfully");
});

/**
 * @route POST /api/user/send-otp
 */
export const sendMobileOtp = asyncHandler(async (req, res) => {
  const user = await User.findById(req.account._id);
  await requestOtp({
    accountId: user._id,
    accountModel: "User",
    purpose: "MOBILE_VERIFY",
    mobile: user.phone,
  });
  return successResponse(res, 200, "OTP sent successfully");
});

/**
 * @route POST /api/user/verify-otp
 * Completes login: on success, issues the real refresh token + full session.
 */
export const verifyMobileOtp = asyncHandler(async (req, res) => {
  const { code, rememberMe } = req.body;
  if (!code) throw new ApiError(400, "OTP code is required");

  const user = await User.findById(req.account._id);

  await verifyOtpCode({
    accountId: user._id,
    accountModel: "User",
    purpose: "MOBILE_VERIFY",
    mobile: user.phone,
    code,
  });

  user.isMobileVerified = true;
  await user.save();

  await issueSessionAndRespond(res, req, user, !!rememberMe, 200, "Mobile number verified successfully");
});

/**
 * @route POST /api/user/resend-otp
 */
export const resendMobileOtp = asyncHandler(async (req, res) => {
  const user = await User.findById(req.account._id);
  await requestOtp({
    accountId: user._id,
    accountModel: "User",
    purpose: "MOBILE_VERIFY",
    mobile: user.phone,
  });
  return successResponse(res, 200, "A new OTP has been sent");
});

/**
 * @route POST /api/user/forgot-password/email
 */
export const forgotPasswordEmail = asyncHandler(async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email });

  if (!user) {
    return successResponse(res, 200, "If an account exists, a reset link has been sent");
  }

  const resetToken = crypto.randomBytes(32).toString("hex");
  user.resetPasswordToken = crypto.createHash("sha256").update(resetToken).digest("hex");
  user.resetPasswordExpire = Date.now() + 15 * 60 * 1000;
  await user.save();

  const resetUrl = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;
  await sendEmail({
    to: user.email,
    subject: "Password Reset - E-Shop",
    html: `<p>Hello ${user.fullName},</p>
           <p>Click below to reset your password. This link expires in 15 minutes.</p>
           <a href="${resetUrl}">${resetUrl}</a>`,
  });

  return successResponse(res, 200, "If an account exists, a reset link has been sent");
});

/**
 * @route POST /api/user/reset-password/email/:token
 */
export const resetPasswordEmail = asyncHandler(async (req, res) => {
  const { token } = req.params;
  const { password } = req.body;

  if (!password || password.length < 8) {
    throw new ApiError(400, "Password must be at least 8 characters");
  }

  const hashedToken = crypto.createHash("sha256").update(token).digest("hex");
  const user = await User.findOne({
    resetPasswordToken: hashedToken,
    resetPasswordExpire: { $gt: Date.now() },
  });

  if (!user) throw new ApiError(400, "Reset link is invalid or has expired");

  user.password = await bcrypt.hash(password, 10);
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;
  await user.save();
  await revokeAllRefreshTokens(user._id);

  return successResponse(res, 200, "Password reset successfully");
});

/**
 * @route POST /api/user/forgot-password/phone
 */
export const forgotPasswordPhone = asyncHandler(async (req, res) => {
  const { phone } = req.body;
  const user = await User.findOne({ phone });

  if (!user) {
    return successResponse(res, 200, "If an account exists, an OTP has been sent");
  }

  await requestOtp({
    accountId: user._id,
    accountModel: "User",
    purpose: "PASSWORD_RESET",
    mobile: user.phone,
  });

  return successResponse(res, 200, "If an account exists, an OTP has been sent", {
    accountId: user._id, // needed by the frontend to call verify/reset next
  });
});

/**
 * @route POST /api/user/reset-password/phone
 */
export const resetPasswordPhone = asyncHandler(async (req, res) => {
  const { accountId, code, password } = req.body;

  if (!password || password.length < 8) {
    throw new ApiError(400, "Password must be at least 8 characters");
  }

  const user = await User.findById(accountId);
  if (!user) throw new ApiError(404, "Account not found");

  await verifyOtpCode({
    accountId: user._id,
    accountModel: "User",
    purpose: "PASSWORD_RESET",
    mobile: user.phone,
    code,
  });

  user.password = await bcrypt.hash(password, 10);
  await user.save();
  await revokeAllRefreshTokens(user._id);

  return successResponse(res, 200, "Password reset successfully");
});

/**
 * @route GET /api/user/profile
 */
export const getUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.account._id).populate("wishlist");
  return successResponse(res, 200, "Profile fetched successfully", { user });
});
