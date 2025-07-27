"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { CreditCard, Receipt, Send, TrendingUp, ArrowUpRight, ArrowDownRight, Plus } from "lucide-react"

interface Transaction {
  id: number
  type: "topup" | "bill_payment" | "transfer_sent" | "transfer_received"
  amount: number
  description: string
  created_at: string
}

export default function DashboardPage() {
  const [recentTransactions, setRecentTransactions] = useState<Transaction[]>([])
  const [stats, setStats] = useState({
    totalBalance: 0,
    monthlySpent: 0,
    totalTransactions: 0,
    pendingBills: 0,
  })

  useEffect(() => {
    // Fetch dashboard data
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      // Import the API client
      const { apiClient } = await import("@/lib/api")
      
      // Fetch real dashboard stats from Laravel backend
      const statsResponse = await apiClient.getDashboardStats()
      
      if (statsResponse.success) {
        setStats({
          totalBalance: statsResponse.stats.current_balance,
          monthlySpent: statsResponse.stats.monthly_spending.current_month,
          totalTransactions: statsResponse.stats.recent_transactions_count,
          pendingBills: statsResponse.stats.pending_transactions_count,
        })
      }

      // Fetch recent transactions
      const transactionsResponse = await apiClient.getTransactionHistory({ limit: 5 })
      
      if (transactionsResponse.success) {
        setRecentTransactions(transactionsResponse.transactions || [])
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
        totalBalance: 1250.75,
        monthlySpent: 485.5,
        totalTransactions: 24,
        pendingBills: 3,
      })
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

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600">Welcome back! Here's your account overview.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Balance</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">${stats.totalBalance.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">Available funds</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Spent</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${stats.monthlySpent.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">This month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Transactions</CardTitle>
            <Receipt className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalTransactions}</div>
            <p className="text-xs text-muted-foreground">Total transactions</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Bills</CardTitle>
            <Send className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pendingBills}</div>
            <p className="text-xs text-muted-foreground">Due this month</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Perform common tasks quickly</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button asChild className="h-20 flex-col space-y-2">
              <Link href="/dashboard/topup">
                <Plus className="h-6 w-6" />
                <span>Top Up Account</span>
              </Link>
            </Button>
            <Button asChild variant="outline" className="h-20 flex-col space-y-2 bg-transparent">
              <Link href="/dashboard/bills">
                <Receipt className="h-6 w-6" />
                <span>Pay Bills</span>
              </Link>
            </Button>
            <Button asChild variant="outline" className="h-20 flex-col space-y-2 bg-transparent">
              <Link href="/dashboard/transfer">
                <Send className="h-6 w-6" />
                <span>Transfer Funds</span>
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Recent Transactions */}
      <Card>
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
            {recentTransactions.map((transaction) => (
              <div key={transaction.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-3">
                  {getTransactionIcon(transaction.type)}
                  <div>
                    <p className="font-medium">{transaction.description}</p>
                    <p className="text-sm text-gray-500">{new Date(transaction.created_at).toLocaleDateString()}</p>
                  </div>
                </div>
                <div className={`font-semibold ${transaction.amount > 0 ? "text-green-600" : "text-red-600"}`}>
                  {formatAmount(transaction.amount)}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
