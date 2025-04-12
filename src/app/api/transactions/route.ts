import { type NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ListingStatus, TransactionStatus, UserRole } from "@prisma/client";
import { z } from "zod";

// Create a schema for transaction creation
const transactionSchema = z.object({
  listingId: z.string().uuid("Invalid listing ID"),
  cryptoCurrency: z.string(),
});

// GET handler to fetch user's transactions
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    // Check if user is authenticated
    if (!session || !session.user.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    const role = searchParams.get("role"); // "buyer", "seller", or "escrow"
    const status = searchParams.get("status") as TransactionStatus | null;
    const page = Number.parseInt(searchParams.get("page") || "1");
    const limit = Number.parseInt(searchParams.get("limit") || "10");
    const skip = (page - 1) * limit;

    // Build query based on user role
    const filters: any = {};

    if (role === "buyer") {
      filters.buyerId = session.user.id;
    } else if (role === "seller") {
      filters.sellerId = session.user.id;
    } else if (role === "escrow") {
      // Only escrow admins can see transactions they're handling
      if (session.user.role !== UserRole.ESCROW && session.user.role !== UserRole.ADMIN) {
        return NextResponse.json(
          { error: "Unauthorized to view escrow transactions" },
          { status: 403 }
        );
      }
      filters.escrowId = session.user.id;
    } else {
      // If no role specified, show all transactions relevant to the user
      filters.OR = [
        { buyerId: session.user.id },
        { sellerId: session.user.id },
      ];

      // Add escrow role transactions for escrow admins
      if (session.user.role === UserRole.ESCROW || session.user.role === UserRole.ADMIN) {
        filters.OR.push({ escrowId: session.user.id });
      }
    }

    // Add status filter if provided
    if (status) {
      filters.status = status;
    }

    // Get transactions with pagination
    const [transactions, total] = await Promise.all([
      prisma.transaction.findMany({
        where: filters,
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
        },
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip,
      }),
      prisma.transaction.count({ where: filters }),
    ]);

    return NextResponse.json({
      transactions,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching transactions:", error);
    return NextResponse.json(
      { error: "Failed to fetch transactions" },
      { status: 500 }
    );
  }
}

// POST handler to create a new transaction
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    // Check if user is authenticated
    if (!session || !session.user.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await req.json();

    // Validate the request data
    const result = transactionSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { error: "Invalid data", issues: result.error.issues },
        { status: 400 }
      );
    }

    const { listingId, cryptoCurrency } = result.data;

    // Check if the listing exists and is available
    const listing = await prisma.listing.findUnique({
      where: { id: listingId },
    });

    if (!listing) {
      return NextResponse.json(
        { error: "Listing not found" },
        { status: 404 }
      );
    }

    if (listing.status !== ListingStatus.AVAILABLE) {
      return NextResponse.json(
        { error: "This listing is not available for purchase" },
        { status: 400 }
      );
    }

    // Prevent buying your own listing
    if (listing.sellerId === session.user.id) {
      return NextResponse.json(
        { error: "You cannot buy your own listing" },
        { status: 400 }
      );
    }

    // Assign an escrow admin (simplified for now - would implement proper assignment logic)
    const escrowAdmin = await prisma.user.findFirst({
      where: { role: UserRole.ESCROW },
    });

    // Start a transaction to update listing status and create transaction
    const [transaction] = await prisma.$transaction([
      // Create transaction
      prisma.transaction.create({
        data: {
          amount: listing.price,
          cryptoCurrency: cryptoCurrency || listing.cryptoCurrency,
          status: TransactionStatus.PENDING,
          buyerId: session.user.id,
          sellerId: listing.sellerId,
          listingId: listing.id,
          escrowId: escrowAdmin?.id, // May be null if no escrow admin found
        },
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
          escrow: {
            select: {
              id: true,
              name: true,
              username: true,
              image: true,
            },
          },
        },
      }),

      // Update listing status to PENDING
      prisma.listing.update({
        where: { id: listing.id },
        data: { status: ListingStatus.PENDING },
      }),
    ]);

    // Create a chat room for the transaction
    await prisma.chat.create({
      data: {
        transactionId: transaction.id,
      },
    });

    return NextResponse.json(
      {
        message: "Transaction created successfully",
        transaction,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating transaction:", error);
    return NextResponse.json(
      { error: "Failed to create transaction" },
      { status: 500 }
    );
  }
}
