import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password } = body

    // Simulate authentication with Laravel backend
    // In a real app, this would proxy to your Laravel API

    // Mock successful login
    if (email && password) {
      const mockUser = {
        id: 1,
        name: "John Doe",
        email: email,
        balance: 1250.75,
      }

      const mockToken = "mock-jwt-token-" + Date.now()

      return NextResponse.json({
        success: true,
        user: mockUser,
        token: mockToken,
        message: "Login successful",
      })
    }

    return NextResponse.json({ success: false, message: "Invalid credentials" }, { status: 401 })
  } catch (error) {
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 })
  }
}
