import { Router } from "express";
import { getActiveCoupons } from "../controllers/coupon.controller.js";

const router = Router();

router.get("/active", getActiveCoupons);

export default router;
