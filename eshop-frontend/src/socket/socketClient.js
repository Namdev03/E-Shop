import { io } from "socket.io-client";

let socket = null;

/**
 * One shared socket instance for the whole app. The connection relies on
 * the accessToken httpOnly cookie (see backend socket/index.js), so this
 * is only meaningful once the person is actually logged in.
 */
export const getSocket = () => {
  if (!socket) {
    socket = io("https://e-shop-hopu.onrender.com" || "http://localhost:5000", {
      withCredentials: true,
      autoConnect: false,
    });
  }
  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};
