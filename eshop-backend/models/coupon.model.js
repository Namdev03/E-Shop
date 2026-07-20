import mongoose from "mongoose";

const { Schema, model } = mongoose;

const couponSchema = new Schema(
  {
    code: { type: String, required: true, unique: true, uppercase: true, trim: true },
    description: String,

    discountType: {
      type: String,
      enum: ["Percentage", "Flat"],
      required: true,
    },
    discountValue: { type: Number, required: true },
    maxDiscountAmount: Number, // caps a percentage discount, e.g. "20% off, up to ₹500"
    minOrderValue: { type: Number, default: 0 },

    usageLimit: Number, // total redemptions allowed across all users; null = unlimited
    usageLimitPerUser: { type: Number, default: 1 },
    usedCount: { type: Number, default: 0 },

    applicableCategories: [{ type: Schema.Types.ObjectId, ref: "Category" }],
    applicableProducts: [{ type: Schema.Types.ObjectId, ref: "Product" }],

    startsAt: { type: Date, default: Date.now },
    expiresAt: { type: Date, required: true },

    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const Coupon = model("Coupon", couponSchema);
export default Coupon;
