import { type NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { TransactionStatus } from "@prisma/client";
import { z } from "zod";

// Schema for review creation
const reviewSchema = z.object({
  transactionId: z.string().uuid("Invalid transaction ID"),
  targetUserId: z.string().uuid("Invalid user ID"),
  rating: z.number().int().min(1).max(5),
  comment: z.string().max(500, "Comment too long").optional(),
});

// GET handler to fetch reviews for a user
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    const page = Number.parseInt(searchParams.get("page") || "1");
    const limit = Number.parseInt(searchParams.get("limit") || "10");
    const skip = (page - 1) * limit;

    // Get reviews for the user
    const [reviews, total] = await Promise.all([
      prisma.review.findMany({
        where: { targetUserId: userId },
        include: {
          reviewer: {
            select: {
              id: true,
              name: true,
              username: true,
              image: true,
            },
          },
          transaction: {
            select: {
              id: true,
              createdAt: true,
              listing: {
                select: {
                  id: true,
                  title: true,
                  images: true,
                  category: true,
                  rarity: true,
                },
              },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip,
      }),
      prisma.review.count({ where: { targetUserId: userId } }),
    ]);

    // Calculate average rating
    const ratingStats = await prisma.review.aggregate({
      where: { targetUserId: userId },
      _avg: { rating: true },
      _count: { rating: true },
    });

    return NextResponse.json({
      reviews,
      stats: {
        averageRating: ratingStats._avg.rating || 0,
        totalReviews: ratingStats._count.rating || 0,
      },
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching reviews:", error);
    return NextResponse.json(
      { error: "Failed to fetch reviews" },
      { status: 500 }
    );
  }
}

// POST handler to create a review
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

    // Validate review data
    const result = reviewSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { error: "Invalid data", issues: result.error.issues },
        { status: 400 }
      );
    }

    const { transactionId, targetUserId, rating, comment } = result.data;

    // Check if transaction exists and is completed
    const transaction = await prisma.transaction.findUnique({
      where: { id: transactionId },
    });

    if (!transaction) {
      return NextResponse.json(
        { error: "Transaction not found" },
        { status: 404 }
      );
    }

    if (transaction.status !== TransactionStatus.COMPLETED) {
      return NextResponse.json(
        { error: "Can only review completed transactions" },
        { status: 400 }
      );
    }

    // Check if user is involved in the transaction
    if (transaction.buyerId !== session.user.id && transaction.sellerId !== session.user.id) {
      return NextResponse.json(
        { error: "You can only review transactions you are involved in" },
        { status: 403 }
      );
    }

    // Buyer can review seller and vice versa
    if (session.user.id === transaction.buyerId && targetUserId !== transaction.sellerId) {
      return NextResponse.json(
        { error: "Buyer can only review the seller" },
        { status: 400 }
      );
    }

    if (session.user.id === transaction.sellerId && targetUserId !== transaction.buyerId) {
      return NextResponse.json(
        { error: "Seller can only review the buyer" },
        { status: 400 }
      );
    }

    // Check if user has already reviewed this transaction
    const existingReview = await prisma.review.findUnique({
      where: {
        reviewerId_transactionId: {
          reviewerId: session.user.id,
          transactionId,
        },
      },
    });

    if (existingReview) {
      return NextResponse.json(
        { error: "You have already reviewed this transaction" },
        { status: 400 }
      );
    }

    // Create the review
    const review = await prisma.review.create({
      data: {
        rating,
        comment,
        reviewerId: session.user.id,
        targetUserId,
        transactionId,
      },
    });

    // Update user's average rating
    const userRatings = await prisma.review.aggregate({
      where: { targetUserId },
      _avg: { rating: true },
    });

    await prisma.user.update({
      where: { id: targetUserId },
      data: { rating: userRatings._avg.rating || 0 },
    });

    return NextResponse.json(
      { message: "Review submitted successfully", review },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating review:", error);
    return NextResponse.json(
      { error: "Failed to submit review" },
      { status: 500 }
    );
  }
}
