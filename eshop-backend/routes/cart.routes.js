import { Router } from "express";
import {
  getCart, addToCart, updateCartItemQuantity, removeCartItem, clearCart, applyCoupon,
} from "../controllers/cart.controller.js";
import { verifyAuth, requireMobileVerified } from "../middleware/auth.middleware.js";
import { isUser } from "../middleware/role.middleware.js";

const router = Router();

router.use(verifyAuth, isUser, requireMobileVerified);

router.get("/", getCart);
router.post("/items", addToCart);
router.patch("/items/:productId", updateCartItemQuantity);
router.delete("/items/:productId", removeCartItem);
router.delete("/", clearCart);
router.post("/coupon", applyCoupon);

export default router;
