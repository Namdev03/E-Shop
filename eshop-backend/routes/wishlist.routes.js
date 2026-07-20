import { Router } from "express";
import {
  getWishlist, addToWishlist, removeFromWishlist, moveToCart,
} from "../controllers/wishlist.controller.js";
import { verifyAuth, requireMobileVerified } from "../middleware/auth.middleware.js";
import { isUser } from "../middleware/role.middleware.js";

const router = Router();

router.use(verifyAuth, isUser, requireMobileVerified);

router.get("/", getWishlist);
router.post("/:productId", addToWishlist);
router.delete("/:productId", removeFromWishlist);
router.post("/:productId/move-to-cart", moveToCart);

export default router;
