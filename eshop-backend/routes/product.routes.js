import { Router } from "express";
import asyncHandler from "express-async-handler";
import {
  createProduct, updateProduct, deleteProduct, setProductStatus,
  getAllProducts, getSearchSuggestions, getProductBySlug,
} from "../controllers/product.controller.js";
import { addReview, getProductReviews } from "../controllers/review.controller.js";
import { validate } from "../middleware/validate.middleware.js";
import { validateProduct, validateReview } from "../validators/product.validator.js";
import { verifyAuth, requireMobileVerified } from "../middleware/auth.middleware.js";
import { isSeller, isUser } from "../middleware/role.middleware.js";
import { upload } from "../middleware/upload.middleware.js";

const router = Router();

const optionalAuth = asyncHandler(async (req, res, next) => {
  if (!req.cookies?.accessToken) return next();
  return verifyAuth(req, res, next);
});

router.get("/", getAllProducts);
router.get("/search-suggestions", getSearchSuggestions);
router.get("/:slug", optionalAuth, getProductBySlug);

router.post(
  "/",
  verifyAuth, isSeller, requireMobileVerified,
  upload.array("images", 10),
  validate(validateProduct),
  createProduct
);
router.patch(
  "/:id",
  verifyAuth, isSeller, requireMobileVerified,
  upload.array("images", 10),
  updateProduct
);
router.patch("/:id/publish", verifyAuth, isSeller, requireMobileVerified, setProductStatus("Published"));
router.patch("/:id/draft", verifyAuth, isSeller, requireMobileVerified, setProductStatus("Draft"));
router.delete("/:id", verifyAuth, isSeller, requireMobileVerified, deleteProduct);

router.get("/:productId/reviews", getProductReviews);
router.post(
  "/:productId/reviews",
  verifyAuth, isUser, requireMobileVerified,
  upload.array("images", 5),
  validate(validateReview),
  addReview
);

export default router;
