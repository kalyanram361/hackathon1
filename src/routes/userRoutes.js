import express from "express";
import { verifyToken } from "../middleware/authMiddleware.js";
import {getUserProfile , getUserReports , getdashboardStats} from "../controllers/userController.js";

const router = express.Router();

router.get("/profile", verifyToken, getUserProfile);
router.get("/reports", verifyToken, getUserReports);
router.get("/dashboard", verifyToken, getdashboardStats);

export default router;