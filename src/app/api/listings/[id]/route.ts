import { type NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Category, ListingStatus, Rarity, UserRole } from "@prisma/client";
import { z } from "zod";

// Create a schema for listing updates
const updateListingSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters").optional(),
  description: z.string().min(10, "Description must be at least 10 characters").optional(),
  price: z.number().positive("Price must be a positive number").optional(),
  cryptoCurrency: z.string().optional(),
  images: z.array(z.string().url("Invalid image URL")).min(1, "At least one image is required").optional(),
  category: z.nativeEnum(Category).optional(),
  rarity: z.nativeEnum(Rarity).optional(),
  status: z.nativeEnum(ListingStatus).optional(),
});

// GET handler to fetch a single listing by ID
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;

    const listing = await prisma.listing.findUnique({
      where: { id },
      include: {
        seller: {
          select: {
            id: true,
            name: true,
            username: true,
            image: true,
            rating: true,
            verifiedSeller: true,
            transactionCount: true,
            successfulTransactions: true,
          },
        },
      },
    });

    if (!listing) {
      return NextResponse.json(
        { error: "Listing not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(listing);
  } catch (error) {
    console.error("Error fetching listing:", error);
    return NextResponse.json(
      { error: "Failed to fetch listing" },
      { status: 500 }
    );
  }
}

// PATCH handler to update a listing
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

    // Get the listing to check ownership
    const listing = await prisma.listing.findUnique({
      where: { id },
      select: { sellerId: true },
    });

    if (!listing) {
      return NextResponse.json(
        { error: "Listing not found" },
        { status: 404 }
      );
    }

    // Verify ownership or admin privileges
    if (listing.sellerId !== session.user.id && session.user.role !== UserRole.ADMIN) {
      return NextResponse.json(
        { error: "You don't have permission to update this listing" },
        { status: 403 }
      );
    }

    const body = await req.json();

    // Validate update data
    const result = updateListingSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { error: "Invalid data", issues: result.error.issues },
        { status: 400 }
      );
    }

    // Update the listing
    const updatedListing = await prisma.listing.update({
      where: { id },
      data: result.data,
    });

    return NextResponse.json({
      message: "Listing updated successfully",
      listing: updatedListing,
    });
  } catch (error) {
    console.error("Error updating listing:", error);
    return NextResponse.json(
      { error: "Failed to update listing" },
      { status: 500 }
    );
  }
}

// DELETE handler to remove a listing
export async function DELETE(
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

    // Get the listing to check ownership
    const listing = await prisma.listing.findUnique({
      where: { id },
      select: { sellerId: true, status: true },
    });

    if (!listing) {
      return NextResponse.json(
        { error: "Listing not found" },
        { status: 404 }
      );
    }

    // Verify ownership or admin privileges
    if (listing.sellerId !== session.user.id && session.user.role !== UserRole.ADMIN) {
      return NextResponse.json(
        { error: "You don't have permission to delete this listing" },
        { status: 403 }
      );
    }

    // Don't allow deletion if the listing is involved in an active transaction
    const hasActiveTransaction = await prisma.transaction.findFirst({
      where: {
        listingId: id,
        status: {
          in: ['PENDING', 'PAID', 'IN_ESCROW'],
        },
      },
    });

    if (hasActiveTransaction) {
      return NextResponse.json(
        { error: "Cannot delete a listing with active transactions" },
        { status: 400 }
      );
    }

    // Soft delete by updating status
    await prisma.listing.update({
      where: { id },
      data: { status: ListingStatus.DELETED },
    });

    return NextResponse.json({
      message: "Listing deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting listing:", error);
    return NextResponse.json(
      { error: "Failed to delete listing" },
      { status: 500 }
    );
  }
}
