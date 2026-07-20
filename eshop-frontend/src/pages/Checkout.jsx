import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, Link } from "react-router";
import { toast } from "react-toastify";
import { MapPin, Plus, Truck, Wallet } from "lucide-react";
import { fetchAddresses } from "../redux/slices/addressSlice.js";
import { fetchCart } from "../redux/slices/cartSlice.js";
import { placeOrder } from "../redux/slices/orderSlice.js";
import { Loader } from "../components/Loader.jsx";
import { EmptyState } from "../components/EmptyState.jsx";

const PAYMENT_METHODS = [
  { value: "COD", label: "Cash on Delivery", icon: Truck },
  { value: "Stripe", label: "Credit/Debit Card (Stripe)", icon: Wallet },
  { value: "Razorpay", label: "UPI / Netbanking (Razorpay)", icon: Wallet },
];

export function Checkout() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { list: addresses, loading: addressesLoading } = useSelector((state) => state.address);
  const { cart, totals } = useSelector((state) => state.cart);
  const { loading: orderLoading } = useSelector((state) => state.order);

  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState("COD");

  useEffect(() => {
    dispatch(fetchAddresses());
    dispatch(fetchCart());
  }, [dispatch]);

  useEffect(() => {
    const defaultAddress = addresses.find((a) => a.isDefault) || addresses[0];
    if (defaultAddress && !selectedAddressId) setSelectedAddressId(defaultAddress._id);
  }, [addresses, selectedAddressId]);

  const handlePlaceOrder = async () => {
    if (!selectedAddressId) {
      toast.error("Please select a delivery address");
      return;
    }

    const result = await dispatch(placeOrder({ addressId: selectedAddressId, paymentMethod }));
    if (result.meta.requestStatus === "fulfilled") {
      toast.success("Order placed successfully!");
      navigate(`/orders/${result.payload.data.order._id}`);
    } else {
      toast.error(result.payload || "Failed to place order");
    }
  };

  if (addressesLoading) return <Loader fullScreen />;

  return (
    <div className="mx-auto max-w-6xl px-6 py-8 lg:px-8">
      <h1 className="mb-6 text-2xl font-bold text-[#101828]">Checkout</h1>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          {/* Address selection */}
          <div className="rounded-2xl border border-[#E5E7EB] p-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-semibold text-[#101828]">Delivery Address</h2>
              <Link to="/addresses" className="flex items-center gap-1 text-sm font-semibold text-[#C81E5C] hover:underline">
                <Plus size={14} /> Add New
              </Link>
            </div>

            {addresses.length === 0 ? (
              <EmptyState
                icon={MapPin}
                title="No saved addresses"
                message="Add a delivery address to continue."
                action={
                  <Link to="/addresses" className="rounded-full bg-[#101828] px-5 py-2 text-sm font-semibold text-white hover:bg-[#C81E5C]">
                    Add Address
                  </Link>
                }
              />
            ) : (
              <div className="space-y-3">
                {addresses.map((addr) => (
                  <label
                    key={addr._id}
                    className={`flex cursor-pointer items-start gap-3 rounded-xl border p-4 transition ${
                      selectedAddressId === addr._id ? "border-[#C81E5C] bg-[#C81E5C]/5" : "border-[#E5E7EB]"
                    }`}
                  >
                    <input
                      type="radio"
                      name="address"
                      checked={selectedAddressId === addr._id}
                      onChange={() => setSelectedAddressId(addr._id)}
                      className="mt-1"
                    />
                    <div>
                      <p className="font-medium text-[#101828]">
                        {addr.fullName} <span className="text-xs font-normal text-gray-500">({addr.addressType})</span>
                      </p>
                      <p className="text-sm text-gray-500">
                        {addr.streetAddress}, {addr.city}, {addr.state} {addr.pincode}
                      </p>
                      <p className="text-sm text-gray-500">{addr.phone}</p>
                    </div>
                  </label>
                ))}
              </div>
            )}
          </div>

          {/* Payment method */}
          <div className="rounded-2xl border border-[#E5E7EB] p-6">
            <h2 className="mb-4 font-semibold text-[#101828]">Payment Method</h2>
            <div className="space-y-3">
              {PAYMENT_METHODS.map((pm) => (
                <label
                  key={pm.value}
                  className={`flex cursor-pointer items-center gap-3 rounded-xl border p-4 transition ${
                    paymentMethod === pm.value ? "border-[#C81E5C] bg-[#C81E5C]/5" : "border-[#E5E7EB]"
                  }`}
                >
                  <input
                    type="radio"
                    name="payment"
                    checked={paymentMethod === pm.value}
                    onChange={() => setPaymentMethod(pm.value)}
                  />
                  <pm.icon size={18} className="text-gray-500" />
                  <span className="text-sm font-medium text-[#101828]">{pm.label}</span>
                </label>
              ))}
            </div>
            <p className="mt-3 text-xs text-gray-400">
              Online payment methods are in architecture-ready mode for this build — Cash on Delivery is fully functional.
            </p>
          </div>
        </div>

        {/* Order summary */}
        <div className="h-fit rounded-2xl border border-[#E5E7EB] p-6">
          <h2 className="mb-4 font-semibold text-[#101828]">Order Summary</h2>
          <div className="mb-4 max-h-64 space-y-3 overflow-y-auto">
            {cart.items?.map((item) => (
              <div key={item.product._id} className="flex gap-3">
                <img src={item.product.images?.[0]?.url} alt="" className="h-14 w-14 rounded-lg object-cover" />
                <div className="flex-1 text-sm">
                  <p className="line-clamp-1 text-[#101828]">{item.product.title}</p>
                  <p className="text-gray-500">Qty: {item.quantity}</p>
                </div>
                <p className="text-sm font-medium text-[#101828]">
                  ₹{(item.priceAtAdd * item.quantity).toLocaleString("en-IN")}
                </p>
              </div>
            ))}
          </div>

          <div className="space-y-2 border-t border-[#E5E7EB] pt-3 text-sm">
            <div className="flex justify-between text-gray-600"><span>Subtotal</span><span>₹{totals.subtotal.toLocaleString("en-IN")}</span></div>
            {totals.discount > 0 && (
              <div className="flex justify-between text-green-600"><span>Discount</span><span>-₹{totals.discount.toLocaleString("en-IN")}</span></div>
            )}
            <div className="flex justify-between text-gray-600"><span>Shipping</span><span>{totals.shippingCharge === 0 ? "Free" : `₹${totals.shippingCharge}`}</span></div>
            <div className="flex justify-between text-gray-600"><span>Tax</span><span>₹{totals.tax.toLocaleString("en-IN")}</span></div>
            <div className="flex justify-between border-t border-[#E5E7EB] pt-2 font-bold text-[#101828]">
              <span>Grand Total</span><span>₹{totals.grandTotal.toLocaleString("en-IN")}</span>
            </div>
          </div>

          <button
            onClick={handlePlaceOrder}
            disabled={orderLoading || addresses.length === 0}
            className="mt-6 w-full rounded-xl bg-[#C81E5C] py-3.5 font-semibold text-white transition hover:bg-[#a8184c] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {orderLoading ? "Placing Order..." : "Place Order"}
          </button>
        </div>
      </div>
    </div>
  );
}
