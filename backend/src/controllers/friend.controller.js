import prisma from "../prisma/client.js";
import { getRelationshipState } from "./user.controller.js";

export const sendFriendRequest = async (req, res) => {
  try {
    const senderId = req.user.id;
    const { receiverId, receiverUsername } = req.body;

    let targetUser = null;

    if (receiverId) {
      targetUser = await prisma.user.findUnique({
        where: { id: receiverId },
        select: { id: true, username: true },
      });
    } else if (receiverUsername) {
      targetUser = await prisma.user.findFirst({
        where: {
          username: {
            equals: receiverUsername.trim().toLowerCase(),
            mode: "insensitive",
          },
        },
        select: { id: true, username: true },
      });
    }

    if (!targetUser) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    if (senderId === targetUser.id) {
      return res.status(400).json({ success: false, message: "You cannot send a friend request to yourself" });
    }

    const existingRequest = await prisma.friendRequest.findFirst({
      where: {
        OR: [
          { senderId, receiverId: targetUser.id },
          { senderId: targetUser.id, receiverId: senderId },
        ],
      },
    });

    if (existingRequest) {
      if (existingRequest.status === "ACCEPTED") {
        return res.status(409).json({ success: false, message: "You are already friends", relationship: "FRIENDS" });
      }

      if (existingRequest.status === "PENDING") {
        if (existingRequest.senderId === senderId) {
          return res.status(409).json({ success: false, message: "Friend request already sent", relationship: "PENDING_SENT" });
        } else {
          // Reverse request: opponent already sent a request to sender. Auto-accept!
          await prisma.friendRequest.update({
            where: { id: existingRequest.id },
            data: { status: "ACCEPTED" },
          });
          return res.status(200).json({
            success: true,
            message: "Friend request accepted!",
            relationship: "FRIENDS",
          });
        }
      }

      // If existing status is REJECTED, reset it to PENDING with new sender/receiver
      await prisma.friendRequest.update({
        where: { id: existingRequest.id },
        data: {
          senderId,
          receiverId: targetUser.id,
          status: "PENDING",
        },
      });
    } else {
      await prisma.friendRequest.create({
        data: {
          senderId,
          receiverId: targetUser.id,
          status: "PENDING",
        },
      });
    }

    return res.status(200).json({
      success: true,
      message: "Friend request sent successfully",
      relationship: "PENDING_SENT",
    });
  } catch (error) {
    console.error("Send friend request error:", error);
    return res.status(500).json({ success: false, message: "Failed to send friend request" });
  }
};

export const acceptFriendRequest = async (req, res) => {
  try {
    const currentUserId = req.user.id;
    const { requestId, friendId } = req.body;

    const request = await prisma.friendRequest.findFirst({
      where: {
        OR: [
          ...(requestId ? [{ id: requestId, receiverId: currentUserId, status: "PENDING" }] : []),
          ...(friendId ? [{ senderId: friendId, receiverId: currentUserId, status: "PENDING" }] : []),
        ],
      },
    });

    if (!request) {
      return res.status(404).json({ success: false, message: "Friend request not found or already processed" });
    }

    await prisma.friendRequest.update({
      where: { id: request.id },
      data: { status: "ACCEPTED" },
    });

    return res.status(200).json({
      success: true,
      message: "Friend request accepted",
      relationship: "FRIENDS",
    });
  } catch (error) {
    console.error("Accept friend request error:", error);
    return res.status(500).json({ success: false, message: "Failed to accept friend request" });
  }
};

export const rejectFriendRequest = async (req, res) => {
  try {
    const currentUserId = req.user.id;
    const { requestId, friendId } = req.body;

    const request = await prisma.friendRequest.findFirst({
      where: {
        OR: [
          ...(requestId ? [{ id: requestId, receiverId: currentUserId, status: "PENDING" }] : []),
          ...(friendId ? [{ senderId: friendId, receiverId: currentUserId, status: "PENDING" }] : []),
        ],
      },
    });

    if (!request) {
      return res.status(404).json({ success: false, message: "Friend request not found" });
    }

    await prisma.friendRequest.update({
      where: { id: request.id },
      data: { status: "REJECTED" },
    });

    return res.status(200).json({
      success: true,
      message: "Friend request rejected",
      relationship: "NONE",
    });
  } catch (error) {
    console.error("Reject friend request error:", error);
    return res.status(500).json({ success: false, message: "Failed to reject friend request" });
  }
};

export const removeFriend = async (req, res) => {
  try {
    const currentUserId = req.user.id;
    const { friendId } = req.body;

    if (!friendId) {
      return res.status(400).json({ success: false, message: "Friend ID required" });
    }

    const request = await prisma.friendRequest.findFirst({
      where: {
        OR: [
          { senderId: currentUserId, receiverId: friendId, status: "ACCEPTED" },
          { senderId: friendId, receiverId: currentUserId, status: "ACCEPTED" },
        ],
      },
    });

    if (!request) {
      return res.status(404).json({ success: false, message: "Friendship not found" });
    }

    await prisma.friendRequest.delete({
      where: { id: request.id },
    });

    return res.status(200).json({
      success: true,
      message: "Friend removed",
      relationship: "NONE",
    });
  } catch (error) {
    console.error("Remove friend error:", error);
    return res.status(500).json({ success: false, message: "Failed to remove friend" });
  }
};

export const getFriendsList = async (req, res) => {
  try {
    const userId = req.user.id;

    const [accepted, incoming, outgoing] = await Promise.all([
      prisma.friendRequest.findMany({
        where: {
          OR: [{ senderId: userId }, { receiverId: userId }],
          status: "ACCEPTED",
        },
        include: {
          sender: { select: { id: true, username: true, avatar: true, rating: true } },
          receiver: { select: { id: true, username: true, avatar: true, rating: true } },
        },
      }),
      prisma.friendRequest.findMany({
        where: {
          receiverId: userId,
          status: "PENDING",
        },
        include: {
          sender: { select: { id: true, username: true, avatar: true, rating: true } },
        },
      }),
      prisma.friendRequest.findMany({
        where: {
          senderId: userId,
          status: "PENDING",
        },
        include: {
          receiver: { select: { id: true, username: true, avatar: true, rating: true } },
        },
      }),
    ]);

    const friends = accepted.map((reqItem) => {
      const friendObj = reqItem.senderId === userId ? reqItem.receiver : reqItem.sender;
      return {
        ...friendObj,
        requestId: reqItem.id,
      };
    });

    const incomingRequests = incoming.map((reqItem) => ({
      requestId: reqItem.id,
      user: reqItem.sender,
      createdAt: reqItem.createdAt,
    }));

    const outgoingRequests = outgoing.map((reqItem) => ({
      requestId: reqItem.id,
      user: reqItem.receiver,
      createdAt: reqItem.createdAt,
    }));

    return res.status(200).json({
      success: true,
      friends,
      incomingRequests,
      outgoingRequests,
    });
  } catch (error) {
    console.error("Get friends list error:", error);
    return res.status(500).json({ success: false, message: "Failed to fetch friends list" });
  }
};
