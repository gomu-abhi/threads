import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { createPostSchema } from "../validators/postSchemas";
import { treeifyError } from "zod";

const prisma = new PrismaClient();

export const createPost = async (req: Request, res: Response) => {
  const parsed = createPostSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ errors: treeifyError(parsed.error) });
  }

  const { content } = parsed.data;
  const user = req.user as any;

  try {
    const post = await prisma.post.create({
      data: {
        content,
        authorId: user.id,
      },
    });

    res.status(201).json(post);
  } catch (error) {
    console.error("Create post error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const getAllPosts = async (_req: Request, res: Response) => {
  try {
    const posts = await prisma.post.findMany({
      include: { author: true },
      orderBy: { createdAt: "desc" },
    });
    res.status(200).json(posts);
  } catch (error) {
    console.error("Fetch posts error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const getPostById = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const post = await prisma.post.findUnique({
      where: { id },
      include: { author: true },
    });

    if (!post) return res.status(404).json({ message: "Post not found" });

    res.status(200).json(post);
  } catch (error) {
    console.error("Get post error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const deletePost = async (req: Request, res: Response) => {
  const { id } = req.params;
  const user = req.user as any;

  try {
    const post = await prisma.post.findUnique({ where: { id } });

    if (!post || post.authorId !== user.id) {
      return res.status(403).json({ message: "Not authorized" });
    }

    await prisma.post.delete({ where: { id } });

    res.status(200).json({ message: "Post deleted" });
  } catch (error) {
    console.error("Delete post error:", error);
    res.status(500).json({ message: "Server error" });
  }
};