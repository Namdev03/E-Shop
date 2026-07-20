import mongoose from "mongoose";

const { Schema, model } = mongoose;

const sellerSchema = new Schema(
  {
    fullName: { type: String, required: true, trim: true },
    storeName: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    phone: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
      select: false,
    },
    storeLogo: {
      publicId: String,
      url: String,
    },

    role: { type: String, default: "seller", immutable: true },

    isEmailVerified: { type: Boolean, default: false },
    isMobileVerified: { type: Boolean, default: false },
    isVerifiedSeller: { type: Boolean, default: false }, // "seller verification badge" bonus feature

    emailVerificationToken: String,
    emailVerificationExpire: Date,

    resetPasswordToken: String,
    resetPasswordExpire: Date,

    address: { type: String, trim: true },
    city: { type: String, trim: true },
    state: { type: String, trim: true },
    country: { type: String, trim: true },
    pincode: { type: String, trim: true },

    status: {
      type: String,
      enum: ["active", "blocked", "deleted"],
      default: "active",
    },
  },
  { timestamps: true }
);

const Seller = model("Seller", sellerSchema);
export default Seller;
