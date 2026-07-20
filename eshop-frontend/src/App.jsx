import { Routes, Route } from "react-router";

import { MainLayout } from "./layouts/MainLayout.jsx";
import { ProtectedRoute, RoleProtectedRoute } from "./routes/ProtectedRoute.jsx";

import { Home } from "./pages/Home.jsx";
import { ProductListing } from "./pages/ProductListing.jsx";
import { ProductDetails } from "./pages/ProductDetails.jsx";
import { Cart } from "./pages/Cart.jsx";
import { Checkout } from "./pages/Checkout.jsx";
import { Contact } from "./pages/Contact.jsx";
import { Notifications } from "./pages/Notifications.jsx";
import { NotFound } from "./pages/NotFound.jsx";

import { Login } from "./pages/auth/Login.jsx";
import { Signup } from "./pages/auth/Signup.jsx";
import { SellerLogin } from "./pages/auth/SellerLogin.jsx";
import { SellerSignup } from "./pages/auth/SellerSignup.jsx";
import { VerifyMobile } from "./pages/auth/VerifyMobile.jsx";
import { VerifyEmail } from "./pages/auth/VerifyEmail.jsx";
import { ForgotPassword } from "./pages/auth/ForgotPassword.jsx";
import { ResetPasswordEmail } from "./pages/auth/ResetPasswordEmail.jsx";
import { ResetPasswordPhone } from "./pages/auth/ResetPasswordPhone.jsx";

import { Wishlist } from "./pages/user/Wishlist.jsx";
import { Addresses } from "./pages/user/Addresses.jsx";
import { UserOrders } from "./pages/user/UserOrders.jsx";
import { OrderDetails } from "./pages/user/OrderDetails.jsx";

import { SellerDashboard } from "./pages/seller/SellerDashboard.jsx";
import { SellerProducts } from "./pages/seller/SellerProducts.jsx";
import { AddProduct } from "./pages/seller/AddProduct.jsx";
import { SellerOrders } from "./pages/seller/SellerOrders.jsx";

function App() {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        {/* Public */}
        <Route path="/" element={<Home />} />
        <Route path="/products" element={<ProductListing />} />
        <Route path="/products/:slug" element={<ProductDetails />} />
        <Route path="/contact" element={<Contact />} />

        {/* User auth */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/verify-email/:token" element={<VerifyEmail role="user" />} />
        <Route path="/forgot-password" element={<ForgotPassword role="user" />} />
        <Route path="/reset-password/email/:token" element={<ResetPasswordEmail role="user" />} />
        <Route path="/reset-password/phone" element={<ResetPasswordPhone role="user" />} />

        {/* Seller auth */}
        <Route path="/seller/login" element={<SellerLogin />} />
        <Route path="/seller/signup" element={<SellerSignup />} />
        <Route path="/seller/verify-email/:token" element={<VerifyEmail role="seller" />} />
        <Route path="/seller/forgot-password" element={<ForgotPassword role="seller" />} />
        <Route path="/seller/reset-password/email/:token" element={<ResetPasswordEmail role="seller" />} />
        <Route path="/seller/reset-password/phone" element={<ResetPasswordPhone role="seller" />} />

        {/* Mobile verification — shared page, role read from auth state */}
        <Route path="/verify-mobile" element={<VerifyMobile />} />

        {/* Any authenticated role */}
        <Route element={<ProtectedRoute />}>
          <Route path="/notifications" element={<Notifications />} />
        </Route>

        {/* User only */}
        <Route element={<RoleProtectedRoute role="user" />}>
          <Route path="/cart" element={<Cart />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/wishlist" element={<Wishlist />} />
          <Route path="/addresses" element={<Addresses />} />
          <Route path="/orders" element={<UserOrders />} />
          <Route path="/orders/:id" element={<OrderDetails />} />
        </Route>

        {/* Seller only */}
        <Route element={<RoleProtectedRoute role="seller" />}>
          <Route path="/seller/dashboard" element={<SellerDashboard />} />
          <Route path="/seller/products" element={<SellerProducts />} />
          <Route path="/seller/products/add" element={<AddProduct />} />
          <Route path="/seller/orders" element={<SellerOrders />} />
        </Route>

        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}

export default App;
