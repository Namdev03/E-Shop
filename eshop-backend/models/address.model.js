import mongoose from "mongoose";
import { ADDRESS_TYPES } from "../constants/index.js";

const { Schema, model } = mongoose;

const addressSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },

    fullName: { type: String, required: true },
    phone: { type: String, required: true },
    alternatePhone: String,
    email: String,

    country: { type: String, required: true },
    state: { type: String, required: true },
    city: { type: String, required: true },
    pincode: { type: String, required: true },
    streetAddress: { type: String, required: true },
    landmark: String,

    addressType: {
      type: String,
      enum: ADDRESS_TYPES,
      default: "Home",
    },

    deliveryInstructions: String,

    isDefault: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const Address = model("Address", addressSchema);
export default Address;
