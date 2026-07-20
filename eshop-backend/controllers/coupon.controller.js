import asyncHandler from "express-async-handler";
import Coupon from "../models/coupon.model.js";
import { ApiError } from "../utils/ApiError.js";
import { successResponse } from "../utils/apiResponse.js";

/**
 * @route GET /api/coupons/active
 * Public — shown to users as "available coupons" on cart/checkout.
 */
export const getActiveCoupons = asyncHandler(async (req, res) => {
  const coupons = await Coupon.find({
    isActive: true,
    expiresAt: { $gt: new Date() },
  }).select("-usedCount");

  return successResponse(res, 200, "Active coupons fetched successfully", { coupons });
});

/**
 * @route POST /api/coupons
 * Seller-created coupons scoped to their own products/categories.
 */
export const createCoupon = asyncHandler(async (req, res) => {
  const {
    code, description, discountType, discountValue, maxDiscountAmount,
    minOrderValue, usageLimit, usageLimitPerUser,
    applicableCategories, applicableProducts, startsAt, expiresAt,
  } = req.body;

  if (!code || !discountType || !discountValue || !expiresAt) {
    throw new ApiError(400, "Code, discount type, discount value, and expiry are required");
  }

  const existing = await Coupon.findOne({ code: code.toUpperCase() });
  if (existing) throw new ApiError(409, "A coupon with this code already exists");

  const coupon = await Coupon.create({
    code: code.toUpperCase(),
    description,
    discountType,
    discountValue,
    maxDiscountAmount,
    minOrderValue,
    usageLimit,
    usageLimitPerUser,
    applicableCategories,
    applicableProducts,
    startsAt,
    expiresAt,
  });

  return successResponse(res, 201, "Coupon created successfully", { coupon });
});

/**
 * @route DELETE /api/coupons/:id
 */
export const deactivateCoupon = asyncHandler(async (req, res) => {
  const coupon = await Coupon.findById(req.params.id);
  if (!coupon) throw new ApiError(404, "Coupon not found");

  coupon.isActive = false;
  await coupon.save();

  return successResponse(res, 200, "Coupon deactivated successfully");
});
