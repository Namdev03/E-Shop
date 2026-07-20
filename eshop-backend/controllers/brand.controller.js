import asyncHandler from "express-async-handler";
import slugify from "slugify";
import Brand from "../models/brand.model.js";
import { ApiError } from "../utils/ApiError.js";
import { successResponse } from "../utils/apiResponse.js";
import { uploadBufferToCloudinary, deleteFromCloudinary } from "../utils/uploadToCloudinary.js";

/**
 * @route GET /api/brands
 */
export const getAllBrands = asyncHandler(async (req, res) => {
  const brands = await Brand.find({ isActive: true }).sort({ name: 1 });
  return successResponse(res, 200, "Brands fetched successfully", { brands });
});

/**
 * @route POST /api/brands
 */
export const createBrand = asyncHandler(async (req, res) => {
  const { name } = req.body;
  if (!name) throw new ApiError(400, "Brand name is required");

  const slug = slugify(name, { lower: true, strict: true });

  const existing = await Brand.findOne({ slug });
  if (existing) throw new ApiError(409, "A brand with this name already exists");

  let logo;
  if (req.file) {
    const uploaded = await uploadBufferToCloudinary(req.file.buffer, "eshop/brands");
    logo = { url: uploaded.url, publicId: uploaded.publicId };
  }

  const brand = await Brand.create({ name, slug, logo });
  return successResponse(res, 201, "Brand created successfully", { brand });
});

/**
 * @route DELETE /api/brands/:id
 */
export const deleteBrand = asyncHandler(async (req, res) => {
  const brand = await Brand.findById(req.params.id);
  if (!brand) throw new ApiError(404, "Brand not found");

  if (brand.logo?.publicId) {
    await deleteFromCloudinary(brand.logo.publicId);
  }

  await brand.deleteOne();
  return successResponse(res, 200, "Brand deleted successfully");
});
