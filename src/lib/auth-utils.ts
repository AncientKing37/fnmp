import bcrypt from "bcrypt";
import { prisma } from "./prisma";
import { UserRole } from "@prisma/client";

export async function hashPassword(password: string): Promise<string> {
  const saltRounds = 10;
  return bcrypt.hash(password, saltRounds);
}

export async function registerUser({
  name,
  email,
  password,
  role = UserRole.BUYER,
}: {
  name: string;
  email: string;
  password: string;
  role?: UserRole;
}) {
  const hashedPassword = await hashPassword(password);

  try {
    const user = await prisma.user.create({
      data: {
        name,
        email,
        hashedPassword,
        role,
      },
    });

    // Remove sensitive data before returning
    const { hashedPassword: _, ...userWithoutPassword } = user;
    return { success: true, user: userWithoutPassword };
  } catch (error) {
    console.error("Error registering user:", error);
    return { success: false, error: "Failed to register user" };
  }
}

export async function updateUserProfile({
  userId,
  data,
}: {
  userId: string;
  data: {
    name?: string;
    image?: string;
    username?: string;
    bio?: string;
    walletAddress?: string;
  };
}) {
  try {
    const user = await prisma.user.update({
      where: { id: userId },
      data,
    });

    // Remove sensitive data before returning
    const { hashedPassword: _, ...userWithoutPassword } = user;
    return { success: true, user: userWithoutPassword };
  } catch (error) {
    console.error("Error updating user profile:", error);
    return { success: false, error: "Failed to update profile" };
  }
}

export async function upgradeToSeller(userId: string) {
  try {
    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        role: UserRole.SELLER,
      },
    });

    // Remove sensitive data before returning
    const { hashedPassword: _, ...userWithoutPassword } = user;
    return { success: true, user: userWithoutPassword };
  } catch (error) {
    console.error("Error upgrading user to seller:", error);
    return { success: false, error: "Failed to upgrade to seller" };
  }
}
