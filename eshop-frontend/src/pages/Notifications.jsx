import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Bell, BellOff } from "lucide-react";
import { fetchNotifications, markNotificationRead } from "../redux/slices/notificationSlice.js";
import { Loader } from "../components/Loader.jsx";
import { EmptyState } from "../components/EmptyState.jsx";

export function Notifications() {
  const dispatch = useDispatch();
  const { list, loading, unreadCount } = useSelector((state) => state.notification);

  useEffect(() => {
    dispatch(fetchNotifications());
  }, [dispatch]);

  return (
    <div className="mx-auto max-w-3xl px-6 py-8 lg:px-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#101828]">Notifications</h1>
        <p className="mt-1 text-sm text-gray-500">{unreadCount > 0 ? `${unreadCount} unread` : "You're all caught up"}</p>
      </div>

      {loading ? (
        <Loader />
      ) : list.length === 0 ? (
        <EmptyState icon={BellOff} title="No notifications" message="Order updates will show up here in real time." />
      ) : (
        <div className="space-y-2">
          {list.map((n) => (
            <button
              key={n._id}
              onClick={() => !n.isRead && dispatch(markNotificationRead(n._id))}
              className={`flex w-full items-start gap-3 rounded-xl border p-4 text-left transition ${
                n.isRead ? "border-[#E5E7EB] bg-white" : "border-[#C81E5C]/30 bg-[#C81E5C]/5"
              }`}
            >
              <div className="rounded-full bg-[#101828]/5 p-2"><Bell size={16} className="text-[#101828]" /></div>
              <div className="flex-1">
                <p className="font-medium text-[#101828]">{n.title}</p>
                <p className="mt-0.5 text-sm text-gray-500">{n.message}</p>
                <p className="mt-1 text-xs text-gray-400">{new Date(n.createdAt).toLocaleString()}</p>
              </div>
              {!n.isRead && <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-[#C81E5C]" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
