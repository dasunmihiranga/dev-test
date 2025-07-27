"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import {
  Receipt,
  Send,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  Plus,
  DollarSign,
  Activity,
  Clock,
} from "lucide-react"
import { apiClient } from "@/lib/api"

interface Transaction {
  id: number
  type: "topup" | "bill_payment" | "transfer_sent" | "transfer_received"
  amount: number
  description: string
  created_at: string
  reference?: string
  recipient?: string
  biller?: string
}

interface DashboardStats {
  current_balance: number
  monthly_spending: {
    current_month: number
    previous_month: number
  }
  recent_transactions_count: number
  pending_transactions_count: number
  transaction_summary: {
    topups: { count: number; total_amount: number }
    transfers: {
      sent: { count: number; total_amount: number }
      received: { count: number; total_amount: number }
    }
    bills: { count: number; total_amount: number }
  }
}

export default function DashboardPage() {
  const [recentTransactions, setRecentTransactions] = useState<Transaction[]>([])
  const [stats, setStats] = useState<DashboardStats>({
    current_balance: 0,
    monthly_spending: { current_month: 0, previous_month: 0 },
    recent_transactions_count: 0,
    pending_transactions_count: 0,
    transaction_summary: {
      topups: { count: 0, total_amount: 0 },
      transfers: {
        sent: { count: 0, total_amount: 0 },
        received: { count: 0, total_amount: 0 },
      },
      bills: { count: 0, total_amount: 0 },
    },
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)

      // Fetch dashboard stats from Laravel backend
      const statsResponse = await apiClient.getDashboardStats()

      if (statsResponse.success) {
        setStats(statsResponse.stats)

        // Update user balance in localStorage
        const user = JSON.parse(localStorage.getItem("user") || "{}")
        user.balance = statsResponse.stats.current_balance
        localStorage.setItem("user", JSON.stringify(user))
      }

      // Fetch recent transactions (limit to 5 for dashboard)
      const transactionsResponse = await apiClient.getTransactionHistory({ limit: 5 })

      if (transactionsResponse.success && transactionsResponse.transactions) {
        setRecentTransactions(transactionsResponse.transactions)
      }
    } catch (error) {
      console.error("Error fetching dashboard data:", error)
      // Fallback to mock data if API fails
      const mockTransactions: Transaction[] = [
        {
          id: 1,
          type: "topup",
          amount: 500.0,
          description: "Account Top-up",
          created_at: "2024-01-15T10:30:00Z",
        },
        {
          id: 2,
          type: "bill_payment",
          amount: -85.5,
          description: "Electricity Bill",
          created_at: "2024-01-14T14:20:00Z",
        },
        {
          id: 3,
          type: "transfer_sent",
          amount: -100.0,
          description: "Transfer to John Doe",
          created_at: "2024-01-13T09:15:00Z",
        },
      ]

      setRecentTransactions(mockTransactions)
      setStats({
        current_balance: 1250.75,
        monthly_spending: { current_month: 485.5, previous_month: 320.0 },
        recent_transactions_count: 24,
        pending_transactions_count: 3,
        transaction_summary: {
          topups: { count: 5, total_amount: 1000.0 },
          transfers: {
            sent: { count: 8, total_amount: 400.0 },
            received: { count: 3, total_amount: 250.0 },
          },
          bills: { count: 6, total_amount: 350.0 },
        },
      })
    } finally {
      setLoading(false)
    }
  }

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case "topup":
        return <ArrowUpRight className="h-4 w-4 text-green-600" />
      case "bill_payment":
        return <Receipt className="h-4 w-4 text-red-600" />
      case "transfer_sent":
        return <ArrowDownRight className="h-4 w-4 text-red-600" />
      case "transfer_received":
        return <ArrowUpRight className="h-4 w-4 text-green-600" />
      default:
        return <TrendingUp className="h-4 w-4" />
    }
  }

  const formatAmount = (amount: number) => {
    const isNegative = amount < 0
    const formattedAmount = Math.abs(amount).toFixed(2)
    return isNegative ? `-$${formattedAmount}` : `+$${formattedAmount}`
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="text-center sm:text-left">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-2">Welcome back! Here's your account overview.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Balance</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">${stats.current_balance.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">Available funds</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Spent</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${stats.monthly_spending.current_month.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              {stats.monthly_spending.current_month > stats.monthly_spending.previous_month ? "↑" : "↓"} from last month
              (${stats.monthly_spending.previous_month.toFixed(2)})
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Transactions</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.recent_transactions_count}</div>
            <p className="text-xs text-muted-foreground">Recent transactions</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pending_transactions_count}</div>
            <p className="text-xs text-muted-foreground">Pending transactions</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="hover:shadow-lg transition-shadow">
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Perform common tasks quickly</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Button asChild className="h-20 flex-col space-y-2 bg-blue-600 hover:bg-blue-700">
              <Link href="/dashboard/topup">
                <Plus className="h-6 w-6" />
                <span>Top Up Account</span>
              </Link>
            </Button>
            <Button asChild variant="outline" className="h-20 flex-col space-y-2 hover:bg-gray-50 bg-transparent">
              <Link href="/dashboard/bills">
                <Receipt className="h-6 w-6" />
                <span>Pay Bills</span>
              </Link>
            </Button>
            <Button asChild variant="outline" className="h-20 flex-col space-y-2 hover:bg-gray-50 bg-transparent">
              <Link href="/dashboard/transfer">
                <Send className="h-6 w-6" />
                <span>Transfer Funds</span>
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Transaction Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="text-lg flex items-center">
              <ArrowUpRight className="h-5 w-5 text-green-600 mr-2" />
              Top-ups
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              ${stats.transaction_summary.topups.total_amount.toFixed(2)}
            </div>
            <p className="text-sm text-muted-foreground">{stats.transaction_summary.topups.count} transactions</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="text-lg flex items-center">
              <Send className="h-5 w-5 text-blue-600 mr-2" />
              Transfers
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Sent:</span>
                <span className="text-sm font-medium text-red-600">
                  -${stats.transaction_summary.transfers.sent.total_amount.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Received:</span>
                <span className="text-sm font-medium text-green-600">
                  +${stats.transaction_summary.transfers.received.total_amount.toFixed(2)}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="text-lg flex items-center">
              <Receipt className="h-5 w-5 text-orange-600 mr-2" />
              Bills
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              ${stats.transaction_summary.bills.total_amount.toFixed(2)}
            </div>
            <p className="text-sm text-muted-foreground">{stats.transaction_summary.bills.count} payments</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Transactions */}
      <Card className="hover:shadow-lg transition-shadow">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Recent Transactions</CardTitle>
            <CardDescription>Your latest account activity</CardDescription>
          </div>
          <Button asChild variant="outline" size="sm">
            <Link href="/dashboard/history">View All</Link>
          </Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentTransactions.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Activity className="h-12 w-12 mx-auto text-gray-300 mb-4" />
                <p>No recent transactions found.</p>
              </div>
            ) : (
              recentTransactions.map((transaction) => (
                <div
                  key={transaction.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <div className="p-2 rounded-full bg-gray-100">{getTransactionIcon(transaction.type)}</div>
                    <div>
                      <p className="font-medium text-gray-900">{transaction.description}</p>
                      <div className="flex items-center space-x-2 text-sm text-gray-500">
                        <span>{new Date(transaction.created_at).toLocaleDateString()}</span>
                        {transaction.reference && (
                          <>
                            <span>•</span>
                            <span>{transaction.reference}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className={`font-semibold ${transaction.amount > 0 ? "text-green-600" : "text-red-600"}`}>
                    {formatAmount(transaction.amount)}
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
