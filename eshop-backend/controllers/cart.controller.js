import asyncHandler from "express-async-handler";
import Cart from "../models/cart.model.js";
import Product from "../models/product.model.js";
import Coupon from "../models/coupon.model.js";
import { ApiError } from "../utils/ApiError.js";
import { successResponse } from "../utils/apiResponse.js";

const SHIPPING_CHARGE = 49;
const FREE_SHIPPING_THRESHOLD = 999;
const TAX_RATE = 0.05;

/**
 * Computes cart totals server-side every time — the frontend should
 * never be trusted to send the grand total, only what's in the cart.
 */
const computeTotals = async (cart) => {
  const subtotal = cart.items.reduce((sum, item) => sum + item.priceAtAdd * item.quantity, 0);

  let discount = 0;
  if (cart.couponCode) {
    const coupon = await Coupon.findOne({ code: cart.couponCode, isActive: true });
    if (coupon && subtotal >= coupon.minOrderValue && coupon.expiresAt > new Date()) {
      discount =
        coupon.discountType === "Percentage"
          ? Math.min((subtotal * coupon.discountValue) / 100, coupon.maxDiscountAmount || Infinity)
          : coupon.discountValue;
    }
  }

  const shippingCharge = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_CHARGE;
  const tax = Math.round((subtotal - discount) * TAX_RATE);
  const grandTotal = Math.max(0, subtotal - discount + shippingCharge + tax);

  return { subtotal, discount, shippingCharge, tax, grandTotal };
};

/**
 * @route GET /api/cart
 */
export const getCart = asyncHandler(async (req, res) => {
  let cart = await Cart.findOne({ user: req.account._id }).populate(
    "items.product",
    "title images price discountPrice stock status"
  );

  if (!cart) {
    cart = await Cart.create({ user: req.account._id, items: [] });
  }

  const totals = await computeTotals(cart);
  return successResponse(res, 200, "Cart fetched successfully", { cart, totals });
});

/**
 * @route POST /api/cart/items
 */
export const addToCart = asyncHandler(async (req, res) => {
  const { productId, quantity = 1, color, size } = req.body;

  const product = await Product.findById(productId);
  if (!product) throw new ApiError(404, "Product not found");
  if (product.stock < quantity) throw new ApiError(400, "Not enough stock available");

  let cart = await Cart.findOne({ user: req.account._id });
  if (!cart) cart = await Cart.create({ user: req.account._id, items: [] });

  const existingItem = cart.items.find(
    (item) =>
      item.product.toString() === productId && item.color === color && item.size === size
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
  return successResponse(res, 200, "Added to cart", { cart });
});

/**
 * @route PATCH /api/cart/items/:productId
 */
export const updateCartItemQuantity = asyncHandler(async (req, res) => {
  const { quantity } = req.body;
  if (quantity < 1) throw new ApiError(400, "Quantity must be at least 1");

  const cart = await Cart.findOne({ user: req.account._id });
  if (!cart) throw new ApiError(404, "Cart not found");

  const item = cart.items.find((i) => i.product.toString() === req.params.productId);
  if (!item) throw new ApiError(404, "Item not found in cart");

  item.quantity = quantity;
  await cart.save();

  return successResponse(res, 200, "Quantity updated", { cart });
});

/**
 * @route DELETE /api/cart/items/:productId
 */
export const removeCartItem = asyncHandler(async (req, res) => {
  const cart = await Cart.findOne({ user: req.account._id });
  if (!cart) throw new ApiError(404, "Cart not found");

  cart.items = cart.items.filter((i) => i.product.toString() !== req.params.productId);
  await cart.save();

  return successResponse(res, 200, "Item removed from cart", { cart });
});

/**
 * @route DELETE /api/cart
 */
export const clearCart = asyncHandler(async (req, res) => {
  const cart = await Cart.findOne({ user: req.account._id });
  if (cart) {
    cart.items = [];
    cart.couponCode = undefined;
    await cart.save();
  }
  return successResponse(res, 200, "Cart cleared");
});

/**
 * @route POST /api/cart/coupon
 */
export const applyCoupon = asyncHandler(async (req, res) => {
  const { code } = req.body;

  const coupon = await Coupon.findOne({ code: code?.toUpperCase(), isActive: true });
  if (!coupon) throw new ApiError(404, "Invalid coupon code");
  if (coupon.expiresAt < new Date()) throw new ApiError(400, "This coupon has expired");
  if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
    throw new ApiError(400, "This coupon has reached its usage limit");
  }

  const cart = await Cart.findOne({ user: req.account._id });
  if (!cart) throw new ApiError(404, "Cart not found");

  cart.couponCode = coupon.code;
  await cart.save();

  const totals = await computeTotals(cart);
  return successResponse(res, 200, "Coupon applied successfully", { cart, totals });
});

export { computeTotals };
