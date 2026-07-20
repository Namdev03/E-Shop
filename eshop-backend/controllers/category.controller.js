import asyncHandler from "express-async-handler";
import Category from "../models/category.model.js";
import { ApiError } from "../utils/ApiError.js";
import { successResponse } from "../utils/apiResponse.js";
import { uploadBufferToCloudinary, deleteFromCloudinary } from "../utils/uploadToCloudinary.js";
import slugify from "slugify";

/**
 * @route GET /api/categories
 * Public. Returns top-level categories with their subcategories nested.
 */
export const getAllCategories = asyncHandler(async (req, res) => {
  const categories = await Category.find({ parentCategory: null, isActive: true }).lean();

  const withSubcategories = await Promise.all(
    categories.map(async (cat) => {
      const subCategories = await Category.find({
        parentCategory: cat._id,
        isActive: true,
      }).lean();
      return { ...cat, subCategories };
    })
  );

  return successResponse(res, 200, "Categories fetched successfully", {
    categories: withSubcategories,
  });
});

/**
 * @route POST /api/categories
 * Admin-style creation — in this schema any authenticated seller may
 * propose categories; swap for an admin-only middleware if you add that role.
 */
export const createCategory = asyncHandler(async (req, res) => {
  const { name, parentCategory } = req.body;
  if (!name) throw new ApiError(400, "Category name is required");

  const slug = slugify(name, { lower: true, strict: true });

  const existing = await Category.findOne({ slug });
  if (existing) throw new ApiError(409, "A category with this name already exists");

  let image;
  if (req.file) {
    const uploaded = await uploadBufferToCloudinary(req.file.buffer, "eshop/categories");
    image = { url: uploaded.url, publicId: uploaded.publicId };
  }

  const category = await Category.create({
    name,
    slug,
    parentCategory: parentCategory || null,
    image,
  });

  return successResponse(res, 201, "Category created successfully", { category });
});

/**
 * @route DELETE /api/categories/:id
 */
export const deleteCategory = asyncHandler(async (req, res) => {
  const category = await Category.findById(req.params.id);
  if (!category) throw new ApiError(404, "Category not found");

  const hasSubcategories = await Category.exists({ parentCategory: category._id });
  if (hasSubcategories) {
    throw new ApiError(400, "Delete or reassign subcategories before deleting this category");
  }

  if (category.image?.publicId) {
    await deleteFromCloudinary(category.image.publicId);
  }

  await category.deleteOne();
  return successResponse(res, 200, "Category deleted successfully");
});
