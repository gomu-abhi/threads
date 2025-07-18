import express from "express";
import { Express } from "express";
import session from "express-session";
import passport from "passport";
import authRoutes from "./routes/auth.routes";
import postRoutes from './routes/post.routes'
import likeRoutes from "./routes/like.routes";
import commentRoutes from "./routes/comment.routes";
import followRoutes from "./routes/follow.routes";
import userRoutes from "./routes/user.routes"
import "./middlewares/passport";
import cors from "cors"
import dotenv from "dotenv"
dotenv.config();
const app : Express = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors({
  origin: "http://localhost:3000",
  credentials: true,
}));

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
app.use("/posts", postRoutes);
app.use("/likes", likeRoutes);
app.use("/comments", commentRoutes);
app.use("/users/follow", followRoutes);
app.use("/users", userRoutes)

export default app;
