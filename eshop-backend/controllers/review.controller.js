import asyncHandler from "express-async-handler";
import Review from "../models/review.model.js";
import Product from "../models/product.model.js";
import OrderItem from "../models/orderItem.model.js";
import { ApiError } from "../utils/ApiError.js";
import { successResponse } from "../utils/apiResponse.js";
import { uploadMultipleToCloudinary } from "../utils/uploadToCloudinary.js";

const recalculateRatings = async (productId) => {
  const reviews = await Review.find({ product: productId });
  const reviewsCount = reviews.length;
  const ratings = reviewsCount
    ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviewsCount
    : 0;

  await Product.findByIdAndUpdate(productId, {
    ratings: Number(ratings.toFixed(1)),
    reviewsCount,
  });
};

/**
 * @route POST /api/products/:productId/reviews
 */
export const addReview = asyncHandler(async (req, res) => {
  const { productId } = req.params;
  const { rating, comment } = req.body;

  const product = await Product.findById(productId);
  if (!product) throw new ApiError(404, "Product not found");

  const existing = await Review.findOne({ user: req.account._id, product: productId });
  if (existing) throw new ApiError(409, "You have already reviewed this product");

  // Verified-purchase link, if the user has actually bought this product
  const purchasedItem = await OrderItem.findOne({
    product: productId,
    status: "Delivered",
  }).populate({ path: "order", match: { user: req.account._id } });
  const order = purchasedItem?.order?._id;

  const images = await uploadMultipleToCloudinary(req.files || [], "eshop/reviews");

  const review = await Review.create({
    user: req.account._id,
    product: productId,
    order,
    rating,
    comment,
    images,
  });

  await recalculateRatings(productId);

  return successResponse(res, 201, "Review submitted successfully", { review });
});

/**
 * @route PATCH /api/reviews/:id
 */
export const updateReview = asyncHandler(async (req, res) => {
  const review = await Review.findById(req.params.id);
  if (!review) throw new ApiError(404, "Review not found");
  if (review.user.toString() !== req.account._id.toString()) {
    throw new ApiError(403, "You can only edit your own review");
  }

  if (req.body.rating !== undefined) review.rating = req.body.rating;
  if (req.body.comment !== undefined) review.comment = req.body.comment;

  await review.save();
  await recalculateRatings(review.product);

  return successResponse(res, 200, "Review updated successfully", { review });
});

/**
 * @route DELETE /api/reviews/:id
 */
export const deleteReview = asyncHandler(async (req, res) => {
  const review = await Review.findById(req.params.id);
  if (!review) throw new ApiError(404, "Review not found");
  if (review.user.toString() !== req.account._id.toString()) {
    throw new ApiError(403, "You can only delete your own review");
  }

  const productId = review.product;
  await review.deleteOne();
  await recalculateRatings(productId);

  return successResponse(res, 200, "Review deleted successfully");
});

/**
 * @route GET /api/products/:productId/reviews
 */
export const getProductReviews = asyncHandler(async (req, res) => {
  const reviews = await Review.find({ product: req.params.productId })
    .populate("user", "fullName profileImage")
    .sort({ createdAt: -1 });

  return successResponse(res, 200, "Reviews fetched successfully", { reviews });
});
