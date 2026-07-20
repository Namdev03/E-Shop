import jwt from "jsonwebtoken";
import asyncHandler from "express-async-handler";
import User from "../models/user.model.js";
import Seller from "../models/seller.model.js";
import { ApiError } from "../utils/ApiError.js";

/**
 * Verifies the short-lived access token cookie. On expiry, responds with
 * a distinct error code (TOKEN_EXPIRED) rather than a generic 401 so the
 * frontend's Axios interceptor knows to call /refresh-token and retry,
 * instead of immediately forcing a full logout.
 */
export const verifyAuth = asyncHandler(async (req, res, next) => {
  const token = req.cookies?.accessToken;

  if (!token) {
    throw new ApiError(401, "Unauthorized: no access token provided");
  }

  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        message: "Access token expired",
        code: "TOKEN_EXPIRED",
        data: {},
      });
    }
    throw new ApiError(401, "Unauthorized: invalid access token");
  }

  const Model = decoded.role === "seller" ? Seller : User;
  const account = await Model.findById(decoded.id);

  if (!account) {
    throw new ApiError(401, "Unauthorized: account no longer exists");
  }
  if (account.status === "blocked" || account.status === "deleted") {
    throw new ApiError(403, "This account has been disabled");
  }

  req.account = account;
  req.role = decoded.role;
  next();
});

/**
 * Blocks access until the account has verified its mobile number.
 * Mount this AFTER verifyAuth on any route that should be gated by
 * OTP verification (per the "cannot access protected routes" requirement).
 */
export const requireMobileVerified = (req, res, next) => {
  if (!req.account.isMobileVerified) {
    throw new ApiError(403, "Please verify your mobile number to continue");
  }
  next();
};
