import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router";
import { PackageX } from "lucide-react";
import { fetchUserOrders } from "../../redux/slices/orderSlice.js";
import { Loader } from "../../components/Loader.jsx";
import { EmptyState } from "../../components/EmptyState.jsx";

const overallStatus = (order) => {
  const statuses = order.items.map((i) => i.status);
  if (statuses.every((s) => s === "Delivered")) return "Delivered";
  if (statuses.every((s) => s === "Cancelled")) return "Cancelled";
  if (statuses.some((s) => s === "Cancelled")) return "Partially Cancelled";
  return statuses[0] || "Processing";
};

export function UserOrders() {
  const dispatch = useDispatch();
  const { userOrders, loading } = useSelector((state) => state.order);

  useEffect(() => {
    dispatch(fetchUserOrders());
  }, [dispatch]);

  if (loading) return <Loader fullScreen />;

  if (userOrders.length === 0) {
    return (
      <div className="mx-auto max-w-4xl px-6 py-16">
        <EmptyState icon={PackageX} title="No orders yet" message="Your order history will show up here." />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-6 py-8 lg:px-8">
      <h1 className="mb-6 text-2xl font-bold text-[#101828]">My Orders</h1>

      <div className="space-y-4">
        {userOrders.map((order) => (
          <Link
            key={order._id}
            to={`/orders/${order._id}`}
            className="flex flex-col gap-4 rounded-2xl border border-[#E5E7EB] p-5 transition hover:shadow-md sm:flex-row sm:items-center"
          >
            <div className="flex -space-x-3">
              {order.items.slice(0, 3).map((item, i) => (
                <img
                  key={i}
                  src={item.product?.images?.[0]?.url}
                  alt=""
                  className="h-16 w-16 rounded-xl border-2 border-white object-cover"
                  style={{ zIndex: 3 - i }}
                />
              ))}
            </div>

            <div className="flex-1">
              <p className="text-sm text-gray-500">
                Order placed {new Date(order.createdAt).toLocaleDateString()}
              </p>
              <p className="font-semibold text-[#101828]">
                {order.items.length} item{order.items.length > 1 ? "s" : ""} · ₹{order.grandTotal.toLocaleString("en-IN")}
              </p>
            </div>

            <span
              className={`rounded-full px-3 py-1 text-xs font-semibold ${
                overallStatus(order) === "Delivered"
                  ? "bg-green-100 text-green-700"
                  : overallStatus(order).includes("Cancelled")
                  ? "bg-red-100 text-red-700"
                  : "bg-amber-100 text-amber-700"
              }`}
            >
              {overallStatus(order)}
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
