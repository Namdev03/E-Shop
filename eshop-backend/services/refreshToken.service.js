import crypto from "crypto";
import jwt from "jsonwebtoken";
import RefreshToken from "../models/refreshToken.model.js";
import { generateRefreshToken } from "../utils/generateTokens.js";

const hashToken = (token) => crypto.createHash("sha256").update(token).digest("hex");

/**
 * Issues a new refresh token and stores its hash (never the raw token)
 * so a leaked database can't be used to forge sessions.
 */
export const issueRefreshToken = async ({ accountId, accountModel, req, rememberMe }) => {
  const refreshToken = generateRefreshToken(
    accountId,
    accountModel === "Seller" ? "seller" : "user"
  );

  const expiresAt = rememberMe
    ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
    : new Date(Date.now() + 24 * 60 * 60 * 1000); // session tokens still expire server-side within a day

  await RefreshToken.create({
    account: accountId,
    accountModel,
    tokenHash: hashToken(refreshToken),
    userAgent: req?.headers?.["user-agent"],
    ip: req?.ip,
    expiresAt,
  });

  return refreshToken;
};

/**
 * Verifies a refresh token both cryptographically (JWT signature/expiry)
 * AND against the DB record (so a logged-out / revoked token is rejected
 * even if the JWT itself hasn't technically expired yet).
 */
export const verifyRefreshToken = async (token) => {
  const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);

  const record = await RefreshToken.findOne({
    account: decoded.id,
    tokenHash: hashToken(token),
    revoked: false,
  });

  if (!record || record.expiresAt < new Date()) {
    return null;
  }

  return decoded;
};

export const revokeRefreshToken = async (token) => {
  await RefreshToken.updateOne(
    { tokenHash: hashToken(token) },
    { $set: { revoked: true } }
  );
};

/** Used on password change — kills every existing session for the account. */
export const revokeAllRefreshTokens = async (accountId) => {
  await RefreshToken.updateMany({ account: accountId }, { $set: { revoked: true } });
};
