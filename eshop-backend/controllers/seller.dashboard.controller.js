import asyncHandler from "express-async-handler";
import OrderItem from "../models/orderItem.model.js";
import Product from "../models/product.model.js";
import { successResponse } from "../utils/apiResponse.js";

/**
 * @route GET /api/seller/dashboard/stats
 */
export const getSellerDashboardStats = asyncHandler(async (req, res) => {
  const sellerId = req.account._id;

  const [totalProducts, publishedProducts, items] = await Promise.all([
    Product.countDocuments({ seller: sellerId }),
    Product.countDocuments({ seller: sellerId, status: "Published" }),
    OrderItem.find({ seller: sellerId }),
  ]);

  const totalOrders = items.length;
  const revenue = items
    .filter((i) => !["Cancelled", "Returned"].includes(i.status))
    .reduce((sum, i) => sum + i.priceAtPurchase * i.quantity, 0);

  const uniqueCustomerOrders = new Set(items.map((i) => i.order.toString()));

  return successResponse(res, 200, "Dashboard stats fetched successfully", {
    totalProducts,
    publishedProducts,
    totalOrders,
    totalCustomers: uniqueCustomerOrders.size,
    revenue,
  });
});

/**
 * @route GET /api/seller/dashboard/revenue-report?period=monthly|yearly
 */
export const getRevenueReport = asyncHandler(async (req, res) => {
  const { period = "monthly" } = req.query;
  const sellerId = req.account._id;

  const dateFormat = period === "yearly" ? "%Y" : "%Y-%m";

  const report = await OrderItem.aggregate([
    { $match: { seller: sellerId, status: { $nin: ["Cancelled", "Returned"] } } },
    {
      $group: {
        _id: { $dateToString: { format: dateFormat, date: "$createdAt" } },
        revenue: { $sum: { $multiply: ["$priceAtPurchase", "$quantity"] } },
        orders: { $sum: 1 },
      },
    },
    { $sort: { _id: 1 } },
  ]);

  return successResponse(res, 200, "Revenue report fetched successfully", { report });
});

/**
 * @route GET /api/seller/dashboard/top-products
 */
export const getTopProducts = asyncHandler(async (req, res) => {
  const products = await Product.find({ seller: req.account._id })
    .sort({ totalSold: -1 })
    .limit(10)
    .select("title images totalSold price");

  return successResponse(res, 200, "Top products fetched successfully", { products });
});

/**
 * @route GET /api/seller/dashboard/top-customers
 */
export const getTopCustomers = asyncHandler(async (req, res) => {
  const sellerId = req.account._id;

  const topCustomers = await OrderItem.aggregate([
    { $match: { seller: sellerId, status: { $nin: ["Cancelled", "Returned"] } } },
    {
      $lookup: {
        from: "orders",
        localField: "order",
        foreignField: "_id",
        as: "orderInfo",
      },
    },
    { $unwind: "$orderInfo" },
    {
      $group: {
        _id: "$orderInfo.user",
        totalSpent: { $sum: { $multiply: ["$priceAtPurchase", "$quantity"] } },
        orderCount: { $sum: 1 },
      },
    },
    { $sort: { totalSpent: -1 } },
    { $limit: 10 },
    {
      $lookup: {
        from: "users",
        localField: "_id",
        foreignField: "_id",
        as: "user",
      },
    },
    { $unwind: "$user" },
    {
      $project: {
        totalSpent: 1,
        orderCount: 1,
        "user.fullName": 1,
        "user.email": 1,
      },
    },
  ]);

  return successResponse(res, 200, "Top customers fetched successfully", { topCustomers });
});
