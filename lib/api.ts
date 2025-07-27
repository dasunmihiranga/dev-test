// API utility functions for Laravel backend integration

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api"

class ApiClient {
  private getAuthHeaders() {
    const token = localStorage.getItem("token")
    return {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
    }
  }

  async request(endpoint: string, options: RequestInit = {}) {
    const url = `${API_BASE_URL}${endpoint}`
    const config = {
      headers: this.getAuthHeaders(),
      ...options,
    }

    try {
      const response = await fetch(url, config)

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      return await response.json()
    } catch (error) {
      console.error("API request failed:", error)
      throw error
    }
  }

  // Auth endpoints
  async login(credentials: { email: string; password: string }) {
    return this.request("/auth/login", {
      method: "POST",
      body: JSON.stringify(credentials),
    })
  }

  async register(userData: { name: string; email: string; password: string; password_confirmation: string }) {
    return this.request("/auth/register", {
      method: "POST",
      body: JSON.stringify(userData),
    })
  }

  async logout() {
    return this.request("/auth/logout", {
      method: "POST",
    })
  }

  // User endpoints
  async getProfile() {
    return this.request("/user/profile")
  }

  async searchUser(email: string) {
    return this.request(`/users/search?email=${encodeURIComponent(email)}`)
  }

  // Transaction endpoints
  async topUp(data: { amount: number; payment_method: string }) {
    return this.request("/topup", {
      method: "POST",
      body: JSON.stringify(data),
    })
  }

  async payBill(data: { biller_id: string; amount: number; account_number: string }) {
    return this.request("/bills/pay", {
      method: "POST",
      body: JSON.stringify(data),
    })
  }

  async transferFunds(data: { recipient_id: number; amount: number; note?: string }) {
    return this.request("/transfer", {
      method: "POST",
      body: JSON.stringify(data),
    })
  }

  async getTransactionHistory(filters?: { type?: string; status?: string; search?: string }) {
    const params = new URLSearchParams()
    if (filters?.type) params.append("type", filters.type)
    if (filters?.status) params.append("status", filters.status)
    if (filters?.search) params.append("search", filters.search)

    const queryString = params.toString()
    return this.request(`/transactions${queryString ? `?${queryString}` : ""}`)
  }

  async getDashboardStats() {
    return this.request("/dashboard/stats")
  }
}

export const apiClient = new ApiClient()
