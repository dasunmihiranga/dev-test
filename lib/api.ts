// API utility functions for Laravel backend integration

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api"

class ApiClient {
  private getAuthHeaders() {
    const token = localStorage.getItem("token")
    return {
      "Content-Type": "application/json",
      "Accept": "application/json",
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
      const data = await response.json()

      if (!response.ok) {
        // Handle Laravel validation errors
        if (response.status === 422 && data.errors) {
          throw {
            status: response.status,
            message: data.message || "Validation failed",
            errors: data.errors,
            success: false
          }
        }
        throw {
          status: response.status,
          message: data.message || `HTTP error! status: ${response.status}`,
          success: false
        }
      }

      return data
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
    const result = await this.request("/auth/logout", {
      method: "POST",
    })
    // Clear token from localStorage on successful logout
    localStorage.removeItem("token")
    return result
  }

  async getCurrentUser() {
    return this.request("/auth/user")
  }

  // User endpoints
  async getProfile() {
    return this.request("/user/profile")
  }

  async searchUser(email: string) {
    return this.request(`/users/search?email=${encodeURIComponent(email)}`)
  }

  // Wallet endpoints
  async getBalance() {
    return this.request("/wallet/balance")
  }

  // Transaction endpoints
  async topUp(data: { amount: number; payment_method: string }) {
    return this.request("/topup", {
      method: "POST",
      body: JSON.stringify(data),
    })
  }

  async payBill(data: { biller_id: number; amount: number; account_number: string }) {
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

  async getTransactionHistory(filters?: { 
    type?: string; 
    status?: string; 
    search?: string;
    limit?: number;
    offset?: number;
  }) {
    const params = new URLSearchParams()
    if (filters?.type) params.append("type", filters.type)
    if (filters?.status) params.append("status", filters.status)
    if (filters?.search) params.append("search", filters.search)
    if (filters?.limit) params.append("limit", filters.limit.toString())
    if (filters?.offset) params.append("offset", filters.offset.toString())

    const queryString = params.toString()
    return this.request(`/transactions${queryString ? `?${queryString}` : ""}`)
  }

  async getTransaction(id: number) {
    return this.request(`/transactions/${id}`)
  }

  async getTransactionStats() {
    return this.request("/transactions/stats")
  }

  // Bill payment endpoints
  async getBillers() {
    return this.request("/billers")
  }

  // Dashboard endpoints
  async getDashboardStats() {
    return this.request("/dashboard/stats")
  }

  // Activity endpoints
  async getActivities(page: number = 1) {
    return this.request(`/activities?page=${page}`)
  }

  async getActivity(id: number) {
    return this.request(`/activities/${id}`)
  }
}

export const apiClient = new ApiClient()
