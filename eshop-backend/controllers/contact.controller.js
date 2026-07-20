import asyncHandler from "express-async-handler";
import ContactMessage from "../models/contactMessage.model.js";
import { ApiError } from "../utils/ApiError.js";
import { successResponse } from "../utils/apiResponse.js";
import { sendEmail } from "../utils/sendEmail.js";

/**
 * @route POST /api/contact
 * Public.
 */
export const submitContactForm = asyncHandler(async (req, res) => {
  const { name, email, phone, subject, message } = req.body;

  if (!name || !email || !subject || !message) {
    throw new ApiError(400, "Name, email, subject, and message are required");
  }

  const contact = await ContactMessage.create({ name, email, phone, subject, message });

  try {
    await sendEmail({
      to: process.env.EMAIL,
      subject: `New Contact Form Submission: ${subject}`,
      html: `<p><strong>From:</strong> ${name} (${email})</p>
             <p><strong>Phone:</strong> ${phone || "N/A"}</p>
             <p><strong>Message:</strong></p><p>${message}</p>`,
    });
  } catch (err) {
    console.error("Contact form email failed:", err.message);
  }

  return successResponse(res, 201, "Message sent successfully", { contact });
});
