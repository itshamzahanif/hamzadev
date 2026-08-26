"use server";

import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/authSession";
import { revalidatePath } from "next/cache";

export async function getPaginatedMessages(page = 1, pageSize = 10) {
  try {
    const session = await getSession();
    if (!session?.user) {
      return { success: false, error: "Unauthorised" };
    }
    const skip = (page - 1) * pageSize;
    const [messages, total] = await Promise.all([
      prisma.contactMessage.findMany({
        skip,
        take: pageSize,
        orderBy: {
          createdAt: "desc",
        },
      }),

      prisma.contactMessage.count(),
    ]);

    const totalPages = Math.ceil(total / pageSize);

    return {
      success: true,
      data: {
        messages,
        pagination: {
          page,
          pageSize,
          total,
          totalPages,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1,
        },
      },
    };
  } catch (err) {
    console.error("Error fetching messages", err);
    return { success: false, message: "Error fetching message" };
  }
}

export async function getUnreadMessages() {
  try {
    const session = await getSession();
    if (!session?.user) {
      return { success: false, error: "Unauthorised" };
    }
    const unreadMessagesCount = await prisma.contactMessage.count({
      where: {
        read: false,
      },
    });

    return { success: true, unreadMessagesCount };
  } catch (err) {
    console.error("Error fetching unread messages", err);
    return { success: false, message: "Error fetching unread messages" };
  }
}

export async function getMessage(id: string) {
  try {
    const session = await getSession();
    if (!session?.user) {
      return { success: false, error: "Unauthorised" };
    }
    const messageId = Number(id);

    if (!Number.isInteger(messageId)) {
      return {
        success: false as const,
        error: "Invalid message ID",
      };
    }

    const message = await prisma.contactMessage.findUnique({
      where: {
        id: messageId,
      },
    });

    if (!message) {
      return {
        success: false as const,
        error: "Message not found",
      };
    }

    return {
      success: true as const,
      message,
    };
  } catch (err) {
    console.error("Error fetching message", err);

    return {
      success: false as const,
      error: "Error fetching message",
    };
  }
}

export async function updateMessageStatus(id: string) {
  try {
    const session = await getSession();
    if (!session?.user) {
      return { success: false, error: "Unauthorised" };
    }
    const messageId = Number(id);

    if (!Number.isInteger(messageId)) {
      return {
        success: false as const,
        error: "Invalid message ID",
      };
    }

    await prisma.contactMessage.update({
      where: {
        id: messageId,
      },
      data: {
        read: true,
      },
    });

    revalidatePath("/");
    revalidatePath("/admin");

    return { success: true, message: "Message status updated" };
  } catch (err) {
    console.error("Error updating message status", err);
    return { success: false, error: "Error updating message status" };
  }
}
