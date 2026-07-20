import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router";
import { toast } from "react-toastify";
import { Trash2, ShoppingBag, Tag } from "lucide-react";
import {
  fetchCart, updateCartItemQuantity, removeCartItem, applyCoupon,
} from "../redux/slices/cartSlice.js";
import { Loader } from "../components/Loader.jsx";
import { EmptyState } from "../components/EmptyState.jsx";

export function Cart() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { cart, totals, loading } = useSelector((state) => state.cart);
  const [couponInput, setCouponInput] = useState("");

  useEffect(() => {
    dispatch(fetchCart());
  }, [dispatch]);

  const handleQuantityChange = (productId, quantity) => {
    if (quantity < 1) return;
    dispatch(updateCartItemQuantity({ productId, quantity }));
  };

  const handleRemove = (productId) => {
    dispatch(removeCartItem(productId))
      .unwrap()
      .then(() => toast.success("Item removed"))
      .catch((err) => toast.error(err));
  };

  const handleApplyCoupon = () => {
    if (!couponInput.trim()) return;
    dispatch(applyCoupon(couponInput.trim()))
      .unwrap()
      .then(() => toast.success("Coupon applied"))
      .catch((err) => toast.error(err));
  };

  if (loading) return <Loader fullScreen />;

  if (!cart.items || cart.items.length === 0) {
    return (
      <div className="mx-auto max-w-4xl px-6 py-16">
        <EmptyState
          icon={ShoppingBag}
          title="Your cart is empty"
          message="Browse products and add something you love."
          action={
            <Link to="/products" className="rounded-full bg-[#101828] px-6 py-2.5 text-sm font-semibold text-white hover:bg-[#C81E5C]">
              Start Shopping
            </Link>
          }
        />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-6 py-8 lg:px-8">
      <h1 className="mb-6 text-2xl font-bold text-[#101828]">Shopping Cart</h1>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          {cart.items.map((item) => (
            <div
              key={`${item.product._id}-${item.color}-${item.size}`}
              className="flex gap-4 rounded-2xl border border-[#E5E7EB] p-4"
            >
              <img
                src={item.product.images?.[0]?.url}
                alt={item.product.title}
                className="h-24 w-24 shrink-0 rounded-xl object-cover"
              />
              <div className="flex-1">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-medium text-[#101828]">{item.product.title}</p>
                    {(item.color || item.size) && (
                      <p className="text-xs text-gray-500">
                        {item.color && `Color: ${item.color}`} {item.size && `Size: ${item.size}`}
                      </p>
                    )}
                  </div>
                  <button
                    onClick={() => handleRemove(item.product._id)}
                    className="rounded-lg p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-600"
                    aria-label="Remove"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>

                <div className="mt-3 flex items-center justify-between">
                  <div className="flex items-center rounded-lg border border-[#E5E7EB]">
                    <button
                      onClick={() => handleQuantityChange(item.product._id, item.quantity - 1)}
                      className="px-2.5 py-1 text-lg"
                    >
                      −
                    </button>
                    <span className="w-8 text-center text-sm">{item.quantity}</span>
                    <button
                      onClick={() => handleQuantityChange(item.product._id, item.quantity + 1)}
                      className="px-2.5 py-1 text-lg"
                    >
                      +
                    </button>
                  </div>
                  <p className="font-semibold text-[#101828]">
                    ₹{(item.priceAtAdd * item.quantity).toLocaleString("en-IN")}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="rounded-2xl border border-[#E5E7EB] p-6">
          <h2 className="mb-4 font-semibold text-[#101828]">Order Summary</h2>

          <div className="mb-4 flex items-center gap-2">
            <div className="relative flex-1">
              <Tag size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={couponInput}
                onChange={(e) => setCouponInput(e.target.value)}
                placeholder="Coupon code"
                className="w-full rounded-lg border border-[#E5E7EB] py-2 pl-9 pr-3 text-sm outline-none focus:border-[#C81E5C]"
              />
            </div>
            <button
              onClick={handleApplyCoupon}
              className="rounded-lg bg-[#101828] px-4 py-2 text-sm font-semibold text-white hover:bg-[#C81E5C]"
            >
              Apply
            </button>
          </div>

          <div className="space-y-2 text-sm">
            <Row label="Subtotal" value={totals.subtotal} />
            {totals.discount > 0 && <Row label="Discount" value={-totals.discount} highlight="text-green-600" />}
            <Row label="Shipping" value={totals.shippingCharge} free={totals.shippingCharge === 0} />
            <Row label="Tax" value={totals.tax} />
            <div className="flex justify-between border-t border-[#E5E7EB] pt-2 font-bold text-[#101828]">
              <span>Grand Total</span>
              <span>₹{totals.grandTotal.toLocaleString("en-IN")}</span>
            </div>
          </div>

          <button
            onClick={() => navigate("/checkout")}
            className="mt-6 w-full rounded-xl bg-[#C81E5C] py-3.5 font-semibold text-white transition hover:bg-[#a8184c]"
          >
            Proceed to Checkout
          </button>
        </div>
      </div>
    </div>
  );
}

function Row({ label, value, highlight, free }) {
  return (
    <div className="flex justify-between text-gray-600">
      <span>{label}</span>
      <span className={highlight}>{free ? "Free" : `₹${value.toLocaleString("en-IN")}`}</span>
    </div>
  );
}
