import dotenv from "dotenv";
dotenv.config();

import http from "http";
import app from "./app.js";
import { connectDB } from "./database/connect.js";
import { initializeSocket } from "./socket/index.js";

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  await connectDB();

  const httpServer = http.createServer(app);
  initializeSocket(httpServer);

  httpServer.listen(PORT, () => {
    console.log(`E-Shop API running on port ${PORT} [${process.env.NODE_ENV || "development"}]`);
  });
};

startServer();
