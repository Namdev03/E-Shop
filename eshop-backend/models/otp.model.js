import mongoose from "mongoose";
import { OTP_PURPOSES, OTP_EXPIRY_MINUTES, OTP_MAX_ATTEMPTS } from "../constants/index.js";

const { Schema, model } = mongoose;

/**
 * Twilio Verify actually generates/validates the SMS code, but we keep our
 * own record so the app can enforce independent expiry/attempt limits and
 * give clean "OTP expired" / "too many attempts" messaging without being
 * fully coupled to Twilio's internal state.
 */
const otpSchema = new Schema(
  {
    account: {
      type: Schema.Types.ObjectId,
      required: true,
      refPath: "accountModel",
    },
    accountModel: {
      type: String,
      required: true,
      enum: ["User", "Seller"],
    },
    purpose: {
      type: String,
      enum: OTP_PURPOSES,
      required: true,
    },
    mobile: { type: String, required: true },
    attempts: { type: Number, default: 0 },
    maxAttempts: { type: Number, default: OTP_MAX_ATTEMPTS },
    expiresAt: {
      type: Date,
      default: () => new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000),
    },
    verified: { type: Boolean, default: false },
  },
  { timestamps: true }
);

otpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const OTP = model("OTP", otpSchema);
export default OTP;
