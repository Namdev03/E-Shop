import { Server } from "socket.io";
import jwt from "jsonwebtoken";
import cookie from "cookie";

let io;

/**
 * Each connected client joins a room named after their account id
 * (e.g. "user:64f...", "seller:64f..."), so controllers can emit to a
 * specific person without tracking raw socket ids themselves.
 */
export const initializeSocket = (httpServer) => {
  io = new Server(httpServer, {
    cors: {
      origin: process.env.CLIENT_URL,
      credentials: true,
    },
  });

  io.use((socket, next) => {
    try {
      const rawCookie = socket.handshake.headers.cookie;
      if (!rawCookie) return next(new Error("Authentication required"));

      const parsed = cookie.parse(rawCookie);
      const token = parsed.accessToken;
      if (!token) return next(new Error("Authentication required"));

      const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
      socket.accountId = decoded.id;
      socket.role = decoded.role;
      next();
    } catch (err) {
      next(new Error("Authentication failed"));
    }
  });

  io.on("connection", (socket) => {
    const room = `${socket.role}:${socket.accountId}`;
    socket.join(room);
    console.log(`Socket connected: ${room}`);

    socket.on("disconnect", () => {
      console.log(`Socket disconnected: ${room}`);
    });
  });
  return io;
};
export const getIo = () => {
  if (!io) throw new Error("Socket.IO has not been initialized yet");
  return io;
};

/**
 * Emits a real-time event directly to one user or seller by account id.
 * Controllers call this right after creating a Notification document,
 * so the DB record and the live push always happen together.
 */
export const emitToAccount = (role, accountId, event, payload) => {
  if (!io) return; // socket.io not initialized (e.g. in tests) — fail silently
  io.to(`${role}:${accountId}`).emit(event, payload);
};
