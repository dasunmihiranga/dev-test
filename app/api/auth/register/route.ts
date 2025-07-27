import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, email, password, password_confirmation } = body

    // Validate input
    if (!name || !email || !password || !password_confirmation) {
      return NextResponse.json({ success: false, message: "All fields are required" }, { status: 400 })
    }

    if (password !== password_confirmation) {
      return NextResponse.json({ success: false, message: "Passwords do not match" }, { status: 400 })
    }

    // Simulate registration with Laravel backend
    // In a real app, this would proxy to your Laravel API

    const mockUser = {
      id: Date.now(), // Mock ID
      name: name,
      email: email,
      balance: 0.0,
    }

    const mockToken = "mock-jwt-token-" + Date.now()

    return NextResponse.json({
      success: true,
      user: mockUser,
      token: mockToken,
      message: "Registration successful",
    })
  } catch (error) {
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 })
  }
}
