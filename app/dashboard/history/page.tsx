"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import { History, Search, Filter, Download, ArrowUpRight, ArrowDownRight, Receipt, TrendingUp } from "lucide-react"
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
  status: "completed" | "pending" | "failed"
}

interface TransactionFilters {
  search?: string
  type?: string
  status?: string
  date_from?: string
  date_to?: string
  page?: number
  limit?: number
}

export default function HistoryPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState<TransactionFilters>({
    page: 1,
    limit: 10,
  })
  const [totalPages, setTotalPages] = useState(1)
  const [totalTransactions, setTotalTransactions] = useState(0)

  useEffect(() => {
    fetchTransactions()
  }, [filters])

  const fetchTransactions = async () => {
    try {
      setLoading(true)
      const response = await apiClient.getTransactionHistory(filters)

      if (response.success && response.transactions) {
        setTransactions(response.transactions)
        setTotalPages(response.pagination?.total_pages || 1)
        setTotalTransactions(response.pagination?.total || 0)
      } else {
        // Fallback to mock data if API fails
        const mockTransactions: Transaction[] = [
          {
            id: 1,
            type: "topup",
            amount: 500.0,
            description: "Account Top-up",
            created_at: "2024-01-15T10:30:00Z",
            reference: "TXN001",
            status: "completed",
          },
          {
            id: 2,
            type: "bill_payment",
            amount: -85.5,
            description: "Electricity Bill",
            created_at: "2024-01-14T14:20:00Z",
            reference: "BILL002",
            biller: "Electric Company",
            status: "completed",
          },
          {
            id: 3,
            type: "transfer_sent",
            amount: -100.0,
            description: "Transfer to John Doe",
            created_at: "2024-01-13T09:15:00Z",
            reference: "TXN003",
            recipient: "john.doe@email.com",
            status: "completed",
          },
          {
            id: 4,
            type: "transfer_received",
            amount: 75.0,
            description: "Transfer from Jane Smith",
            created_at: "2024-01-12T16:45:00Z",
            reference: "TXN004",
            recipient: "jane.smith@email.com",
            status: "completed",
          },
          {
            id: 5,
            type: "bill_payment",
            amount: -45.0,
            description: "Internet Bill",
            created_at: "2024-01-11T11:30:00Z",
            reference: "BILL005",
            biller: "Internet Provider",
            status: "pending",
          },
        ]
        setTransactions(mockTransactions)
        setTotalPages(1)
        setTotalTransactions(mockTransactions.length)
      }
    } catch (error) {
      console.error("Error fetching transactions:", error)
      setTransactions([])
    } finally {
      setLoading(false)
    }
  }

  const handleFilterChange = (key: keyof TransactionFilters, value: string) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value || undefined,
      page: 1, // Reset to first page when filters change
    }))
  }

  const handlePageChange = (page: number) => {
    setFilters((prev) => ({ ...prev, page }))
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
        return "Top Up"
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
      {/* Header */}
      <div className="text-center sm:text-left">
        <h1 className="text-3xl font-bold text-gray-900">Transaction History</h1>
        <p className="text-gray-600 mt-2">View and manage your transaction history</p>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Filter className="h-5 w-5 mr-2" />
            Filters
          </CardTitle>
          <CardDescription>Filter transactions by type, status, or date range</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Search */}
            <div>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search transactions..."
                  value={filters.search || ""}
                  onChange={(e) => handleFilterChange("search", e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Type Filter */}
            <Select value={filters.type || "all"} onValueChange={(value) => handleFilterChange("type", value)}>
              <SelectTrigger>
                <SelectValue placeholder="All Types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="topup">Top Up</SelectItem>
                <SelectItem value="bill_payment">Bill Payment</SelectItem>
                <SelectItem value="transfer_sent">Transfer Sent</SelectItem>
                <SelectItem value="transfer_received">Transfer Received</SelectItem>
              </SelectContent>
            </Select>

            {/* Status Filter */}
            <Select value={filters.status || "all"} onValueChange={(value) => handleFilterChange("status", value)}>
              <SelectTrigger>
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
              </SelectContent>
            </Select>

            {/* Export Button */}
            <Button variant="outline" className="w-full bg-transparent">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Transactions Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center">
              <History className="h-5 w-5 mr-2" />
              Transactions ({totalTransactions})
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-2 text-gray-600">Loading transactions...</span>
            </div>
          ) : transactions.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <History className="h-12 w-12 mx-auto text-gray-300 mb-4" />
              <p>No transactions found.</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Type</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Reference</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {transactions.map((transaction) => (
                      <TableRow key={transaction.id}>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            {getTransactionIcon(transaction.type)}
                            <span className="text-sm font-medium">{getTransactionTypeLabel(transaction.type)}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium">{transaction.description}</p>
                            {transaction.recipient && (
                              <p className="text-xs text-gray-500">To: {transaction.recipient}</p>
                            )}
                            {transaction.biller && (
                              <p className="text-xs text-gray-500">Biller: {transaction.biller}</p>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <span
                            className={`font-semibold ${transaction.amount > 0 ? "text-green-600" : "text-red-600"}`}
                          >
                            {formatAmount(transaction.amount)}
                          </span>
                        </TableCell>
                        <TableCell>{getStatusBadge(transaction.status)}</TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <p>{new Date(transaction.created_at).toLocaleDateString()}</p>
                            <p className="text-gray-500">{new Date(transaction.created_at).toLocaleTimeString()}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="text-xs font-mono text-gray-500">{transaction.reference || "N/A"}</span>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="mt-6">
                  <Pagination>
                    <PaginationContent>
                      <PaginationItem>
                        <PaginationPrevious
                          onClick={() => handlePageChange(Math.max(1, (filters.page || 1) - 1))}
                          className={(filters.page || 1) <= 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                        />
                      </PaginationItem>

                      {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                        const page = i + 1
                        return (
                          <PaginationItem key={page}>
                            <PaginationLink
                              onClick={() => handlePageChange(page)}
                              isActive={page === (filters.page || 1)}
                              className="cursor-pointer"
                            >
                              {page}
                            </PaginationLink>
                          </PaginationItem>
                        )
                      })}

                      {totalPages > 5 && (
                        <PaginationItem>
                          <PaginationEllipsis />
                        </PaginationItem>
                      )}

                      <PaginationItem>
                        <PaginationNext
                          onClick={() => handlePageChange(Math.min(totalPages, (filters.page || 1) + 1))}
                          className={
                            (filters.page || 1) >= totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"
                          }
                        />
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
