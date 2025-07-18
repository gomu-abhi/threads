import express, { Router } from "express";
import {
  createPost,
  getAllPosts,
  getPostById,
  deletePost,
  updatePost,
  getComments,
} from "../controllers/post.controller";
import { isAuthenticated } from "../middlewares/isAuthenticated";

const router : Router = express.Router();

router.post("/", isAuthenticated, createPost);
router.get("/", getAllPosts);
router.get("/:id", getPostById);
router.put("/:id", isAuthenticated, updatePost)
router.delete("/:id", isAuthenticated, deletePost);

export default router;