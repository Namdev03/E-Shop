import mongoose from "mongoose";
import { PAYMENT_METHODS, PAYMENT_STATUS } from "../constants/index.js";

const { Schema, model } = mongoose;

const orderSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },

    items: [
      {
        type: Schema.Types.ObjectId,
        ref: "OrderItem",
      },
    ],

    shippingAddress: {
      fullName: String,
      phone: String,
      alternatePhone: String,
      email: String,
      country: String,
      state: String,
      city: String,
      pincode: String,
      streetAddress: String,
      landmark: String,
      addressType: String,
      deliveryInstructions: String,
    },

    subtotal: { type: Number, required: true },
    shippingCharge: { type: Number, default: 0 },
    tax: { type: Number, default: 0 },
    discount: { type: Number, default: 0 },
    grandTotal: { type: Number, required: true },

    couponCode: String,

    paymentMethod: {
      type: String,
      enum: PAYMENT_METHODS,
      default: "COD",
    },
    paymentStatus: {
      type: String,
      enum: PAYMENT_STATUS,
      default: "Pending",
    },
    // Populated once Stripe/Razorpay integration is wired in — schema is
    // ready for it now so adding real payment processing later needs no migration.
    paymentIntentId: String,
    paymentProviderRef: String,

    estimatedDelivery: Date,

    invoiceUrl: String,

    returnRequested: { type: Boolean, default: false },
    returnReason: String,
    refundStatus: {
      type: String,
      enum: ["None", "Requested", "Approved", "Rejected", "Refunded"],
      default: "None",
    },
  },
  { timestamps: true }
);

const Order = model("Order", orderSchema);
export default Order;
