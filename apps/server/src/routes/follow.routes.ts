import express, { Router } from "express";
import { toggleFollow } from "../controllers/follow.controller";
import { isAuthenticated } from "../middlewares/isAuthenticated";

const router : Router = express.Router();

router.post("/:userId", isAuthenticated, toggleFollow);

export default router;