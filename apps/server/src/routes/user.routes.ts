import express, { Router } from "express";
import { getFollowCounts, getFollowers, getFollowing, getUserById, getUserPosts } from "../controllers/user.controller";

const router : Router = express.Router();

router.get("/:id", getUserById);
router.get("/:id/posts", getUserPosts);
router.get("/:id/follow-counts", getFollowCounts);
router.get("/:id/followers", getFollowers);
router.get("/:id/following", getFollowing);

export default router;