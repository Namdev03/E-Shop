import jwt from "jsonwebtoken";

/**
 * Signs a short-lived access token. Sent as an httpOnly cookie AND
 * returned in the response body so SPA code can attach it as a
 * Bearer header if needed (the cookie remains the source of truth).
 */
export const generateAccessToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_ACCESS_SECRET, {
    expiresIn: process.env.JWT_ACCESS_EXPIRE || "15m",
  });
};

/**
 * Signs a long-lived refresh token. `rememberMe` extends the cookie's
 * maxAge; the JWT itself always carries the same expiry so a stolen
 * "remember me" cookie can't be replayed indefinitely past its window.
 */
export const generateRefreshToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_REFRESH_SECRET, {
    expiresIn: process.env.JWT_REFRESH_EXPIRE || "30d",
  });
};

const baseCookieOptions = () => ({
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: process.env.NODE_ENV === "production" ? "strict" : "lax",
});

export const setAuthCookies = (res, { accessToken, refreshToken, rememberMe }) => {
  res.cookie("accessToken", accessToken, {
    ...baseCookieOptions(),
    maxAge: 15 * 60 * 1000, // 15 minutes, matches JWT_ACCESS_EXPIRE default
  });

  res.cookie("refreshToken", refreshToken, {
    ...baseCookieOptions(),
    // Without "remember me", the refresh cookie is session-only (no maxAge)
    // so it disappears when the browser fully closes.
    ...(rememberMe ? { maxAge: 30 * 24 * 60 * 60 * 1000 } : {}),
  });
};

export const clearAuthCookies = (res) => {
  const options = baseCookieOptions();
  res.clearCookie("accessToken", options);
  res.clearCookie("refreshToken", options);
};
