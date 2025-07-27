import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, email, password, password_confirmation } = body

    // This is a mock implementation for development
    // In production, this would proxy to your Laravel backend

    // Mock validation
    const errors: Record<string, string[]> = {}

    if (!name) errors.name = ["Name is required"]
    if (!email) errors.email = ["Email is required"]
    if (!password) errors.password = ["Password is required"]
    if (password !== password_confirmation) {
      errors.password_confirmation = ["Password confirmation does not match"]
    }
    if (password && password.length < 8) {
      errors.password = ["Password must be at least 8 characters"]
    }

    if (Object.keys(errors).length > 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Validation failed",
          errors,
        },
        { status: 422 },
      )
    }

    // Mock user creation - replace with actual Laravel API call
    return NextResponse.json(
      {
        success: true,
        user: {
          id: Math.floor(Math.random() * 1000),
          name,
          email,
          balance: 0.0,
        },
        token: "mock-jwt-token-" + Date.now(),
        message: "Registration successful",
      },
      { status: 201 },
    )
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: "Internal server error",
      },
      { status: 500 },
    )
  }
}
