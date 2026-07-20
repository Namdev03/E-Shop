import asyncHandler from "express-async-handler";
import Wishlist from "../models/wishlist.model.js";
import Product from "../models/product.model.js";
import Cart from "../models/cart.model.js";
import { ApiError } from "../utils/ApiError.js";
import { successResponse } from "../utils/apiResponse.js";

/**
 * @route GET /api/wishlist
 */
export const getWishlist = asyncHandler(async (req, res) => {
  const items = await Wishlist.find({ user: req.account._id })
    .populate("product")
    .sort({ createdAt: -1 });

  return successResponse(res, 200, "Wishlist fetched successfully", { items });
});

/**
 * @route POST /api/wishlist/:productId
 */
export const addToWishlist = asyncHandler(async (req, res) => {
  const { productId } = req.params;

  const product = await Product.findById(productId);
  if (!product) throw new ApiError(404, "Product not found");

  const existing = await Wishlist.findOne({ user: req.account._id, product: productId });
  if (existing) throw new ApiError(409, "Product already in wishlist");

  const item = await Wishlist.create({ user: req.account._id, product: productId });
  return successResponse(res, 201, "Added to wishlist", { item });
});

/**
 * @route DELETE /api/wishlist/:productId
 */
export const removeFromWishlist = asyncHandler(async (req, res) => {
  await Wishlist.deleteOne({ user: req.account._id, product: req.params.productId });
  return successResponse(res, 200, "Removed from wishlist");
});

/**
 * @route POST /api/wishlist/:productId/move-to-cart
 */
export const moveToCart = asyncHandler(async (req, res) => {
  const { productId } = req.params;
  const { quantity = 1, color, size } = req.body;

  const product = await Product.findById(productId);
  if (!product) throw new ApiError(404, "Product not found");
  if (product.stock < quantity) throw new ApiError(400, "Not enough stock available");

  let cart = await Cart.findOne({ user: req.account._id });
  if (!cart) cart = await Cart.create({ user: req.account._id, items: [] });

  const existingItem = cart.items.find(
    (i) => i.product.toString() === productId && i.color === color && i.size === size
  );
  if (existingItem) {
    existingItem.quantity += Number(quantity);
  } else {
    cart.items.push({
      product: productId,
      quantity,
      color,
      size,
      priceAtAdd: product.discountPrice || product.price,
    });
  }
  await cart.save();

  await Wishlist.deleteOne({ user: req.account._id, product: productId });

  return successResponse(res, 200, "Moved to cart", { cart });
});
