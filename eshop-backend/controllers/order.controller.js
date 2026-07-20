import asyncHandler from "express-async-handler";
import Order from "../models/order.model.js";
import OrderItem from "../models/orderItem.model.js";
import Cart from "../models/cart.model.js";
import Product from "../models/product.model.js";
import Address from "../models/address.model.js";
import Coupon from "../models/coupon.model.js";
import { ApiError } from "../utils/ApiError.js";
import { successResponse } from "../utils/apiResponse.js";
import { sendNotification } from "../services/notification.service.js";
import { sendEmail } from "../utils/sendEmail.js";
import { computeTotals } from "./cart.controller.js";
import { ORDER_STATUS } from "../constants/index.js";

const SHIPPING_CHARGE = 49;
const FREE_SHIPPING_THRESHOLD = 999;
const TAX_RATE = 0.05;

/**
 * @route POST /api/orders
 * Places an order from the user's current cart. Splits items by seller
 * into separate OrderItem documents so each seller manages fulfillment
 * of only their own items.
 */
export const placeOrder = asyncHandler(async (req, res) => {
  const { addressId, paymentMethod = "COD" } = req.body;

  const address = await Address.findOne({ _id: addressId, user: req.account._id });
  if (!address) throw new ApiError(404, "Delivery address not found");

  const cart = await Cart.findOne({ user: req.account._id }).populate("items.product");
  if (!cart || cart.items.length === 0) throw new ApiError(400, "Your cart is empty");

  // Re-check stock for every item at the moment of order placement —
  // it may have changed since it was added to the cart.
  for (const item of cart.items) {
    if (!item.product || item.product.stock < item.quantity) {
      throw new ApiError(400, `${item.product?.title || "An item"} is out of stock`);
    }
  }

  const totals = await computeTotals(cart);

  const order = await Order.create({
    user: req.account._id,
    items: [],
    shippingAddress: {
      fullName: address.fullName,
      phone: address.phone,
      alternatePhone: address.alternatePhone,
      email: address.email,
      country: address.country,
      state: address.state,
      city: address.city,
      pincode: address.pincode,
      streetAddress: address.streetAddress,
      landmark: address.landmark,
      addressType: address.addressType,
      deliveryInstructions: address.deliveryInstructions,
    },
    subtotal: totals.subtotal,
    shippingCharge: totals.shippingCharge,
    tax: totals.tax,
    discount: totals.discount,
    grandTotal: totals.grandTotal,
    couponCode: cart.couponCode,
    paymentMethod,
    paymentStatus: paymentMethod === "COD" ? "Pending" : "Pending",
    estimatedDelivery: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
  });

  const orderItems = await Promise.all(
    cart.items.map(async (item) => {
      const orderItem = await OrderItem.create({
        order: order._id,
        product: item.product._id,
        seller: item.product.seller,
        quantity: item.quantity,
        color: item.color,
        size: item.size,
        priceAtPurchase: item.priceAtAdd,
        statusHistory: [{ status: "Order Placed" }],
      });

      // Decrement stock and totalSold immediately for COD; for online
      // payment methods this would move to a payment-webhook handler.
      await Product.findByIdAndUpdate(item.product._id, {
        $inc: { stock: -item.quantity, totalSold: item.quantity },
      });

      await sendNotification({
        recipient: item.product.seller,
        recipientModel: "Seller",
        title: "New Order Received",
        message: `You have a new order for "${item.product.title}" (x${item.quantity})`,
        type: "ORDER_PLACED",
        relatedOrder: order._id,
        relatedProduct: item.product._id,
      });

      return orderItem._id;
    })
  );

  order.items = orderItems;
  await order.save();

  if (cart.couponCode) {
    await Coupon.findOneAndUpdate({ code: cart.couponCode }, { $inc: { usedCount: 1 } });
  }

  cart.items = [];
  cart.couponCode = undefined;
  await cart.save();

  try {
    await sendEmail({
      to: address.email || req.account.email,
      subject: "Order Confirmed - E-Shop",
      html: `<p>Your order has been placed successfully.</p>
             <p>Order Total: ₹${totals.grandTotal.toLocaleString("en-IN")}</p>
             <p>Estimated delivery: ${order.estimatedDelivery.toDateString()}</p>`,
    });
  } catch (err) {
    console.error("Order confirmation email failed:", err.message);
  }

  await sendNotification({
    recipient: req.account._id,
    recipientModel: "User",
    title: "Order Placed",
    message: `Your order has been placed successfully. Total: ₹${totals.grandTotal.toLocaleString("en-IN")}`,
    type: "ORDER_PLACED",
    relatedOrder: order._id,
  });

  const populatedOrder = await Order.findById(order._id).populate({
    path: "items",
    populate: { path: "product", select: "title images" },
  });

  return successResponse(res, 201, "Order placed successfully", { order: populatedOrder });
});

/**
 * @route GET /api/orders
 * User's own order history.
 */
export const getUserOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({ user: req.account._id })
    .populate({ path: "items", populate: { path: "product", select: "title images" } })
    .sort({ createdAt: -1 });

  return successResponse(res, 200, "Orders fetched successfully", { orders });
});

/**
 * @route GET /api/orders/:id
 */
export const getOrderById = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id).populate({
    path: "items",
    populate: [
      { path: "product", select: "title images" },
      { path: "seller", select: "storeName" },
    ],
  });

  if (!order) throw new ApiError(404, "Order not found");
  if (order.user.toString() !== req.account._id.toString()) {
    throw new ApiError(403, "Not authorized to view this order");
  }

  return successResponse(res, 200, "Order fetched successfully", { order });
});

/**
 * @route PATCH /api/orders/:id/cancel
 * User cancels the whole order — only allowed before any item ships.
 */
export const cancelOrder = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id).populate("items");
  if (!order) throw new ApiError(404, "Order not found");
  if (order.user.toString() !== req.account._id.toString()) {
    throw new ApiError(403, "Not authorized to cancel this order");
  }

  const nonCancellableStatuses = ["Shipped", "Out For Delivery", "Delivered"];
  const hasShippedItem = order.items.some((item) => nonCancellableStatuses.includes(item.status));
  if (hasShippedItem) {
    throw new ApiError(400, "This order can no longer be cancelled — an item has already shipped");
  }

  await Promise.all(
    order.items.map(async (item) => {
      item.status = "Cancelled";
      item.statusHistory.push({ status: "Cancelled" });
      await item.save();

      // Restore stock
      await Product.findByIdAndUpdate(item.product, {
        $inc: { stock: item.quantity, totalSold: -item.quantity },
      });

      await sendNotification({
        recipient: item.seller,
        recipientModel: "Seller",
        title: "Order Cancelled",
        message: "A customer cancelled an order containing your product",
        type: "ORDER_CANCELLED",
        relatedOrder: order._id,
      });
    })
  );

  await sendNotification({
    recipient: req.account._id,
    recipientModel: "User",
    title: "Order Cancelled",
    message: "Your order has been cancelled successfully",
    type: "ORDER_CANCELLED",
    relatedOrder: order._id,
  });

  return successResponse(res, 200, "Order cancelled successfully");
});

/**
 * @route POST /api/orders/:id/return
 */
export const requestReturn = asyncHandler(async (req, res) => {
  const { reason } = req.body;
  const order = await Order.findById(req.params.id).populate("items");

  if (!order) throw new ApiError(404, "Order not found");
  if (order.user.toString() !== req.account._id.toString()) {
    throw new ApiError(403, "Not authorized for this order");
  }

  const allDelivered = order.items.every((item) => item.status === "Delivered");
  if (!allDelivered) {
    throw new ApiError(400, "Returns can only be requested after delivery");
  }

  order.returnRequested = true;
  order.returnReason = reason;
  order.refundStatus = "Requested";
  await order.save();

  return successResponse(res, 200, "Return request submitted successfully", { order });
});

/**
 * @route PATCH /api/orders/:id/refund
 * Seller/owner-side approval of a return → refund.
 */
export const processRefund = asyncHandler(async (req, res) => {
  const { approve } = req.body;
  const order = await Order.findById(req.params.id);
  if (!order) throw new ApiError(404, "Order not found");

  order.refundStatus = approve ? "Refunded" : "Rejected";
  if (approve) order.paymentStatus = "Refunded";
  await order.save();

  await sendNotification({
    recipient: order.user,
    recipientModel: "User",
    title: approve ? "Refund Issued" : "Return Rejected",
    message: approve
      ? "Your refund has been processed successfully"
      : "Your return request was not approved",
    type: "REFUND_ISSUED",
    relatedOrder: order._id,
  });

  return successResponse(res, 200, "Refund status updated", { order });
});

/**
 * @route POST /api/orders/:id/reorder
 * Adds all items from a past order back into the current cart.
 */
export const reorder = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id).populate({
    path: "items",
    populate: { path: "product" },
  });
  if (!order) throw new ApiError(404, "Order not found");
  if (order.user.toString() !== req.account._id.toString()) {
    throw new ApiError(403, "Not authorized for this order");
  }

  let cart = await Cart.findOne({ user: req.account._id });
  if (!cart) cart = await Cart.create({ user: req.account._id, items: [] });

  order.items.forEach((item) => {
    if (!item.product || item.product.stock < 1) return; // skip discontinued/out-of-stock items
    cart.items.push({
      product: item.product._id,
      quantity: item.quantity,
      color: item.color,
      size: item.size,
      priceAtAdd: item.product.discountPrice || item.product.price,
    });
  });

  await cart.save();
  return successResponse(res, 200, "Items added to cart", { cart });
});

// ---- Seller-side order management ----

const SELLER_TRANSITIONS = {
  "Order Placed": ["Seller Accepted", "Cancelled"],
  "Seller Accepted": ["Packed", "Cancelled"],
  Packed: ["Shipped"],
  Shipped: ["Out For Delivery"],
  "Out For Delivery": ["Delivered"],
};

const NOTIFICATION_TYPE_BY_STATUS = {
  "Seller Accepted": "ORDER_ACCEPTED",
  Cancelled: "ORDER_REJECTED",
  Packed: "ORDER_PACKED",
  Shipped: "ORDER_SHIPPED",
  "Out For Delivery": "ORDER_OUT_FOR_DELIVERY",
  Delivered: "ORDER_DELIVERED",
};

/**
 * @route PATCH /api/seller/order-items/:id/status
 * Seller updates the fulfillment status of one of their own order items.
 * Enforces a valid state machine so items can't skip steps illogically.
 */
export const updateOrderItemStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  if (!ORDER_STATUS.includes(status)) throw new ApiError(400, "Invalid status value");

  const orderItem = await OrderItem.findById(req.params.id).populate("product", "title");
  if (!orderItem) throw new ApiError(404, "Order item not found");
  if (orderItem.seller.toString() !== req.account._id.toString()) {
    throw new ApiError(403, "You do not manage this order item");
  }

  const allowedNext = SELLER_TRANSITIONS[orderItem.status] || [];
  if (!allowedNext.includes(status)) {
    throw new ApiError(
      400,
      `Cannot move from "${orderItem.status}" to "${status}". Allowed: ${allowedNext.join(", ") || "none"}`
    );
  }

  orderItem.status = status;
  orderItem.statusHistory.push({ status });
  await orderItem.save();

  const order = await Order.findById(orderItem.order);

  await sendNotification({
    recipient: order.user,
    recipientModel: "User",
    title: `Order ${status}`,
    message: `Your item "${orderItem.product.title}" is now: ${status}`,
    type: NOTIFICATION_TYPE_BY_STATUS[status] || "GENERAL",
    relatedOrder: order._id,
  });

  return successResponse(res, 200, `Order item status updated to ${status}`, { orderItem });
});

/**
 * @route GET /api/seller/order-items
 */
export const getSellerOrderItems = asyncHandler(async (req, res) => {
  const { status } = req.query;

  const filter = { seller: req.account._id };
  if (status) filter.status = status;

  const items = await OrderItem.find(filter)
    .populate("product", "title images")
    .populate({ path: "order", populate: { path: "user", select: "fullName email phone" } })
    .sort({ createdAt: -1 });

  return successResponse(res, 200, "Order items fetched successfully", { items });
});
