import { type NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { upgradeToSeller } from "@/lib/auth-utils";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // User must be a buyer to upgrade to seller
    if (session.user.role !== "BUYER") {
      return NextResponse.json(
        { error: "Only buyers can upgrade to seller status" },
        { status: 400 }
      );
    }

    // Upgrade user to seller
    const upgradeResult = await upgradeToSeller(session.user.id);

    if (!upgradeResult.success) {
      return NextResponse.json(
        { error: upgradeResult.error },
        { status: 400 }
      );
    }

    return NextResponse.json({
      message: "Successfully upgraded to seller",
      user: upgradeResult.user,
    });
  } catch (error) {
    console.error("Upgrade to seller error:", error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}
