import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const toggleLike = async (req: Request, res: Response) => {
  if(!req.params.postId) {
    return res.status(400).json({
        message : "Provide Post Id"
    });
  }
  const { postId } = req.params;
  const user = req.user as any;

  try {
    const post = await prisma.post.findUnique({ where: { id: postId } });

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    const existing = await prisma.like.findUnique({
      where: {
        userId_postId: {
          userId: user.id,
          postId,
        },
      },
    });

    if (existing) {
      await prisma.like.delete({
        where: {
          userId_postId: {
            userId: user.id,
            postId,
          },
        },
      });
      return res.status(200).json({ message: "Unliked" });
    }

    await prisma.like.create({
      data: {
        userId: user.id,
        postId,
      },
    });

    res.status(201).json({ message: "Liked" });
  } catch (err) {
    console.error("Like toggle error:", err);
    res.status(500).json({ message: "Server error" });
  }
};
