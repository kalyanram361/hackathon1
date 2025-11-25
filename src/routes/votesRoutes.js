import express from "express";
import {verifyToken} from "../middleware/authMiddleware.js";
import { voteOnReport, getReportVotes } from "../controllers/votesController.js";


const router = express.Router();

router.post("/reports/:id/vote", verifyToken ,voteOnReport);
router.get("/reports/:id/votes", getReportVotes);

export default router;