import { type NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { UserRole } from "@prisma/client";

// Schema for message creation
const messageSchema = z.object({
  content: z.string().min(1, "Message cannot be empty").max(1000, "Message too long"),
});

// GET handler to fetch messages for a transaction
export async function GET(
  req: NextRequest,
  { params }: { params: { transactionId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    const transactionId = params.transactionId;

    // Check if user is authenticated
    if (!session || !session.user.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Get the transaction to check if user is involved
    const transaction = await prisma.transaction.findUnique({
      where: { id: transactionId },
      select: {
        id: true,
        buyerId: true,
        sellerId: true,
        escrowId: true,
      },
    });

    if (!transaction) {
      return NextResponse.json(
        { error: "Transaction not found" },
        { status: 404 }
      );
    }

    // Check if user is involved in the transaction
    const isInvolved =
      transaction.buyerId === session.user.id ||
      transaction.sellerId === session.user.id ||
      transaction.escrowId === session.user.id ||
      session.user.role === UserRole.ADMIN;

    if (!isInvolved) {
      return NextResponse.json(
        { error: "You do not have access to this chat" },
        { status: 403 }
      );
    }

    // Get the chat and messages
    const chat = await prisma.chat.findUnique({
      where: { transactionId },
      include: {
        messages: {
          orderBy: { createdAt: 'asc' },
          include: {
            sender: {
              select: {
                id: true,
                name: true,
                username: true,
                image: true,
                role: true,
              },
            },
          },
        },
        transaction: {
          select: {
            id: true,
            buyerId: true,
            sellerId: true,
            escrowId: true,
            status: true,
          },
        },
      },
    });

    if (!chat) {
      // Create chat if it doesn't exist
      const newChat = await prisma.chat.create({
        data: {
          transactionId,
        },
        include: {
          messages: [],
          transaction: {
            select: {
              id: true,
              buyerId: true,
              sellerId: true,
              escrowId: true,
              status: true,
            },
          },
        },
      });

      return NextResponse.json(newChat);
    }

    // Mark messages as read for the current user
    await prisma.message.updateMany({
      where: {
        chatId: chat.id,
        recipientId: session.user.id,
        isRead: false,
      },
      data: {
        isRead: true,
      },
    });

    return NextResponse.json(chat);
  } catch (error) {
    console.error("Error fetching chat:", error);
    return NextResponse.json(
      { error: "Failed to fetch chat" },
      { status: 500 }
    );
  }
}

// POST handler to send a message
export async function POST(
  req: NextRequest,
  { params }: { params: { transactionId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    const transactionId = params.transactionId;

    // Check if user is authenticated
    if (!session || !session.user.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Get the transaction to check if user is involved
    const transaction = await prisma.transaction.findUnique({
      where: { id: transactionId },
      select: {
        id: true,
        buyerId: true,
        sellerId: true,
        escrowId: true,
      },
    });

    if (!transaction) {
      return NextResponse.json(
        { error: "Transaction not found" },
        { status: 404 }
      );
    }

    // Check if user is involved in the transaction
    const isInvolved =
      transaction.buyerId === session.user.id ||
      transaction.sellerId === session.user.id ||
      transaction.escrowId === session.user.id ||
      session.user.role === UserRole.ADMIN;

    if (!isInvolved) {
      return NextResponse.json(
        { error: "You do not have access to this chat" },
        { status: 403 }
      );
    }

    const body = await req.json();

    // Validate message data
    const result = messageSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { error: "Invalid data", issues: result.error.issues },
        { status: 400 }
      );
    }

    // Get or create chat
    let chat = await prisma.chat.findUnique({
      where: { transactionId },
    });

    if (!chat) {
      chat = await prisma.chat.create({
        data: {
          transactionId,
        },
      });
    }

    // Determine the recipient(s) of the message
    let recipientId: string;

    if (session.user.id === transaction.buyerId) {
      // If sender is buyer, recipient is seller
      recipientId = transaction.sellerId;
    } else if (session.user.id === transaction.sellerId) {
      // If sender is seller, recipient is buyer
      recipientId = transaction.buyerId;
    } else {
      // If sender is escrow or admin, determine appropriate recipient
      // For simplicity, we'll default to the buyer, but this could be more sophisticated
      recipientId = transaction.buyerId;
    }

    // Create the message
    const message = await prisma.message.create({
      data: {
        content: result.data.content,
        chatId: chat.id,
        senderId: session.user.id,
        recipientId,
      },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            username: true,
            image: true,
            role: true,
          },
        },
      },
    });

    return NextResponse.json(
      { message: "Message sent successfully", data: message },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error sending message:", error);
    return NextResponse.json(
      { error: "Failed to send message" },
      { status: 500 }
    );
  }
}
