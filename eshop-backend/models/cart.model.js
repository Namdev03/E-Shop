import mongoose from "mongoose";

const { Schema, model } = mongoose;

const cartItemSchema = new Schema(
  {
    product: { type: Schema.Types.ObjectId, ref: "Product", required: true },
    quantity: { type: Number, required: true, min: 1, default: 1 },
    color: String, // selected color variant name, if any
    size: String, // selected size variant name, if any
    priceAtAdd: { type: Number, required: true }, // snapshot so price changes don't silently alter the cart
  },
  { _id: false }
);

const cartSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true, // one cart per user
    },
    items: [cartItemSchema],
    couponCode: String,
  },
  { timestamps: true }
);

const Cart = model("Cart", cartSchema);
export default Cart;
