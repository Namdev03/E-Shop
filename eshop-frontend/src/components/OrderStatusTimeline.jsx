import { Check, Package, Truck, Home, X, RotateCcw } from "lucide-react";

const HAPPY_PATH = [
  { status: "Order Placed", icon: Package },
  { status: "Seller Accepted", icon: Check },
  { status: "Packed", icon: Package },
  { status: "Shipped", icon: Truck },
  { status: "Out For Delivery", icon: Truck },
  { status: "Delivered", icon: Home },
];

const TERMINAL_BAD_STATUSES = { Cancelled: X, Returned: RotateCcw, Refunded: RotateCcw };

export function OrderStatusTimeline({ currentStatus, statusHistory = [] }) {
  if (TERMINAL_BAD_STATUSES[currentStatus]) {
    const Icon = TERMINAL_BAD_STATUSES[currentStatus];
    return (
      <div className="flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 p-4">
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-red-100">
          <Icon size={18} className="text-red-600" />
        </div>
        <div>
          <p className="font-semibold text-red-700">{currentStatus}</p>
          {statusHistory.length > 0 && (
            <p className="text-xs text-red-500">
              {new Date(statusHistory[statusHistory.length - 1].changedAt).toLocaleString()}
            </p>
          )}
        </div>
      </div>
    );
  }

  const currentIndex = HAPPY_PATH.findIndex((step) => step.status === currentStatus);

  const findTimestamp = (status) => statusHistory.find((h) => h.status === status)?.changedAt;

  return (
    <div className="flex flex-col gap-0">
      {HAPPY_PATH.map((step, index) => {
        const isComplete = index <= currentIndex;
        const isCurrent = index === currentIndex;
        const timestamp = findTimestamp(step.status);
        const Icon = step.icon;

        return (
          <div key={step.status} className="flex gap-4">
            <div className="flex flex-col items-center">
              <div
                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-2 transition ${
                  isComplete
                    ? "border-[#C81E5C] bg-[#C81E5C] text-white"
                    : "border-gray-200 bg-white text-gray-300"
                } ${isCurrent ? "ring-4 ring-[#C81E5C]/15" : ""}`}
              >
                <Icon size={16} />
              </div>
              {index < HAPPY_PATH.length - 1 && (
                <div
                  className={`w-0.5 flex-1 ${index < currentIndex ? "bg-[#C81E5C]" : "bg-gray-200"}`}
                  style={{ minHeight: 32 }}
                />
              )}
            </div>

            <div className="pb-8">
              <p className={`font-medium ${isComplete ? "text-[#101828]" : "text-gray-400"}`}>
                {step.status}
              </p>
              {timestamp && (
                <p className="text-xs text-gray-500">{new Date(timestamp).toLocaleString()}</p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
