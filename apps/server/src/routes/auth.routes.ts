import { Router } from "express";
import passport from "passport";
import {
  register,
  login,
  logout,
  getMe,
} from "../controllers/auth.controller.js";
import { isAuthenticated } from "../middlewares/isAuthenticated.js";

const router : Router = Router();

router.post("/register", register);

router.post("/login", passport.authenticate("local"), login);

router.get("/logout", logout);

router.get("/me", isAuthenticated, getMe);

router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

router.get(
  "/google/callback",
  passport.authenticate("google", {
    failureRedirect: "/login", // optional: route to show failure
    session: true,
  }),
  (req, res) => {
    // Redirect to frontend after successful Google login
    res.redirect("/");
  }
);

export default router;
