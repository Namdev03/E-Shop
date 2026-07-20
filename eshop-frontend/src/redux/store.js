import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/authSlice.js";
import userReducer from "./slices/userSlice.js";
import sellerReducer from "./slices/sellerSlice.js";
import productReducer from "./slices/productSlice.js";
import cartReducer from "./slices/cartSlice.js";
import wishlistReducer from "./slices/wishlistSlice.js";
import addressReducer from "./slices/addressSlice.js";
import orderReducer from "./slices/orderSlice.js";
import notificationReducer from "./slices/notificationSlice.js";
import contactReducer from "./slices/contactSlice.js";
import couponReducer from "./slices/couponSlice.js";
import reviewReducer from "./slices/reviewSlice.js";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    user: userReducer,
    seller: sellerReducer,
    product: productReducer,
    cart: cartReducer,
    wishlist: wishlistReducer,
    address: addressReducer,
    order: orderReducer,
    notification: notificationReducer,
    contact: contactReducer,
    coupon: couponReducer,
    review: reviewReducer,
  },
});
