import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password } = body

    // This is a mock implementation for development
    // In production, this would proxy to your Laravel backend

    // Mock validation
    if (!email || !password) {
      return NextResponse.json(
        {
          success: false,
          message: "Email and password are required",
          errors: {
            email: !email ? ["Email is required"] : [],
            password: !password ? ["Password is required"] : [],
          },
        },
        { status: 422 },
      )
    }

    // Mock authentication - replace with actual Laravel API call
    if (email === "demo@example.com" && password === "password") {
      return NextResponse.json({
        success: true,
        user: {
          id: 1,
          name: "Demo User",
          email: "demo@example.com",
          balance: 1250.75,
        },
        token: "mock-jwt-token-" + Date.now(),
        message: "Login successful",
      })
    }

    return NextResponse.json(
      {
        success: false,
        message: "Invalid credentials",
      },
      { status: 401 },
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
