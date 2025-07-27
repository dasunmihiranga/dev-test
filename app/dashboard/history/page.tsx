"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { ArrowUpRight, ArrowDownRight, Receipt, Search, Filter, Download, Calendar, Activity } from "lucide-react"
import { apiClient } from "@/lib/api"

interface Transaction {
  id: number
  type: "topup" | "bill_payment" | "transfer_sent" | "transfer_received"
  amount: number
  description: string
  status: "completed" | "pending" | "failed"
  reference?: string
  recipient?: string
  biller?: string
  created_at: string
}

export default function HistoryPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [typeFilter, setTypeFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")
  const [pagination, setPagination] = useState({
    total: 0,
    limit: 20,
    offset: 0,
    has_more: false,
  })

  useEffect(() => {
    fetchTransactions()
  }, [typeFilter, statusFilter, searchTerm])

  const fetchTransactions = async (offset = 0) => {
    try {
      setLoading(true)
      const response = await apiClient.getTransactionHistory({
        type: typeFilter === "all" ? undefined : typeFilter,
        status: statusFilter === "all" ? undefined : statusFilter,
        search: searchTerm || undefined,
        limit: pagination.limit,
        offset,
      })

      if (response.success) {
        if (offset === 0) {
          setTransactions(response.transactions || [])
        } else {
          setTransactions((prev) => [...prev, ...(response.transactions || [])])
        }

        setPagination(
          response.pagination || {
            total: response.transactions?.length || 0,
            limit: pagination.limit,
            offset,
            has_more: false,
          },
        )
      }
    } catch (error) {
      console.error("Error fetching transactions:", error)
      // Fallback to mock data
      const mockTransactions: Transaction[] = [
        {
          id: 1,
          type: "topup",
          amount: 500.0,
          description: "Account Top-up",
          status: "completed",
          reference: "TXN001",
          created_at: "2024-01-15T10:30:00Z",
        },
        {
          id: 2,
          type: "bill_payment",
          amount: -85.5,
          description: "Electricity Bill Payment",
          status: "completed",
          reference: "TXN002",
          biller: "Electricity Company",
          created_at: "2024-01-14T14:20:00Z",
        },
        {
          id: 3,
          type: "transfer_sent",
          amount: -100.0,
          description: "Transfer to John Doe",
          status: "completed",
          reference: "TXN003",
          recipient: "John Doe",
          created_at: "2024-01-13T09:15:00Z",
        },
      ]
      setTransactions(mockTransactions)
    } finally {
      setLoading(false)
    }
  }

  const loadMore = () => {
    fetchTransactions(pagination.offset + pagination.limit)
  }

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case "topup":
        return <ArrowUpRight className="h-4 w-4 text-green-600" />
      case "bill_payment":
        return <Receipt className="h-4 w-4 text-orange-600" />
      case "transfer_sent":
        return <ArrowDownRight className="h-4 w-4 text-red-600" />
      case "transfer_received":
        return <ArrowUpRight className="h-4 w-4 text-green-600" />
      default:
        return <Activity className="h-4 w-4" />
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Completed</Badge>
      case "pending":
        return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">Pending</Badge>
      case "failed":
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Failed</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  const formatAmount = (amount: number) => {
    const isNegative = amount < 0
    const formattedAmount = Math.abs(amount).toFixed(2)
    return isNegative ? `-$${formattedAmount}` : `+$${formattedAmount}`
  }

  const getTransactionTypeLabel = (type: string) => {
    switch (type) {
      case "topup":
        return "Top-up"
      case "bill_payment":
        return "Bill Payment"
      case "transfer_sent":
        return "Transfer Sent"
      case "transfer_received":
        return "Transfer Received"
      default:
        return type
    }
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Transaction History</h1>
          <p className="text-gray-600 mt-2">View and manage your transaction history</p>
        </div>
        <Button variant="outline" className="mt-4 sm:mt-0 bg-transparent">
          <Download className="h-4 w-4 mr-2" />
          Export
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Filter className="h-5 w-5 mr-2" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search transactions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Type Filter */}
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger>
                <SelectValue placeholder="All types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All types</SelectItem>
                <SelectItem value="topup">Top-up</SelectItem>
                <SelectItem value="bill_payment">Bill Payment</SelectItem>
                <SelectItem value="transfer_sent">Transfer Sent</SelectItem>
                <SelectItem value="transfer_received">Transfer Received</SelectItem>
              </SelectContent>
            </Select>

            {/* Status Filter */}
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="All statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All statuses</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Transactions List */}
      <Card>
        <CardHeader>
          <CardTitle>Transactions</CardTitle>
          <CardDescription>
            {pagination.total > 0
              ? `Showing ${transactions.length} of ${pagination.total} transactions`
              : "No transactions found"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading && transactions.length === 0 ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-4 text-gray-600">Loading transactions...</p>
              </div>
            </div>
          ) : transactions.length === 0 ? (
            <div className="text-center py-12">
              <Activity className="h-12 w-12 mx-auto text-gray-300 mb-4" />
              <p className="text-gray-500">No transactions found</p>
              <p className="text-sm text-gray-400 mt-1">Try adjusting your filters or make your first transaction</p>
            </div>
          ) : (
            <div className="space-y-4">
              {transactions.map((transaction) => (
                <div
                  key={transaction.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center space-x-4">
                    <div className="p-2 rounded-full bg-gray-100">{getTransactionIcon(transaction.type)}</div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <p className="font-medium text-gray-900">{transaction.description}</p>
                        {getStatusBadge(transaction.status)}
                      </div>
                      <div className="flex items-center space-x-4 text-sm text-gray-500 mt-1">
                        <span className="flex items-center">
                          <Calendar className="h-3 w-3 mr-1" />
                          {new Date(transaction.created_at).toLocaleDateString()}
                        </span>
                        <span>{getTransactionTypeLabel(transaction.type)}</span>
                        {transaction.reference && <span className="font-mono">{transaction.reference}</span>}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`font-semibold ${transaction.amount > 0 ? "text-green-600" : "text-red-600"}`}>
                      {formatAmount(transaction.amount)}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {new Date(transaction.created_at).toLocaleTimeString()}
                    </div>
                  </div>
                </div>
              ))}

              {/* Load More Button */}
              {pagination.has_more && (
                <div className="text-center pt-6">
                  <Button onClick={loadMore} variant="outline" disabled={loading}>
                    {loading ? (
                      <div className="flex items-center">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600 mr-2"></div>
                        Loading...
                      </div>
                    ) : (
                      "Load More"
                    )}
                  </Button>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
