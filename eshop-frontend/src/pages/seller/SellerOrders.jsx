import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import { PackageX } from "lucide-react";
import { fetchSellerOrderItems, updateOrderItemStatus } from "../../redux/slices/orderSlice.js";
import { Loader } from "../../components/Loader.jsx";
import { EmptyState } from "../../components/EmptyState.jsx";

const TRANSITIONS = {
  "Order Placed": ["Seller Accepted", "Cancelled"],
  "Seller Accepted": ["Packed", "Cancelled"],
  Packed: ["Shipped"],
  Shipped: ["Out For Delivery"],
  "Out For Delivery": ["Delivered"],
};

const STATUS_STYLES = {
  "Order Placed": "bg-blue-100 text-blue-700",
  "Seller Accepted": "bg-indigo-100 text-indigo-700",
  Packed: "bg-purple-100 text-purple-700",
  Shipped: "bg-amber-100 text-amber-700",
  "Out For Delivery": "bg-orange-100 text-orange-700",
  Delivered: "bg-green-100 text-green-700",
  Cancelled: "bg-red-100 text-red-700",
};

export function SellerOrders() {
  const dispatch = useDispatch();
  const { sellerOrderItems, loading } = useSelector((state) => state.order);
  const [updatingId, setUpdatingId] = useState(null);

  useEffect(() => {
    dispatch(fetchSellerOrderItems());
  }, [dispatch]);

  const handleStatusChange = async (id, status) => {
    setUpdatingId(id);
    const result = await dispatch(updateOrderItemStatus({ id, status }));
    setUpdatingId(null);

    if (result.meta.requestStatus === "fulfilled") {
      toast.success(`Marked as ${status}`);
    } else {
      toast.error(result.payload || "Failed to update status");
    }
  };

  if (loading) return <Loader fullScreen />;

  if (sellerOrderItems.length === 0) {
    return (
      <div className="mx-auto max-w-5xl px-6 py-16">
        <EmptyState icon={PackageX} title="No orders yet" message="Orders for your products will show up here." />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-6 py-8 lg:px-8">
      <h1 className="mb-6 text-2xl font-bold text-[#101828]">Order Management</h1>

      <div className="overflow-hidden rounded-2xl border border-[#E5E7EB]">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50 text-gray-500">
            <tr>
              <th className="px-5 py-3 font-medium">Product</th>
              <th className="px-5 py-3 font-medium">Customer</th>
              <th className="px-5 py-3 font-medium">Qty</th>
              <th className="px-5 py-3 font-medium">Total</th>
              <th className="px-5 py-3 font-medium">Status</th>
              <th className="px-5 py-3 font-medium">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E5E7EB]">
            {sellerOrderItems.map((item) => {
              const nextOptions = TRANSITIONS[item.status] || [];
              return (
                <tr key={item._id}>
                  <td className="flex items-center gap-3 px-5 py-3">
                    <img src={item.product?.images?.[0]?.url} alt="" className="h-12 w-12 rounded-lg object-cover" />
                    <span className="font-medium text-[#101828]">{item.product?.title}</span>
                  </td>
                  <td className="px-5 py-3 text-gray-600">
                    {item.order?.user?.fullName}
                    <div className="text-xs text-gray-400">{item.order?.user?.email}</div>
                  </td>
                  <td className="px-5 py-3">{item.quantity}</td>
                  <td className="px-5 py-3 font-medium text-[#C81E5C]">
                    ₹{(item.priceAtPurchase * item.quantity).toLocaleString("en-IN")}
                  </td>
                  <td className="px-5 py-3">
                    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${STATUS_STYLES[item.status]}`}>
                      {item.status}
                    </span>
                  </td>
                  <td className="px-5 py-3">
                    {nextOptions.length > 0 && (
                      <select
                        disabled={updatingId === item._id}
                        onChange={(e) => e.target.value && handleStatusChange(item._id, e.target.value)}
                        value=""
                        className="rounded-lg border border-[#E5E7EB] px-2 py-1.5 text-xs outline-none focus:border-[#C81E5C]"
                      >
                        <option value="">Update to...</option>
                        {nextOptions.map((opt) => (
                          <option key={opt} value={opt}>{opt}</option>
                        ))}
                      </select>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
