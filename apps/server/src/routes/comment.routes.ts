import express, { Router } from "express";
import { addComment, getComments } from "../controllers/comment.controller";
import { isAuthenticated } from "../middlewares/isAuthenticated";

const router : Router = express.Router();

router.post("/:postId", isAuthenticated, addComment);
router.get("/:postId", getComments);

export default router;