import mongoose from "mongoose";
import { NOTIFICATION_TYPES } from "../constants/index.js";

const { Schema, model } = mongoose;

const notificationSchema = new Schema(
  {
    recipient: {
      type: Schema.Types.ObjectId,
      required: true,
      refPath: "recipientModel",
    },
    recipientModel: {
      type: String,
      required: true,
      enum: ["User", "Seller"],
    },

    title: { type: String, required: true },
    message: { type: String, required: true },

    type: {
      type: String,
      enum: NOTIFICATION_TYPES,
      default: "GENERAL",
    },

    relatedOrder: { type: Schema.Types.ObjectId, ref: "Order" },
    relatedProduct: { type: Schema.Types.ObjectId, ref: "Product" },

    isRead: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const Notification = model("Notification", notificationSchema);
export default Notification;
