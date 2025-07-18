import express, { Router } from "express";
import { addComment, deleteComment, getComments } from "../controllers/comment.controller";
import { isAuthenticated } from "../middlewares/isAuthenticated";

const router : Router = express.Router();

router.post("/:postId", isAuthenticated, addComment);
router.get("/:postId", getComments);
router.delete("/:id", isAuthenticated, deleteComment)

export default router;