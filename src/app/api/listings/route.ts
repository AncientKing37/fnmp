import { type NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Category, ListingStatus, Rarity, UserRole } from "@prisma/client";
import { z } from "zod";

// Create a schema for listing creation
const listingSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  price: z.number().positive("Price must be a positive number"),
  cryptoCurrency: z.string().default("ETH"),
  images: z.array(z.string().url("Invalid image URL")).min(1, "At least one image is required"),
  category: z.nativeEnum(Category),
  rarity: z.nativeEnum(Rarity),
});

// GET handler to fetch listings with optional filters
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);

    // Extract query parameters for filtering
    const category = searchParams.get("category") as Category | null;
    const rarity = searchParams.get("rarity") as Rarity | null;
    const minPrice = searchParams.get("minPrice") ? Number.parseFloat(searchParams.get("minPrice")!) : null;
    const maxPrice = searchParams.get("maxPrice") ? Number.parseFloat(searchParams.get("maxPrice")!) : null;
    const search = searchParams.get("search");
    const page = Number.parseInt(searchParams.get("page") || "1");
    const limit = Number.parseInt(searchParams.get("limit") || "10");
    const skip = (page - 1) * limit;

    // Build the query filters
    const filters: any = {
      status: ListingStatus.AVAILABLE,
    };

    if (category) filters.category = category;
    if (rarity) filters.rarity = rarity;
    if (minPrice || maxPrice) {
      filters.price = {};
      if (minPrice) filters.price.gte = minPrice;
      if (maxPrice) filters.price.lte = maxPrice;
    }

    if (search) {
      filters.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    // Get listings with pagination
    const [listings, total] = await Promise.all([
      prisma.listing.findMany({
        where: filters,
        include: {
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
        },
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip,
      }),
      prisma.listing.count({ where: filters }),
    ]);

    return NextResponse.json({
      listings,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching listings:", error);
    return NextResponse.json(
      { error: "Failed to fetch listings" },
      { status: 500 }
    );
  }
}

// POST handler to create new listings
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    // Check if user is authenticated and is a seller
    if (!session || !session.user.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Verify the user is a seller
    if (session.user.role !== UserRole.SELLER && session.user.role !== UserRole.ADMIN) {
      return NextResponse.json(
        { error: "Only sellers can create listings" },
        { status: 403 }
      );
    }

    const body = await req.json();

    // Validate listing data
    const result = listingSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { error: "Invalid data", issues: result.error.issues },
        { status: 400 }
      );
    }

    // Create the listing
    const listing = await prisma.listing.create({
      data: {
        ...result.data,
        sellerId: session.user.id,
      },
    });

    return NextResponse.json(
      { message: "Listing created successfully", listing },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating listing:", error);
    return NextResponse.json(
      { error: "Failed to create listing" },
      { status: 500 }
    );
  }
}
