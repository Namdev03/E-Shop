import asyncHandler from "express-async-handler";
import Product from "../models/product.model.js";
import User from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { successResponse } from "../utils/apiResponse.js";
import { uploadMultipleToCloudinary, deleteFromCloudinary } from "../utils/uploadToCloudinary.js";
import { generateUniqueSlug, generateSku } from "../utils/slugGenerator.js";

const SORT_OPTIONS = {
  newest: { createdAt: -1 },
  price_low_high: { price: 1 },
  price_high_low: { price: -1 },
  rating: { ratings: -1 },
  popularity: { totalViews: -1 },
  best_selling: { totalSold: -1 },
};

/**
 * @route POST /api/products
 * Seller only. Expects multipart/form-data with `images` files plus
 * JSON-stringified colorVariants/sizeVariants/specifications.
 */
export const createProduct = asyncHandler(async (req, res) => {
  const {
    title,
    description,
    brand,
    category,
    subCategory,
    price,
    discountPrice,
    stock,
    weight,
    dimensions,
    colorVariants,
    sizeVariants,
    specifications,
    status,
  } = req.body;

  if (!title || !description || !category || !price) {
    throw new ApiError(400, "Title, description, category, and price are required");
  }

  const images = await uploadMultipleToCloudinary(req.files || [], "eshop/products");

  const product = await Product.create({
    title,
    slug: generateUniqueSlug(title),
    description,
    brand: brand || undefined,
    category,
    subCategory: subCategory || undefined,
    price,
    discountPrice: discountPrice || undefined,
    stock: stock || 0,
    sku: generateSku("PRD"),
    weight,
    dimensions: dimensions ? JSON.parse(dimensions) : undefined,
    colorVariants: colorVariants ? JSON.parse(colorVariants) : [],
    sizeVariants: sizeVariants ? JSON.parse(sizeVariants) : [],
    specifications: specifications ? JSON.parse(specifications) : [],
    images,
    seller: req.account._id,
    status: status === "Published" ? "Published" : "Draft",
  });

  return successResponse(res, 201, "Product created successfully", { product });
});

/**
 * @route PATCH /api/products/:id
 * Seller only, and only the seller who created it.
 */
export const updateProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) throw new ApiError(404, "Product not found");

  if (product.seller.toString() !== req.account._id.toString()) {
    throw new ApiError(403, "You do not own this product");
  }

  const updatableFields = [
    "title", "description", "brand", "category", "subCategory",
    "price", "discountPrice", "stock", "weight", "status",
  ];

  updatableFields.forEach((field) => {
    if (req.body[field] !== undefined) product[field] = req.body[field];
  });

  ["dimensions", "colorVariants", "sizeVariants", "specifications"].forEach((field) => {
    if (req.body[field] !== undefined) {
      product[field] =
        typeof req.body[field] === "string" ? JSON.parse(req.body[field]) : req.body[field];
    }
  });

  if (req.files?.length) {
    const newImages = await uploadMultipleToCloudinary(req.files, "eshop/products");
    product.images.push(...newImages);
  }

  await product.save();
  return successResponse(res, 200, "Product updated successfully", { product });
});

/**
 * @route PATCH /api/products/:id/publish
 * @route PATCH /api/products/:id/draft
 */
export const setProductStatus = (status) =>
  asyncHandler(async (req, res) => {
    const product = await Product.findById(req.params.id);
    if (!product) throw new ApiError(404, "Product not found");

    if (product.seller.toString() !== req.account._id.toString()) {
      throw new ApiError(403, "You do not own this product");
    }

    product.status = status;
    await product.save();

    return successResponse(res, 200, `Product ${status.toLowerCase()} successfully`, { product });
  });

/**
 * @route DELETE /api/products/:id
 */
export const deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) throw new ApiError(404, "Product not found");

  if (product.seller.toString() !== req.account._id.toString()) {
    throw new ApiError(403, "You do not own this product");
  }

  const allImages = [
    ...product.images,
    ...product.colorVariants.flatMap((v) => v.images || []),
  ];
  await Promise.all(allImages.map((img) => deleteFromCloudinary(img.publicId)));

  await product.deleteOne();
  return successResponse(res, 200, "Product deleted successfully");
});

/**
 * @route GET /api/products
 * Public. Search + filters + sorting + pagination, and the homepage
 * sections (featured/trending/flashSale/newArrivals/bestSellers) via flags.
 */
export const getAllProducts = asyncHandler(async (req, res) => {
  const {
    q,
    category,
    brand,
    minPrice,
    maxPrice,
    minRating,
    minDiscount,
    inStock,
    featured,
    trending,
    flashSale,
    newArrivals,
    bestSellers,
    sort = "newest",
    page = 1,
    limit = 20,
  } = req.query;

  const filter = { status: "Published" };

  if (q) filter.$text = { $search: q };
  if (category) filter.category = category;
  if (brand) filter.brand = brand;
  if (inStock === "true") filter.stock = { $gt: 0 };
  if (minRating) filter.ratings = { $gte: Number(minRating) };
  if (featured === "true") filter.isFeatured = true;
  if (trending === "true") filter.isTrending = true;
  if (flashSale === "true") {
    filter.isFlashSale = true;
    filter.flashSaleEndsAt = { $gt: new Date() };
  }

  if (minPrice || maxPrice) {
    filter.price = {};
    if (minPrice) filter.price.$gte = Number(minPrice);
    if (maxPrice) filter.price.$lte = Number(maxPrice);
  }

  if (newArrivals === "true") {
    filter.createdAt = { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) };
  }

  let sortOption = SORT_OPTIONS[sort] || SORT_OPTIONS.newest;
  if (bestSellers === "true") sortOption = SORT_OPTIONS.best_selling;

  const pageNum = Math.max(Number(page), 1);
  const limitNum = Math.max(Number(limit), 1);
  const skip = (pageNum - 1) * limitNum;

  const [products, total] = await Promise.all([
    Product.find(filter)
      .populate("brand", "name logo")
      .populate("category", "name slug")
      .populate("seller", "storeName isVerifiedSeller")
      .sort(sortOption)
      .skip(skip)
      .limit(limitNum),
    Product.countDocuments(filter),
  ]);

  const filtered = minDiscount
    ? products.filter((p) => p.discountPercent >= Number(minDiscount))
    : products;

  return successResponse(res, 200, "Products fetched successfully", {
    products: filtered,
    pagination: {
      total,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(total / limitNum),
    },
  });
});

/**
 * @route GET /api/products/search-suggestions?q=
 */
export const getSearchSuggestions = asyncHandler(async (req, res) => {
  const { q } = req.query;
  if (!q || q.trim().length < 2) {
    return successResponse(res, 200, "No query provided", { suggestions: [] });
  }

  const suggestions = await Product.find({
    status: "Published",
    title: { $regex: q, $options: "i" },
  })
    .select("title slug images price")
    .limit(8);

  return successResponse(res, 200, "Suggestions fetched successfully", { suggestions });
});

/**
 * @route GET /api/products/:slug
 * Public. Increments views, tracks recently-viewed for logged-in users,
 * and returns related products from the same category.
 */
export const getProductBySlug = asyncHandler(async (req, res) => {
  const product = await Product.findOne({ slug: req.params.slug })
    .populate("brand", "name logo")
    .populate("category", "name slug")
    .populate("seller", "storeName storeLogo isVerifiedSeller");

  if (!product) throw new ApiError(404, "Product not found");

  product.totalViews += 1;
  await product.save();

  if (req.account && req.role === "user") {
    const user = await User.findById(req.account._id);
    user.recentlyViewed = user.recentlyViewed.filter(
      (rv) => rv.product.toString() !== product._id.toString()
    );
    user.recentlyViewed.unshift({ product: product._id, viewedAt: new Date() });
    user.recentlyViewed = user.recentlyViewed.slice(0, 20);
    await user.save();
  }

  const relatedProducts = await Product.find({
    category: product.category,
    _id: { $ne: product._id },
    status: "Published",
  }).limit(8);

  return successResponse(res, 200, "Product fetched successfully", {
    product,
    relatedProducts,
  });
});

/**
 * @route GET /api/seller/products
 */
export const getSellerProducts = asyncHandler(async (req, res) => {
  const products = await Product.find({ seller: req.account._id }).sort({ createdAt: -1 });
  return successResponse(res, 200, "Products fetched successfully", { products });
});
