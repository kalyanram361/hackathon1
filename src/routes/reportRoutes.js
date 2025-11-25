import express from "express";
import {
    createReport,
    getReports,
    getReportbyId,
    updateReportStatus,
    deleteReport
} from "../controllers/reportController.js";
import upload from "../middleware/upload.js";
import {verifyToken} from "../middleware/authMiddleware.js";

const router = express.Router();

//create report (with image upload)
router.post("/reports", upload.single("image"),createReport);

//get reports (with optional filters)
router.get("/reports", getReports);

//get single report 
router.get("/reports/:id",getReportbyId);

//update report status (authority /volunteer only)
router.patch("/reports/:id",verifyToken,updateReportStatus);

//delete report (admin only)
router.delete("/reports/:id",verifyToken,deleteReport);

export default router;