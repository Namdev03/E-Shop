import mongoose from "mongoose";

const { Schema, model } = mongoose;

/**
 * Storing a hash of every issued refresh token lets us revoke sessions
 * individually (logout on one device) or all at once (logout everywhere,
 * or on password change) instead of just trusting any unexpired JWT.
 */
const refreshTokenSchema = new Schema(
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
    tokenHash: { type: String, required: true },
    userAgent: String,
    ip: String,
    expiresAt: { type: Date, required: true },
    revoked: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// Mongo TTL index — automatically deletes expired token records
refreshTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const RefreshToken = model("RefreshToken", refreshTokenSchema);
export default RefreshToken;
