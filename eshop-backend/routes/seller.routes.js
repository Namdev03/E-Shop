import { Router } from "express";
import {
  signupSeller, verifySellerEmail, loginSeller, refreshSellerToken, logoutSeller,
  sendSellerMobileOtp, verifySellerMobileOtp, resendSellerMobileOtp,
  forgotSellerPasswordEmail, resetSellerPasswordEmail,
  forgotSellerPasswordPhone, resetSellerPasswordPhone,
  getSellerProfile,
} from "../controllers/seller.auth.controller.js";
import {
  getSellerDashboardStats, getRevenueReport, getTopProducts, getTopCustomers,
} from "../controllers/seller.dashboard.controller.js";
import { getSellerProducts } from "../controllers/product.controller.js";
import { getSellerOrderItems, updateOrderItemStatus } from "../controllers/order.controller.js";
import { createCoupon, deactivateCoupon } from "../controllers/coupon.controller.js";
import { validate } from "../middleware/validate.middleware.js";
import { validateSellerSignup, validateLogin } from "../validators/auth.validator.js";
import { verifyAuth, requireMobileVerified } from "../middleware/auth.middleware.js";
import { isSeller } from "../middleware/role.middleware.js";

const router = Router();

router.post("/signup", validate(validateSellerSignup), signupSeller);
router.post("/verify-email/:token", verifySellerEmail);
router.post("/login", validate(validateLogin), loginSeller);
router.post("/refresh-token", refreshSellerToken);

router.post("/forgot-password/email", forgotSellerPasswordEmail);
router.post("/reset-password/email/:token", resetSellerPasswordEmail);
router.post("/forgot-password/phone", forgotSellerPasswordPhone);
router.post("/reset-password/phone", resetSellerPasswordPhone);

router.post("/send-otp", verifyAuth, isSeller, sendSellerMobileOtp);
router.post("/verify-otp", verifyAuth, isSeller, verifySellerMobileOtp);
router.post("/resend-otp", verifyAuth, isSeller, resendSellerMobileOtp);

router.post("/logout", verifyAuth, isSeller, logoutSeller);
router.get("/profile", verifyAuth, isSeller, requireMobileVerified, getSellerProfile);

router.get(
  "/dashboard/stats",
  verifyAuth, isSeller, requireMobileVerified,
  getSellerDashboardStats
);
router.get(
  "/dashboard/revenue-report",
  verifyAuth, isSeller, requireMobileVerified,
  getRevenueReport
);
router.get(
  "/dashboard/top-products",
  verifyAuth, isSeller, requireMobileVerified,
  getTopProducts
);
router.get(
  "/dashboard/top-customers",
  verifyAuth, isSeller, requireMobileVerified,
  getTopCustomers
);

router.get("/products", verifyAuth, isSeller, requireMobileVerified, getSellerProducts);
router.get("/order-items", verifyAuth, isSeller, requireMobileVerified, getSellerOrderItems);
router.patch(
  "/order-items/:id/status",
  verifyAuth, isSeller, requireMobileVerified,
  updateOrderItemStatus
);

router.post("/coupons", verifyAuth, isSeller, requireMobileVerified, createCoupon);
router.delete("/coupons/:id", verifyAuth, isSeller, requireMobileVerified, deactivateCoupon);

export default router;
