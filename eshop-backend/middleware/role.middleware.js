import { ApiError } from "../utils/ApiError.js";

export const isUser = (req, res, next) => {
  if (req.role !== "user") {
    throw new ApiError(403, "Forbidden: user access only");
  }
  next();
};

export const isSeller = (req, res, next) => {
  if (req.role !== "seller") {
    throw new ApiError(403, "Forbidden: seller access only");
  }
  next();
};
