import express, { Router } from "express";
import { getUserById, getUserPosts } from "../controllers/user.controller";

const router : Router = express.Router();

router.get("/:id", getUserById);
router.get("/:id/posts", getUserPosts);

export default router;