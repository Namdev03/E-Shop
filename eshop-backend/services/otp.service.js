import OTP from "../models/otp.model.js";
import { sendOtpSms, checkOtpSms } from "../utils/otpSms.js";
import { ApiError } from "../utils/ApiError.js";
import { OTP_EXPIRY_MINUTES, OTP_MAX_ATTEMPTS } from "../constants/index.js";

/**
 * Requests a fresh OTP. Any previous unverified OTP record for this
 * account+purpose is replaced (not stacked) so attempt counts can't be
 * bypassed by simply requesting a new code.
 */
export const requestOtp = async ({ accountId, accountModel, purpose, mobile }) => {
  await OTP.deleteMany({ account: accountId, accountModel, purpose, verified: false });

  await sendOtpSms(mobile);

  const otpRecord = await OTP.create({
    account: accountId,
    accountModel,
    purpose,
    mobile,
    expiresAt: new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000),
    maxAttempts: OTP_MAX_ATTEMPTS,
  });

  return otpRecord;
};

/**
 * Verifies a submitted code. Checks our own expiry/attempt limits FIRST
 * (cheap, local) before ever calling out to Twilio, so a locked-out or
 * expired attempt never counts against Twilio's own rate limits.
 */
export const verifyOtpCode = async ({ accountId, accountModel, purpose, mobile, code }) => {
  const otpRecord = await OTP.findOne({
    account: accountId,
    accountModel,
    purpose,
    verified: false,
  }).sort({ createdAt: -1 });

  if (!otpRecord) {
    throw new ApiError(400, "No pending OTP request found. Please request a new code.");
  }

  if (otpRecord.expiresAt < new Date()) {
    throw new ApiError(400, "OTP has expired. Please request a new code.");
  }

  if (otpRecord.attempts >= otpRecord.maxAttempts) {
    throw new ApiError(429, "Too many incorrect attempts. Please request a new code.");
  }

  const isValid = await checkOtpSms(mobile, code);

  if (!isValid) {
    otpRecord.attempts += 1;
    await otpRecord.save();
    throw new ApiError(400, "Invalid OTP code");
  }

  otpRecord.verified = true;
  await otpRecord.save();

  return true;
};
