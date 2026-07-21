import crypto from "crypto";
import bcrypt from "bcrypt";
import asyncHandler from "express-async-handler";
import Seller from "../models/seller.model.js";
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

const issueSessionAndRespond = async (res, req, seller, rememberMe, statusCode, message) => {
  const accessToken = generateAccessToken(seller._id, "seller");
  const refreshToken = await issueRefreshToken({
    accountId: seller._id,
    accountModel: "Seller",
    req,
    rememberMe,
  });
  setAuthCookies(res, { accessToken, refreshToken, rememberMe });

  const sellerObj = seller.toObject();
  delete sellerObj.password;

  return successResponse(res, statusCode, message, { seller: sellerObj });
};

/**
 * @route POST /api/seller/signup
 */
export const signupSeller = asyncHandler(async (req, res) => {
  const { fullName, storeName, email, phone, password } = req.body;

  const existing = await Seller.findOne({ $or: [{ email }, { phone }] });
  if (existing) {
    throw new ApiError(409, "An account with this email or phone already exists");
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const emailVerificationToken = crypto.randomBytes(32).toString("hex");

  const seller = await Seller.create({
    fullName,
    storeName,
    email,
    phone,
    password: hashedPassword,
    emailVerificationToken: crypto
      .createHash("sha256")
      .update(emailVerificationToken)
      .digest("hex"),
    emailVerificationExpire: Date.now() + 24 * 60 * 60 * 1000,
  });

  const verifyUrl = `${process.env.CLIENT_URL}/seller/verify-email/${emailVerificationToken}`;
  try {
    await sendEmail({
      to: seller.email,
      subject: "Verify your email - E-Shop Seller",
      html: `<p>Hi ${seller.fullName},</p>
             <p>Welcome to E-Shop Seller! Please verify your email:</p>
             <a href="${verifyUrl}">${verifyUrl}</a>`,
    });
  } catch (err) {
    console.error("Verification email failed:", err.message);
  }

  const sellerObj = seller.toObject();
  delete sellerObj.password;

  return successResponse(res, 201, "Account created. Please check your email to verify.", {
    seller: sellerObj,
  });
});

/**
 * @route POST /api/seller/verify-email/:token
 */
export const verifySellerEmail = asyncHandler(async (req, res) => {
  const hashedToken = crypto.createHash("sha256").update(req.params.token).digest("hex");

  const seller = await Seller.findOne({
    emailVerificationToken: hashedToken,
    emailVerificationExpire: { $gt: Date.now() },
  });

  if (!seller) throw new ApiError(400, "Verification link is invalid or has expired");

  seller.isEmailVerified = true;
  seller.emailVerificationToken = undefined;
  seller.emailVerificationExpire = undefined;
  await seller.save();

  return successResponse(res, 200, "Email verified successfully");
});

/**
 * @route POST /api/seller/login
 */
export const loginSeller = asyncHandler(async (req, res) => {
  const { emailOrPhone, password, rememberMe } = req.body;

  const seller = await Seller.findOne({
    $or: [{ email: emailOrPhone }, { phone: emailOrPhone }],
  }).select("+password");

  if (!seller) throw new ApiError(404, "Invalid credentials");

  const isMatch = await bcrypt.compare(password, seller.password);
  if (!isMatch) throw new ApiError(401, "Invalid credentials");

  if (!seller.isMobileVerified) {
    const accessToken = generateAccessToken(seller._id, "seller");
    setAuthCookies(res, { accessToken, refreshToken: null, rememberMe: false });

    try {
      await requestOtp({
        accountId: seller._id,
        accountModel: "Seller",
        purpose: "MOBILE_VERIFY",
        mobile: seller.phone,
      });
    } catch (err) {
      console.error("Auto-OTP send on login failed:", err.message);
    }

    return successResponse(res, 200, "Mobile verification required", {
      requiresMobileVerification: true,
    });
  }

  await issueSessionAndRespond(
    res,
    req,
    seller,
    !!rememberMe,
    200,
    `Welcome back, ${seller.storeName}`
  );
});

/**
 * @route POST /api/seller/refresh-token
 */
export const refreshSellerToken = asyncHandler(async (req, res) => {
  const token = req.cookies?.refreshToken;
  if (!token) throw new ApiError(401, "No refresh token provided");

  let decoded;
  try {
    decoded = await verifyRefreshToken(token);
  } catch (err) {
    throw new ApiError(401, "Invalid or expired refresh token");
  }

  if (!decoded || decoded.role !== "seller") {
    throw new ApiError(401, "Invalid or expired refresh token");
  }

  const seller = await Seller.findById(decoded.id);
  if (!seller) throw new ApiError(401, "Account no longer exists");

  const accessToken = generateAccessToken(seller._id, "seller");
  res.cookie("accessToken", accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "strict" : "lax",
    maxAge: 15 * 60 * 1000,
  });

  return successResponse(res, 200, "Access token refreshed");
});

/**
 * @route POST /api/seller/logout
 */
export const logoutSeller = asyncHandler(async (req, res) => {
  const token = req.cookies?.refreshToken;
  if (token) await revokeRefreshToken(token);

  clearAuthCookies(res);
  return successResponse(res, 200, "Logged out successfully");
});

/**
 * @route POST /api/seller/send-otp
 */
export const sendSellerMobileOtp = asyncHandler(async (req, res) => {
  const seller = await Seller.findById(req.account._id);
  await requestOtp({
    accountId: seller._id,
    accountModel: "Seller",
    purpose: "MOBILE_VERIFY",
    mobile: seller.phone,
  });
  return successResponse(res, 200, "OTP sent successfully");
});

/**
 * @route POST /api/seller/verify-otp
 */
export const verifySellerMobileOtp = asyncHandler(async (req, res) => {
  const { code, rememberMe } = req.body;
  if (!code) throw new ApiError(400, "OTP code is required");

  const seller = await Seller.findById(req.account._id);

  await verifyOtpCode({
    accountId: seller._id,
    accountModel: "Seller",
    purpose: "MOBILE_VERIFY",
    mobile: seller.phone,
    code,
  });

  seller.isMobileVerified = true;
  await seller.save();

  await issueSessionAndRespond(
    res,
    req,
    seller,
    !!rememberMe,
    200,
    "Mobile number verified successfully"
  );
});

/**
 * @route POST /api/seller/resend-otp
 */
export const resendSellerMobileOtp = asyncHandler(async (req, res) => {
  const seller = await Seller.findById(req.account._id);
  await requestOtp({
    accountId: seller._id,
    accountModel: "Seller",
    purpose: "MOBILE_VERIFY",
    mobile: seller.phone,
  });
  return successResponse(res, 200, "A new OTP has been sent");
});

/**
 * @route POST /api/seller/forgot-password/email
 */
export const forgotSellerPasswordEmail = asyncHandler(async (req, res) => {
  const { email } = req.body;
  const seller = await Seller.findOne({ email });

  if (!seller) {
    return successResponse(res, 200, "If an account exists, a reset link has been sent");
  }

  const resetToken = crypto.randomBytes(32).toString("hex");
  seller.resetPasswordToken = crypto.createHash("sha256").update(resetToken).digest("hex");
  seller.resetPasswordExpire = Date.now() + 15 * 60 * 1000;
  await seller.save();

  const resetUrl = `${process.env.CLIENT_URL}/seller/reset-password/${resetToken}`;
  await sendEmail({
    to: seller.email,
    subject: "Password Reset - E-Shop Seller",
    html: `<p>Hello ${seller.fullName},</p>
           <p>Click below to reset your password. This link expires in 15 minutes.</p>
           <a href="${resetUrl}">${resetUrl}</a>`,
  });

  return successResponse(res, 200, "If an account exists, a reset link has been sent");
});

/**
 * @route POST /api/seller/reset-password/email/:token
 */
export const resetSellerPasswordEmail = asyncHandler(async (req, res) => {
  const { token } = req.params;
  const { password } = req.body;

  if (!password || password.length < 8) {
    throw new ApiError(400, "Password must be at least 8 characters");
  }

  const hashedToken = crypto.createHash("sha256").update(token).digest("hex");
  const seller = await Seller.findOne({
    resetPasswordToken: hashedToken,
    resetPasswordExpire: { $gt: Date.now() },
  });

  if (!seller) throw new ApiError(400, "Reset link is invalid or has expired");

  seller.password = await bcrypt.hash(password, 10);
  seller.resetPasswordToken = undefined;
  seller.resetPasswordExpire = undefined;
  await seller.save();
  await revokeAllRefreshTokens(seller._id);

  return successResponse(res, 200, "Password reset successfully");
});

/**
 * @route POST /api/seller/forgot-password/phone
 */
export const forgotSellerPasswordPhone = asyncHandler(async (req, res) => {
  const { phone } = req.body;
  const seller = await Seller.findOne({ phone });

  if (!seller) {
    return successResponse(res, 200, "If an account exists, an OTP has been sent");
  }

  await requestOtp({
    accountId: seller._id,
    accountModel: "Seller",
    purpose: "PASSWORD_RESET",
    mobile: seller.phone,
  });

  return successResponse(res, 200, "If an account exists, an OTP has been sent", {
    accountId: seller._id,
  });
});

/**
 * @route POST /api/seller/reset-password/phone
 */
export const resetSellerPasswordPhone = asyncHandler(async (req, res) => {
  const { accountId, code, password } = req.body;

  if (!password || password.length < 8) {
    throw new ApiError(400, "Password must be at least 8 characters");
  }

  const seller = await Seller.findById(accountId);
  if (!seller) throw new ApiError(404, "Account not found");

  await verifyOtpCode({
    accountId: seller._id,
    accountModel: "Seller",
    purpose: "PASSWORD_RESET",
    mobile: seller.phone,
    code,
  });

  seller.password = await bcrypt.hash(password, 10);
  await seller.save();
  await revokeAllRefreshTokens(seller._id);

  return successResponse(res, 200, "Password reset successfully");
});

/**
 * @route GET /api/seller/profile
 */
export const getSellerProfile = asyncHandler(async (req, res) => {
  const seller = await Seller.findById(req.account._id);
  return successResponse(res, 200, "Profile fetched successfully", { seller });
});
