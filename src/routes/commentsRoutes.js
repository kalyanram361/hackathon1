import express from "express";
import {verifyToken } from "../middleware/authMiddleware.js";
import {addComment, getComments} from "../controllers/commentsController.js";

const router = express.Router();

router.post("/reports/:id/comments", verifyToken, addComment);
router.get("/reports/:id/comments", getComments);

export default router;
