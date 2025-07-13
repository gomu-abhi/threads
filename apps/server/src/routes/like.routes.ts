import express, { Router } from "express";
import { toggleLike } from "../controllers/like.controller";
import { isAuthenticated } from "../middlewares/isAuthenticated";

const router : Router = express.Router();
router.post("/:postId", isAuthenticated, toggleLike);

export default router;