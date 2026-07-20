import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import { getSocket, disconnectSocket } from "../socket/socketClient.js";
import { receiveLiveNotification } from "../redux/slices/notificationSlice.js";

export const useSocketConnection = () => {
  const dispatch = useDispatch();
  const { isLoggedIn } = useSelector((state) => state.auth);

  useEffect(() => {
    if (!isLoggedIn) {
      disconnectSocket();
      return;
    }

    const socket = getSocket();
    socket.connect();

    const handleNewNotification = (notification) => {
      dispatch(receiveLiveNotification(notification));
      toast.info(notification.title);
    };

    socket.on("notification:new", handleNewNotification);

    return () => {
      socket.off("notification:new", handleNewNotification);
    };
  }, [isLoggedIn, dispatch]);
};
