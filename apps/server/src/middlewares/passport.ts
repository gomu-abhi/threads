// src/middlewares/passport.ts
import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import dotenv from "dotenv"
import bcrypt from "bcryptjs";
import prisma from "../db";

dotenv.config();
// Serialize user to session
passport.serializeUser((user: any, done) => {
  done(null, user.id);
});

//  Deserialize user from session
passport.deserializeUser(async (id: string, done) => {
  try {
    const user = await prisma.user.findUnique({ where: { id } });
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

// Local Strategy — Email/Password
passport.use(
  new LocalStrategy(
    { usernameField: "email" },
    async (email, password, done) => {
      try {
        const user = await prisma.user.findUnique({ where: { email } });

        if (!user || user.provider !== "local") {
          return done(null, false, { message: "Invalid credentials" });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
          return done(null, false, { message: "Incorrect password" });
        }

        return done(null, user);
      } catch (err) {
        return done(err);
      }
    }
  )
);

// Google OAuth Strategy
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
      callbackURL: process.env.GOOGLE_CALLBACK_URL || "/auth/google/callback",
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const existingUser = await prisma.user.findUnique({
          where: { email: profile.emails?.[0]?.value },
        });

        if (existingUser) return done(null, existingUser);

        const user = await prisma.user.create({
          data: {
            email: profile.emails?.[0]?.value || "",
            name: profile.displayName,
            provider: "google",
            password: "", 
          },
        });

        return done(null, user);
      } catch (err) {
        return done(err);
      }
    }
  )
);
