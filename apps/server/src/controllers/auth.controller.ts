import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";
import { registerSchema, loginSchema } from "../validators/authSchemas";
import { treeifyError } from "zod";

const prisma = new PrismaClient();

export const register = async (req: Request, res: Response) => {
  const parsed = registerSchema.safeParse(req.body);
  if (!parsed.success) {
    const formatted = treeifyError(parsed.error);
    return res.status(400).json({ errors: formatted });
  }

  const { email, password, name } = parsed.data;

  try {
    const existingUser = await prisma.user.findUnique({ where: { email } });

    if (existingUser) {
      return res.status(409).json({ message: "Email already in use" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        provider: "local",
      },
    });

    req.login(user, (err) => {
      if (err) return res.status(500).json({ message: "Login failed after registration" });
      res.status(201).json({ id: user.id, email: user.email });
    });
  } catch (error) {
    console.error("Register error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const login = (req: Request, res: Response) => {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) {
    const formatted = treeifyError(parsed.error);
    return res.status(400).json({ errors: formatted });
  }

  const user = req.user;
  if (!user) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  res.status(200).json({
    id: (user as any).id,
    email: (user as any).email,
  });
};

export const logout = (req: Request, res: Response) => {
  req.logout((err) => {
    if (err) {
      console.error("Logout error:", err);
      return res.status(500).json({ message: "Logout failed" });
    }
    res.status(200).json({ message: "Logged out successfully" });
  });
};

export const getMe = (req: Request, res: Response) => {
  const user = req.user as any;
  res.status(200).json({
    id: user.id,
    email: user.email,
    name: user.name,
  });
};
