import { Router } from "express";
import { getAllCategories, createCategory, deleteCategory } from "../controllers/category.controller.js";
import { verifyAuth, requireMobileVerified } from "../middleware/auth.middleware.js";
import { isSeller } from "../middleware/role.middleware.js";
import { upload } from "../middleware/upload.middleware.js";

const router = Router();

router.get("/", getAllCategories);
router.post("/", verifyAuth, isSeller, requireMobileVerified, upload.single("image"), createCategory);
router.delete("/:id", verifyAuth, isSeller, requireMobileVerified, deleteCategory);

export default router;
