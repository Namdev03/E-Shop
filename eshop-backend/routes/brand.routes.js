import { Router } from "express";
import { getAllBrands, createBrand, deleteBrand } from "../controllers/brand.controller.js";
import { verifyAuth, requireMobileVerified } from "../middleware/auth.middleware.js";
import { isSeller } from "../middleware/role.middleware.js";
import { upload } from "../middleware/upload.middleware.js";

const router = Router();

router.get("/", getAllBrands);
router.post("/", verifyAuth, isSeller, requireMobileVerified, upload.single("logo"), createBrand);
router.delete("/:id", verifyAuth, isSeller, requireMobileVerified, deleteBrand);

export default router;
