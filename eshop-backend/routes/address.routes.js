import { Router } from "express";
import {
  getAddresses, addAddress, updateAddress, deleteAddress,
} from "../controllers/address.controller.js";
import { verifyAuth, requireMobileVerified } from "../middleware/auth.middleware.js";
import { isUser } from "../middleware/role.middleware.js";

const router = Router();

router.use(verifyAuth, isUser, requireMobileVerified);

router.get("/", getAddresses);
router.post("/", addAddress);
router.patch("/:id", updateAddress);
router.delete("/:id", deleteAddress);

export default router;
