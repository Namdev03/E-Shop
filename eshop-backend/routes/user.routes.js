import { Router } from "express";
import {
  signupUser, verifyEmail, loginUser, refreshUserToken, logoutUser,
  sendMobileOtp, verifyMobileOtp, resendMobileOtp,
  forgotPasswordEmail, resetPasswordEmail, forgotPasswordPhone, resetPasswordPhone,
  getUserProfile,
} from "../controllers/user.auth.controller.js";
import { validate } from "../middleware/validate.middleware.js";
import { validateSignup, validateLogin } from "../validators/auth.validator.js";
import { verifyAuth, requireMobileVerified } from "../middleware/auth.middleware.js";
import { isUser } from "../middleware/role.middleware.js";

const router = Router();

router.post("/signup", validate(validateSignup), signupUser);
router.post("/verify-email/:token", verifyEmail);
router.post("/login", validate(validateLogin), loginUser);
router.post("/refresh-token", refreshUserToken);

router.post("/forgot-password/email", forgotPasswordEmail);
router.post("/reset-password/email/:token", resetPasswordEmail);
router.post("/forgot-password/phone", forgotPasswordPhone);
router.post("/reset-password/phone", resetPasswordPhone);

// OTP verification only needs a valid access token, NOT full mobile
// verification (that would be circular) — verifyAuth alone is enough.
router.post("/send-otp", verifyAuth, isUser, sendMobileOtp);
router.post("/verify-otp", verifyAuth, isUser, verifyMobileOtp);
router.post("/resend-otp", verifyAuth, isUser, resendMobileOtp);

router.post("/logout", verifyAuth, isUser, logoutUser);
router.get("/profile", verifyAuth, isUser, requireMobileVerified, getUserProfile);

export default router;
