import asyncHandler from "express-async-handler";
import Address from "../models/address.model.js";
import User from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { successResponse } from "../utils/apiResponse.js";

/**
 * @route GET /api/addresses
 */
export const getAddresses = asyncHandler(async (req, res) => {
  const addresses = await Address.find({ user: req.account._id }).sort({
    isDefault: -1,
    createdAt: -1,
  });
  return successResponse(res, 200, "Addresses fetched successfully", { addresses });
});

/**
 * @route POST /api/addresses
 */
export const addAddress = asyncHandler(async (req, res) => {
  const {
    fullName, phone, alternatePhone, email,
    country, state, city, pincode, streetAddress, landmark,
    addressType, deliveryInstructions, isDefault,
  } = req.body;

  if (!fullName || !phone || !country || !state || !city || !pincode || !streetAddress) {
    throw new ApiError(400, "Missing required address fields");
  }

  if (isDefault) {
    await Address.updateMany({ user: req.account._id }, { $set: { isDefault: false } });
  }

  const address = await Address.create({
    user: req.account._id,
    fullName, phone, alternatePhone, email,
    country, state, city, pincode, streetAddress, landmark,
    addressType, deliveryInstructions,
    isDefault: !!isDefault,
  });

  await User.findByIdAndUpdate(req.account._id, { $push: { addresses: address._id } });

  return successResponse(res, 201, "Address added successfully", { address });
});

/**
 * @route PATCH /api/addresses/:id
 */
export const updateAddress = asyncHandler(async (req, res) => {
  const address = await Address.findById(req.params.id);
  if (!address) throw new ApiError(404, "Address not found");
  if (address.user.toString() !== req.account._id.toString()) {
    throw new ApiError(403, "Not authorized to edit this address");
  }

  const updatableFields = [
    "fullName", "phone", "alternatePhone", "email", "country", "state", "city",
    "pincode", "streetAddress", "landmark", "addressType", "deliveryInstructions",
  ];
  updatableFields.forEach((field) => {
    if (req.body[field] !== undefined) address[field] = req.body[field];
  });

  if (req.body.isDefault) {
    await Address.updateMany(
      { user: req.account._id, _id: { $ne: address._id } },
      { $set: { isDefault: false } }
    );
    address.isDefault = true;
  }

  await address.save();
  return successResponse(res, 200, "Address updated successfully", { address });
});

/**
 * @route DELETE /api/addresses/:id
 */
export const deleteAddress = asyncHandler(async (req, res) => {
  const address = await Address.findById(req.params.id);
  if (!address) throw new ApiError(404, "Address not found");
  if (address.user.toString() !== req.account._id.toString()) {
    throw new ApiError(403, "Not authorized to delete this address");
  }

  await address.deleteOne();
  await User.findByIdAndUpdate(req.account._id, { $pull: { addresses: address._id } });

  return successResponse(res, 200, "Address deleted successfully");
});
