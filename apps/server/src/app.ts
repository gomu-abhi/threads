import express from "express";
import { Express } from "express";
import session from "express-session";
import passport from "passport";
import authRoutes from "./routes/auth.routes";
import dotenv from "dotenv"
import "./middlewares/passport";
dotenv.config();
const app : Express = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(
  session({
    secret: process.env.SESSION_SECRET || "supersecret",
    resave: false,
    saveUninitialized: false,
  })
);

app.use(passport.initialize());
app.use(passport.session());

app.use("/auth", authRoutes);

export default app;
