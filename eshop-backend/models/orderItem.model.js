import mongoose from "mongoose";
import { ORDER_STATUS } from "../constants/index.js";

const { Schema, model } = mongoose;

/**
 * A single Order can contain items from multiple sellers. Each seller
 * manages the fulfillment status of *their own* items independently
 * (accept/pack/ship), so status lives here rather than only on Order.
 */
const orderItemSchema = new Schema(
  {
    order: { type: Schema.Types.ObjectId, ref: "Order", required: true },
    product: { type: Schema.Types.ObjectId, ref: "Product", required: true },
    seller: { type: Schema.Types.ObjectId, ref: "Seller", required: true },

    quantity: { type: Number, required: true, min: 1 },
    color: String,
    size: String,

    priceAtPurchase: { type: Number, required: true },

    status: {
      type: String,
      enum: ORDER_STATUS,
      default: "Order Placed",
    },
    statusHistory: [
      {
        status: { type: String, enum: ORDER_STATUS },
        changedAt: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

const OrderItem = model("OrderItem", orderItemSchema);
export default OrderItem;
