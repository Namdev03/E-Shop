import mongoose from "mongoose";

const { Schema, model } = mongoose;

const contactMessageSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true },
    phone: String,
    subject: { type: String, required: true, trim: true },
    message: { type: String, required: true },
    isResolved: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const ContactMessage = model("ContactMessage", contactMessageSchema);
export default ContactMessage;
