import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export const searchPostsAndUsers = async (req: Request, res: Response) => {
    const { q } = req.query;

  if (!q || typeof q !== 'string' || q.trim().length < 2) {
    return res.status(400).json({ message: 'Search query must be at least 2 characters long' });
  }

  try {
    const [posts, users] = await Promise.all([
      prisma.post.findMany({
        where: {
          content: {
            contains: q,
            mode: 'insensitive',
          },
        },
        include: {
          author: { select: { id: true, name: true } },
          _count: { select: { comments: true } },
          likes: { select: { userId: true } },
        },
        take: 10,
        orderBy: { createdAt: 'desc' },
      }),

      prisma.user.findMany({
        where: {
          name: {
            contains: q,
            mode: 'insensitive',
          },
        },
        select: {
          id: true,
          name: true,
        },
        take: 10,
      }),
    ]);

    res.status(200).json({ posts, users });

  } catch (error) {
    console.error('Search API error:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
}