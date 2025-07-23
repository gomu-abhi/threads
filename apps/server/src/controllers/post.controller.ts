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
      take: 10, // paginate!
      orderBy: { createdAt: "desc" },
      include: {
        author: {
          select: { id: true, name: true },
        },
        likes: {
          select: { userId: true },
        },
        _count: {
          select: { comments: true },
        },
      },
    });    
    res.status(200).json(posts);
  } catch (error) {
    console.error("Fetch posts error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const getComments = async (req: Request, res: Response) => {
  const { id: postId } = req.params;

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

    return res.status(200).json({ comments });
  } catch (error) {
    console.error("Get comments error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};



export const getPostById = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const post = await prisma.post.findUnique({
      where: { id },
      include: {
        author: {
          select: { id: true, name: true },
        },
        likes: {
          select: { userId: true },
        },
        _count: {
          select: { comments: true },
        },
      },
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
  const userId = (req.user as any).id;

  try {
    const post = await prisma.post.findUnique({ where: { id } });

    if (!post || post.authorId !== userId) {
      return res.status(403).json({ message: "Not authorized" });
    }

    // Optional: cascade delete comments & likes manually
    await prisma.comment.deleteMany({ where: { postId: id } });
    await prisma.like.deleteMany({ where: { postId: id } });

    await prisma.post.delete({ where: { id } });

    res.json({ message: "Post deleted" });
  } catch (err) {
    res.status(500).json({ message: "Failed to delete post" });
  }
};

export const updatePost = async (req: Request, res: Response) => {
  const { id } = req.params;
  const userId = (req.user as any).id;
  const { content } = req.body;

  try {
    const post = await prisma.post.findUnique({ where: { id } });

    if (!post || post.authorId !== userId) {
      return res.status(403).json({ message: "Not authorized" });
    }

    const updated = await prisma.post.update({
      where: { id },
      data: { content },
    });

    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: "Failed to update post" });
  }
};

export const getTrendingPosts = async (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const pageSize = 10;
  const daysWindow = 10;

  try {
    const posts = await prisma.post.findMany({
      where: {
        createdAt: {
          gte: new Date(Date.now() - 1000 * 60 * 60 * 24 * daysWindow), // last 2 days
        },
      },
      orderBy: [
        { likes: { _count: "desc" } },
        { createdAt: "desc" },
      ],
      include: {
        author: {
          select: { id: true, name: true },
        },
        likes: {
          select: { userId: true },
        },
        _count: {
          select: { comments: true },
        },
      },
      skip: (page - 1) * pageSize,
      take: pageSize,
    });

    const total = await prisma.post.count({
      where: {
        createdAt: {
          gte: new Date(Date.now() - 1000 * 60 * 60 * 24 * daysWindow),
        },
      },
    });

    res.json({
      posts,
      total,
      page,
      totalPages: Math.ceil(total / pageSize),
    });
  } catch (err) {
    console.error("Error fetching trending posts:", err);
    res.status(500).json({ message: "Failed to fetch trending posts" });
  }
};

export const getFollowingPosts = async (req: Request, res: Response) => {
  const userId = (req.user as any).id;
  const page = parseInt(req.query.page as string) || 1;
  const pageSize = 10;

  if (!userId || typeof userId !== "string") {
    return res.status(400).json({ message: "Missing or invalid userId" });
  }

  try {
    // First, find the list of user IDs this user follows
    const following = await prisma.follow.findMany({
      where: { followerId: userId },
      select: { followingId: true },
    });

    const followedUserIds = following.map((f) => f.followingId);

    if (followedUserIds.length === 0) {
      return res.json({ posts: [], total: 0, page, totalPages: 0 });
    }

    const [posts, total] = await Promise.all([
      prisma.post.findMany({
        where: {
          authorId: { in: followedUserIds },
        },
        orderBy: {
          createdAt: "desc",
        },
        skip: (page - 1) * pageSize,
        take: pageSize,
        include: {
          author: {
            select: { id: true, name: true },
          },
          likes: {
            select: { userId: true },
          },
          _count: {
            select: { comments: true },
          },
        },
      }),
      prisma.post.count({
        where: {
          authorId: { in: followedUserIds },
        },
      }),
    ]);

    res.json({
      posts,
      total,
      page,
      totalPages: Math.ceil(total / pageSize),
    });
  } catch (err) {
    console.error("Error fetching following posts:", err);
    res.status(500).json({ message: "Failed to fetch following posts" });
  }
};