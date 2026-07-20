export const ORDER_STATUS = [
  "Order Placed",
  "Seller Accepted",
  "Packed",
  "Shipped",
  "Out For Delivery",
  "Delivered",
  "Cancelled",
  "Returned",
  "Refunded",
];

export const PAYMENT_METHODS = ["COD", "Stripe", "Razorpay"];

export const PAYMENT_STATUS = ["Pending", "Paid", "Failed", "Refunded"];

export const PRODUCT_STATUS = ["Draft", "Published"];

export const ADDRESS_TYPES = ["Home", "Office"];

export const NOTIFICATION_TYPES = [
  "ORDER_PLACED",
  "ORDER_ACCEPTED",
  "ORDER_REJECTED",
  "ORDER_PACKED",
  "ORDER_SHIPPED",
  "ORDER_OUT_FOR_DELIVERY",
  "ORDER_DELIVERED",
  "ORDER_CANCELLED",
  "REFUND_ISSUED",
  "BACK_IN_STOCK",
  "FLASH_SALE",
  "COUPON_AVAILABLE",
  "GENERAL",
];

export const OTP_PURPOSES = ["MOBILE_VERIFY", "PASSWORD_RESET"];

export const OTP_EXPIRY_MINUTES = 10;
export const OTP_MAX_ATTEMPTS = 5;
