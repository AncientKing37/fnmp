import { type NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ListingStatus, TransactionStatus, UserRole } from "@prisma/client";
import { z } from "zod";

// Schema for transaction updates
const updateTransactionSchema = z.object({
  status: z.nativeEnum(TransactionStatus),
  txHash: z.string().optional(),
  escrowAddress: z.string().optional(),
});

// GET handler to fetch a single transaction
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    const id = params.id;

    // Check if user is authenticated
    if (!session || !session.user.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Get the transaction
    const transaction = await prisma.transaction.findUnique({
      where: { id },
      include: {
        listing: true,
        buyer: {
          select: {
            id: true,
            name: true,
            username: true,
            image: true,
          },
        },
        seller: {
          select: {
            id: true,
            name: true,
            username: true,
            image: true,
            rating: true,
            verifiedSeller: true,
          },
        },
        escrow: {
          select: {
            id: true,
            name: true,
            username: true,
            image: true,
          },
        },
        reviews: true,
        chat: {
          include: {
            messages: {
              orderBy: { createdAt: 'asc' },
              take: 50, // Limit to most recent messages
            },
          },
        },
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
        { error: "You do not have access to this transaction" },
        { status: 403 }
      );
    }

    return NextResponse.json(transaction);
  } catch (error) {
    console.error("Error fetching transaction:", error);
    return NextResponse.json(
      { error: "Failed to fetch transaction" },
      { status: 500 }
    );
  }
}

// PATCH handler to update transaction status
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    const id = params.id;

    // Check if user is authenticated
    if (!session || !session.user.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Get the transaction
    const transaction = await prisma.transaction.findUnique({
      where: { id },
      include: {
        listing: true,
      },
    });

    if (!transaction) {
      return NextResponse.json(
        { error: "Transaction not found" },
        { status: 404 }
      );
    }

    const body = await req.json();

    // Validate update data
    const result = updateTransactionSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { error: "Invalid data", issues: result.error.issues },
        { status: 400 }
      );
    }

    const { status, txHash, escrowAddress } = result.data;

    // Check permission for status updates based on role
    const canUpdateStatus = await canUserUpdateTransactionStatus(
      session.user.id,
      session.user.role,
      transaction,
      status
    );

    if (!canUpdateStatus.allowed) {
      return NextResponse.json(
        { error: canUpdateStatus.message },
        { status: 403 }
      );
    }

    // Start a transaction to update the transaction status
    const updateData: any = {
      status,
    };

    // Add optional fields if provided
    if (txHash) updateData.txHash = txHash;
    if (escrowAddress) updateData.escrowAddress = escrowAddress;

    // Set completedAt if the transaction is completed
    if (status === TransactionStatus.COMPLETED) {
      updateData.completedAt = new Date();
    }

    // Update the transaction
    const updatedTransaction = await prisma.$transaction(async (tx) => {
      // Update transaction
      const updated = await tx.transaction.update({
        where: { id },
        data: updateData,
        include: {
          listing: true,
          buyer: {
            select: {
              id: true,
              name: true,
              username: true,
              image: true,
            },
          },
          seller: {
            select: {
              id: true,
              name: true,
              username: true,
              image: true,
            },
          },
        },
      });

      // Update listing status when transaction is completed or cancelled
      if (status === TransactionStatus.COMPLETED) {
        await tx.listing.update({
          where: { id: transaction.listingId },
          data: { status: ListingStatus.SOLD },
        });

        // Update seller stats
        await tx.user.update({
          where: { id: transaction.sellerId },
          data: {
            transactionCount: { increment: 1 },
            successfulTransactions: { increment: 1 },
          },
        });

        // Update buyer stats
        await tx.user.update({
          where: { id: transaction.buyerId },
          data: {
            transactionCount: { increment: 1 },
          },
        });
      } else if (status === TransactionStatus.CANCELLED || status === TransactionStatus.REFUNDED) {
        await tx.listing.update({
          where: { id: transaction.listingId },
          data: { status: ListingStatus.AVAILABLE },
        });
      }

      return updated;
    });

    return NextResponse.json({
      message: "Transaction updated successfully",
      transaction: updatedTransaction,
    });
  } catch (error) {
    console.error("Error updating transaction:", error);
    return NextResponse.json(
      { error: "Failed to update transaction" },
      { status: 500 }
    );
  }
}

// Helper function to check if a user can update a transaction status
async function canUserUpdateTransactionStatus(
  userId: string,
  userRole: string,
  transaction: any,
  newStatus: TransactionStatus
): Promise<{ allowed: boolean; message: string }> {
  // Admin and escrow can update any status
  if (userRole === UserRole.ADMIN || (transaction.escrowId === userId && userRole === UserRole.ESCROW)) {
    return { allowed: true, message: "" };
  }

  // Current transaction status
  const currentStatus = transaction.status;

  // Buyer permissions
  if (transaction.buyerId === userId) {
    // Buyer can update from PENDING to PAID
    if (currentStatus === TransactionStatus.PENDING && newStatus === TransactionStatus.PAID) {
      return { allowed: true, message: "" };
    }

    // Buyer can dispute a transaction
    if ((currentStatus === TransactionStatus.PAID || currentStatus === TransactionStatus.IN_ESCROW) &&
        newStatus === TransactionStatus.DISPUTED) {
      return { allowed: true, message: "" };
    }
  }

  // Seller permissions
  if (transaction.sellerId === userId) {
    // Seller can update from PAID to COMPLETED if no escrow involved
    if (currentStatus === TransactionStatus.PAID && newStatus === TransactionStatus.COMPLETED && !transaction.escrowId) {
      return { allowed: true, message: "" };
    }

    // Seller can dispute a transaction
    if ((currentStatus === TransactionStatus.PAID || currentStatus === TransactionStatus.IN_ESCROW) &&
        newStatus === TransactionStatus.DISPUTED) {
      return { allowed: true, message: "" };
    }
  }

  return {
    allowed: false,
    message: "You don't have permission to update this transaction to the requested status"
  };
}
