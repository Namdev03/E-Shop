import { Router } from "express";
import {
  placeOrder, getUserOrders, getOrderById, cancelOrder,
  requestReturn, processRefund, reorder,
} from "../controllers/order.controller.js";
import { verifyAuth, requireMobileVerified } from "../middleware/auth.middleware.js";
import { isUser, isSeller } from "../middleware/role.middleware.js";

const router = Router();

router.post("/", verifyAuth, isUser, requireMobileVerified, placeOrder);
router.get("/", verifyAuth, isUser, requireMobileVerified, getUserOrders);
router.get("/:id", verifyAuth, isUser, requireMobileVerified, getOrderById);
router.patch("/:id/cancel", verifyAuth, isUser, requireMobileVerified, cancelOrder);
router.post("/:id/return", verifyAuth, isUser, requireMobileVerified, requestReturn);
router.post("/:id/reorder", verifyAuth, isUser, requireMobileVerified, reorder);

// Seller/owner-side refund approval
router.patch("/:id/refund", verifyAuth, isSeller, requireMobileVerified, processRefund);

export default router;
