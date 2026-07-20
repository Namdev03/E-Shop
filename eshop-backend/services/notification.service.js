import Notification from "../models/notification.model.js";
import { emitToAccount } from "../socket/index.js";

/**
 * Every real-time notification in the app goes through this single
 * function so the DB record (for the notification bell / history) and
 * the live Socket.IO push always stay in sync — no controller ever emits
 * without persisting, or persists without emitting.
 */
export const sendNotification = async ({
  recipient,
  recipientModel, // "User" | "Seller"
  title,
  message,
  type = "GENERAL",
  relatedOrder,
  relatedProduct,
}) => {
  const notification = await Notification.create({
    recipient,
    recipientModel,
    title,
    message,
    type,
    relatedOrder,
    relatedProduct,
  });

  const role = recipientModel === "Seller" ? "seller" : "user";
  emitToAccount(role, recipient.toString(), "notification:new", notification);

  return notification;
};
