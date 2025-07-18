import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { treeifyError, z } from "zod";

const prisma = new PrismaClient();

const commentSchema = z.object({
  content: z.string().min(1),
});

export const addComment = async (req: Request, res: Response) => {
  const { postId } = req.params;

  if (!postId) {
    return res.status(400).json({
      message: "Provide Post Id",
    });
  }

  const user = req.user as any;

  const parsed = commentSchema.safeParse(req.body);

  if (!parsed.success) {
    const formatted = treeifyError(parsed.error);
    return res.status(400).json({ errors: formatted });
  }

  try {
    const post = await prisma.post.findUnique({ where: { id: postId } });

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    const comment = await prisma.comment.create({
      data: {
        content: parsed.data.content,
        userId: user.id,
        postId,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true, // Include only what's needed
          },
        },
      },
    });

    res.status(201).json(comment);
  } catch (err) {
    console.error("Comment error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

export const getComments = async (req: Request, res: Response) => {
  const { postId } = req.params;

  try {
    const post = await prisma.post.findUnique({ where: { id: postId } });

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }
    
    const comments = await prisma.comment.findMany({
      where: { postId },
      include: { user: true },
      orderBy: { createdAt: "asc" },
    });

    res.status(200).json(comments);
  } catch (err) {
    console.error("Fetch comments error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

export const deleteComment = async (req: Request, res: Response) => {
  const { id } = req.params;
  const user = req.user as any;

  try {
    const comment = await prisma.comment.findUnique({ where: { id } });

    if (!comment) {
      return res.status(404).json({ message: "Comment not found" });
    }

    if (comment.userId !== user.id) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    await prisma.comment.delete({ where: { id } });

    res.status(200).json({ message: "Comment deleted" });
  } catch (err) {
    console.error("Delete comment error:", err);
    res.status(500).json({ message: "Server error" });
  }
};
