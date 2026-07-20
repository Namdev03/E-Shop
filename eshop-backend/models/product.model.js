import mongoose from "mongoose";
import { PRODUCT_STATUS } from "../constants/index.js";

const { Schema, model } = mongoose;

const imageSchema = new Schema({ publicId: String, url: String }, { _id: false });

const colorVariantSchema = new Schema(
  {
    name: { type: String, required: true }, // e.g. "Midnight Blue"
    hexCode: String,
    images: [imageSchema],
    stock: { type: Number, default: 0 },
  },
  { _id: false }
);

const sizeVariantSchema = new Schema(
  {
    size: { type: String, required: true }, // e.g. "M", "42", "500ml"
    stock: { type: Number, default: 0 },
    priceOverride: Number, // optional — some sizes cost more (e.g. XXL)
  },
  { _id: false }
);

const specificationSchema = new Schema(
  { key: { type: String, required: true }, value: { type: String, required: true } },
  { _id: false }
);

const productSchema = new Schema(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true },
    description: { type: String, required: true },

    brand: { type: Schema.Types.ObjectId, ref: "Brand" },
    category: { type: Schema.Types.ObjectId, ref: "Category", required: true },
    subCategory: { type: Schema.Types.ObjectId, ref: "Category" },

    price: { type: Number, required: true },
    discountPrice: Number,

    images: [imageSchema],

    stock: { type: Number, required: true, default: 0 },
    sku: { type: String, required: true, unique: true },

    weight: Number,
    dimensions: {
      length: Number,
      width: Number,
      height: Number,
    },

    colorVariants: [colorVariantSchema],
    sizeVariants: [sizeVariantSchema],
    specifications: [specificationSchema],

    seller: { type: Schema.Types.ObjectId, ref: "Seller", required: true },

    ratings: { type: Number, default: 0 },
    reviewsCount: { type: Number, default: 0 },

    isFeatured: { type: Boolean, default: false },
    isTrending: { type: Boolean, default: false },
    isFlashSale: { type: Boolean, default: false },
    flashSaleEndsAt: Date,

    totalSold: { type: Number, default: 0 },
    totalViews: { type: Number, default: 0 },

    status: {
      type: String,
      enum: PRODUCT_STATUS,
      default: "Draft",
    },
  },
  { timestamps: true }
);

// Discount % is derived, not stored, so it never drifts out of sync with price/discountPrice
productSchema.virtual("discountPercent").get(function () {
  if (!this.discountPrice || this.discountPrice >= this.price) return 0;
  return Math.round(((this.price - this.discountPrice) / this.price) * 100);
});
productSchema.set("toJSON", { virtuals: true });
productSchema.set("toObject", { virtuals: true });

productSchema.index({ title: "text", description: "text" });
productSchema.index({ category: 1, brand: 1, status: 1 });
productSchema.index({ price: 1 });
productSchema.index({ isFeatured: 1, isTrending: 1, isFlashSale: 1 });

const Product = model("Product", productSchema);
export default Product;
