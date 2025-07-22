import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const toggleFollow = async (req: Request, res: Response) => {
  const { userId } = req.params;
  if(!userId) {
    return res.status(400).json({
        message : "Provide User Id"
    });
  }
  
  const currentUser = req.user as any;

  if (userId === currentUser.id) {
    return res.status(400).json({ message: "Cannot follow yourself" });
  }

  try {
    const user1 = await prisma.user.findUnique({ where: { id: userId } });

    if(!user1) {
      return res.status(400).json({message : "User not found"});
    }

    const existing = await prisma.follow.findUnique({
      where: {
        followerId_followingId: {
          followerId: currentUser.id,
          followingId: userId,
        },
      },
    });

    if (existing) {
      await prisma.follow.delete({
        where: {
          followerId_followingId: {
            followerId: currentUser.id,
            followingId: userId,
          },
        },
      });
      return res.status(200).json({ message: "Unfollowed" });
    }

    await prisma.follow.create({
      data: {
        followerId: currentUser.id,
        followingId: userId,
      },
    });

    res.status(201).json({ message: "Followed" });
  } catch (err) {
    console.error("Follow error:", err);
    res.status(500).json({ message: "Server error" });
  }
};


