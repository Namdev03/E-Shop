import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import { MapPin, RotateCcw, XCircle } from "lucide-react";
import { fetchOrderById, cancelOrder, requestReturn, reorder } from "../../redux/slices/orderSlice.js";
import { Loader } from "../../components/Loader.jsx";
import { OrderStatusTimeline } from "../../components/OrderStatusTimeline.jsx";
import { Modal } from "../../components/Modal.jsx";

export function OrderDetails() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { currentOrder: order, loading } = useSelector((state) => state.order);

  const [returnModalOpen, setReturnModalOpen] = useState(false);
  const [returnReason, setReturnReason] = useState("");

  useEffect(() => {
    dispatch(fetchOrderById(id));
  }, [dispatch, id]);

  if (loading || !order) return <Loader fullScreen />;

  const canCancel = order.items.every((i) => !["Shipped", "Out For Delivery", "Delivered", "Cancelled"].includes(i.status));
  const canReturn = order.items.every((i) => i.status === "Delivered") && !order.returnRequested;

  const handleCancel = async () => {
    const result = await dispatch(cancelOrder(order._id));
    if (result.meta.requestStatus === "fulfilled") {
      toast.success("Order cancelled");
      dispatch(fetchOrderById(id));
    } else {
      toast.error(result.payload || "Failed to cancel order");
    }
  };

  const handleReturn = async () => {
    const result = await dispatch(requestReturn({ id: order._id, reason: returnReason }));
    setReturnModalOpen(false);
    if (result.meta.requestStatus === "fulfilled") {
      toast.success("Return request submitted");
      dispatch(fetchOrderById(id));
    } else {
      toast.error(result.payload || "Failed to submit return request");
    }
  };

  const handleReorder = async () => {
    const result = await dispatch(reorder(order._id));
    if (result.meta.requestStatus === "fulfilled") {
      toast.success("Items added to cart");
      navigate("/cart");
    } else {
      toast.error(result.payload || "Failed to reorder");
    }
  };

  return (
    <div className="mx-auto max-w-4xl px-6 py-8 lg:px-8">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-[#101828]">Order Details</h1>
          <p className="text-sm text-gray-500">Placed on {new Date(order.createdAt).toLocaleDateString()}</p>
        </div>
        <div className="flex gap-2">
          <button onClick={handleReorder} className="flex items-center gap-1.5 rounded-lg border border-[#E5E7EB] px-4 py-2 text-sm font-medium hover:bg-gray-50">
            <RotateCcw size={14} /> Reorder
          </button>
          {canCancel && (
            <button onClick={handleCancel} className="flex items-center gap-1.5 rounded-lg border border-red-200 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50">
              <XCircle size={14} /> Cancel Order
            </button>
          )}
          {canReturn && (
            <button onClick={() => setReturnModalOpen(true)} className="rounded-lg border border-[#E5E7EB] px-4 py-2 text-sm font-medium hover:bg-gray-50">
              Request Return
            </button>
          )}
        </div>
      </div>

      {order.returnRequested && (
        <div className="mb-6 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-700">
          Return status: <strong>{order.refundStatus}</strong>
        </div>
      )}

      <div className="space-y-6">
        {order.items.map((item) => (
          <div key={item._id} className="rounded-2xl border border-[#E5E7EB] p-5">
            <div className="mb-4 flex gap-4">
              <img src={item.product?.images?.[0]?.url} alt="" className="h-20 w-20 rounded-xl object-cover" />
              <div className="flex-1">
                <p className="font-medium text-[#101828]">{item.product?.title}</p>
                <p className="text-sm text-gray-500">Sold by {item.seller?.storeName}</p>
                <p className="text-sm text-gray-500">
                  {item.color && `Color: ${item.color} `} {item.size && `Size: ${item.size} `}Qty: {item.quantity}
                </p>
                <p className="mt-1 font-semibold text-[#101828]">
                  ₹{(item.priceAtPurchase * item.quantity).toLocaleString("en-IN")}
                </p>
              </div>
            </div>
            <OrderStatusTimeline currentStatus={item.status} statusHistory={item.statusHistory} />
          </div>
        ))}
      </div>

      <div className="mt-6 rounded-2xl border border-[#E5E7EB] p-5">
        <h2 className="mb-3 flex items-center gap-2 font-semibold text-[#101828]">
          <MapPin size={16} /> Delivery Address
        </h2>
        <p className="text-sm text-gray-600">
          {order.shippingAddress.fullName}, {order.shippingAddress.streetAddress}, {order.shippingAddress.city},{" "}
          {order.shippingAddress.state} {order.shippingAddress.pincode}
        </p>
        <p className="text-sm text-gray-600">{order.shippingAddress.phone}</p>
      </div>

      <div className="mt-6 rounded-2xl border border-[#E5E7EB] p-5">
        <h2 className="mb-3 font-semibold text-[#101828]">Payment Summary</h2>
        <div className="space-y-1.5 text-sm text-gray-600">
          <div className="flex justify-between"><span>Subtotal</span><span>₹{order.subtotal.toLocaleString("en-IN")}</span></div>
          {order.discount > 0 && <div className="flex justify-between text-green-600"><span>Discount</span><span>-₹{order.discount.toLocaleString("en-IN")}</span></div>}
          <div className="flex justify-between"><span>Shipping</span><span>{order.shippingCharge === 0 ? "Free" : `₹${order.shippingCharge}`}</span></div>
          <div className="flex justify-between"><span>Tax</span><span>₹{order.tax.toLocaleString("en-IN")}</span></div>
          <div className="flex justify-between border-t border-[#E5E7EB] pt-1.5 font-bold text-[#101828]">
            <span>Grand Total</span><span>₹{order.grandTotal.toLocaleString("en-IN")}</span>
          </div>
          <div className="flex justify-between pt-1"><span>Payment Method</span><span>{order.paymentMethod}</span></div>
          <div className="flex justify-between"><span>Payment Status</span><span>{order.paymentStatus}</span></div>
        </div>
      </div>

      <Modal isOpen={returnModalOpen} onClose={() => setReturnModalOpen(false)} title="Request Return">
        <textarea
          rows={3}
          value={returnReason}
          onChange={(e) => setReturnReason(e.target.value)}
          placeholder="Why are you returning this order?"
          className="w-full rounded-lg border border-[#E5E7EB] px-3 py-2 text-sm outline-none focus:border-[#C81E5C]"
        />
        <button onClick={handleReturn} className="mt-4 w-full rounded-lg bg-[#101828] py-2.5 text-sm font-semibold text-white hover:bg-[#C81E5C]">
          Submit Return Request
        </button>
      </Modal>
    </div>
  );
}
