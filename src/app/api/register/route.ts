import { type NextRequest, NextResponse } from "next/server";
import { registerUser } from "@/lib/auth-utils";
import { UserRole } from "@prisma/client";
import { z } from "zod";

// Create a schema for user registration validation
const userSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  role: z.enum([UserRole.BUYER, UserRole.SELLER]).optional(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Validate the request body
    const result = userSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { error: "Invalid data", issues: result.error.issues },
        { status: 400 }
      );
    }

    const { name, email, password, role } = result.data;

    // Register the user
    const registerResult = await registerUser({
      name,
      email,
      password,
      role: role || UserRole.BUYER,
    });

    if (!registerResult.success) {
      return NextResponse.json(
        { error: registerResult.error },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        message: "User registered successfully",
        user: registerResult.user
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}
