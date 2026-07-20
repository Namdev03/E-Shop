import mongoose from "mongoose";

const { Schema, model } = mongoose;

const brandSchema = new Schema(
  {
    name: { type: String, required: true, trim: true, unique: true },
    slug: { type: String, required: true, unique: true, lowercase: true },
    logo: {
      publicId: String,
      url: String,
    },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const Brand = model("Brand", brandSchema);
export default Brand;
