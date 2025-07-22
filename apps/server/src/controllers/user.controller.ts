import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export const getUserById = async (req: Request, res: Response) => {
  const { id } = req.params;
  const currentUserId = (req as any).user?.id;

  if (!id) {
    return res.status(400).json({ message: "User not found" });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
        _count: {
          select: {
            followers: true,
            following: true,
          },
        },
      },
    });

    if (!user) return res.status(404).json({ message: "User not found" });
    // Check if current user follows the profile user
    let isFollowing = false;
    if (currentUserId && currentUserId !== id) {
      const follow = await prisma.follow.findUnique({
        where: {
          followerId_followingId: {
            followerId: currentUserId,
            followingId: id,
          },
        },
      });
      isFollowing = !!follow;
    }

    res.json({ ...user, isFollowing });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error fetching user" });
  }
};

export const getUserPosts = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const posts = await prisma.post.findMany({
      where: { authorId: id },
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

    res.json(posts);
  } catch (err) {
    res.status(500).json({ message: "Error fetching posts" });
  }
};

export const getFollowers = async (req: Request, res: Response) => {
  const { id } = req.params;
  const page = parseInt(req.query.page as string) || 1;
  const pageSize = 10;
  try {
    const followers = await prisma.follow.findMany({
      where: { followingId: id },
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: {
        follower: { select: { id: true, name: true } },
      },
    });
    const total = await prisma.follow.count({ where: { followingId: id } });

    res.json({
      users: followers.map((f) => f.follower),
      total,
      page,
    });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch followers" });
  }
};

export const getFollowing = async (req: Request, res: Response) => {
  const { id } = req.params;
  const page = parseInt(req.query.page as string) || 1;
  const pageSize = 10;

  try {
    const following = await prisma.follow.findMany({
      where: { followerId: id },
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: {
        following: { select: { id: true, name: true } },
      },
    });
    // console.log(following)
    const total = await prisma.follow.count({ where: { followerId: id } });

    res.json({
      users: following.map((f) => f.following),
      total,
      page,
    });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch followers" });
  }
};


export const getFollowCounts = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const [followers, following] = await Promise.all([
      prisma.follow.count({ where: { followingId: id } }),
      prisma.follow.count({ where: { followerId: id } }),
    ]);

    res.json({ followers, following });
  } catch (err) {
    res.status(500).json({ message: "Error fetching follow counts" });
  }
};