import { NextResponse } from "next/server";

export async function POST() {
  // Create a guest session with limited privileges
  // For demo purposes, we return a dummy guest user object and token

  const guestUser = {
    id: "guest",
    name: "Guest User",
    email: null,
    role: "guest",
  };

  const token = "guest-token"; // In real app, generate a JWT or session token

  return NextResponse.json({
    user: guestUser,
    token,
  });
}
