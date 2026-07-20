import mongoose from "mongoose";

const { Schema, model } = mongoose;

const categorySchema = new Schema(
  {
    name: { type: String, required: true, trim: true, unique: true },
    slug: { type: String, required: true, unique: true, lowercase: true },
    image: {
      publicId: String,
      url: String,
    },
    parentCategory: {
      type: Schema.Types.ObjectId,
      ref: "Category",
      default: null, // null = top-level category, set = subcategory
    },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const Category = model("Category", categorySchema);
export default Category;
