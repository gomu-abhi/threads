import express, { Router } from "express";
import {
  createPost,
  getAllPosts,
  getPostById,
  deletePost,
  updatePost,
  getTrendingPosts,
  getFollowingPosts,
} from "../controllers/post.controller";
import { isAuthenticated } from "../middlewares/isAuthenticated";

const router : Router = express.Router();

router.post("/", isAuthenticated, createPost);
router.get("/", getAllPosts);
router.get("/trending", getTrendingPosts)
router.get("/following", isAuthenticated, getFollowingPosts)
router.get("/:id", getPostById);
router.put("/:id", isAuthenticated, updatePost)
router.delete("/:id", isAuthenticated, deletePost);

export default router;