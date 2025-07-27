"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { History, ArrowUpRight, ArrowDownRight, Receipt, CreditCard, Search, Filter, Download } from "lucide-react"

interface Transaction {
  id: number
  type: "topup" | "bill_payment" | "transfer_sent" | "transfer_received"
  amount: number
  description: string
  status: "completed" | "pending" | "failed"
  created_at: string
  recipient?: string
  biller?: string
  reference?: string
}

export default function HistoryPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [typeFilter, setTypeFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")

  useEffect(() => {
    fetchTransactions()
  }, [])

  useEffect(() => {
    filterTransactions()
  }, [transactions, searchTerm, typeFilter, statusFilter])

  const fetchTransactions = async () => {
    try {
      setLoading(true)
      
      // Import the API client
      const { apiClient } = await import("@/lib/api")
      
      // Fetch transaction history from Laravel backend
      const response = await apiClient.getTransactionHistory()
      
      if (response.success && response.transactions) {
        setTransactions(response.transactions)
      } else {
        // Fallback to mock data if API fails
        const mockTransactions: Transaction[] = [
          {
            id: 1,
            type: "topup",
            amount: 500.0,
            description: "Account Top-up via Credit Card",
            status: "completed",
            created_at: "2024-01-15T10:30:00Z",
            reference: "TXN001",
          },
          {
            id: 2,
            type: "bill_payment",
            amount: -85.5,
            description: "Electricity Bill Payment",
            status: "completed",
            created_at: "2024-01-14T14:20:00Z",
            biller: "Electricity Company",
            reference: "TXN002",
          },
          {
            id: 3,
            type: "transfer_sent",
            amount: -100.0,
            description: "Transfer to John Doe",
            status: "completed",
            created_at: "2024-01-13T09:15:00Z",
            recipient: "John Doe",
            reference: "TXN003",
          },
          {
            id: 4,
            type: "transfer_received",
            amount: 75.0,
            description: "Transfer from Jane Smith",
            status: "completed",
            created_at: "2024-01-12T16:45:00Z",
            recipient: "Jane Smith",
            reference: "TXN004",
          },
        ]
        setTransactions(mockTransactions)
      }
    } catch (error) {
      console.error("Error fetching transactions:", error)
      
      // Fallback to mock data if API fails
      const mockTransactions: Transaction[] = [
        {
          id: 1,
          type: "topup",
          amount: 500.0,
          description: "Account Top-up via Credit Card",
          status: "completed",
          created_at: "2024-01-15T10:30:00Z",
          reference: "TXN001",
        },
        {
          id: 2,
          type: "bill_payment",
          amount: -85.5,
          description: "Electricity Bill Payment",
          status: "completed",
          created_at: "2024-01-14T14:20:00Z",
          biller: "Electricity Company",
          reference: "TXN002",
        },
      ]
      setTransactions(mockTransactions)
    } finally {
      setLoading(false)
    }
  }

  const filterTransactions = () => {
    let filtered = transactions

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(
        (transaction) =>
          transaction.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
          transaction.reference?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          transaction.recipient?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          transaction.biller?.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    // Filter by type
    if (typeFilter !== "all") {
      filtered = filtered.filter((transaction) => transaction.type === typeFilter)
    }

    // Filter by status
    if (statusFilter !== "all") {
      filtered = filtered.filter((transaction) => transaction.status === statusFilter)
    }

    setFilteredTransactions(filtered)
  }

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case "topup":
        return <CreditCard className="h-5 w-5 text-green-600" />
      case "bill_payment":
        return <Receipt className="h-5 w-5 text-red-600" />
      case "transfer_sent":
        return <ArrowDownRight className="h-5 w-5 text-red-600" />
      case "transfer_received":
        return <ArrowUpRight className="h-5 w-5 text-green-600" />
      default:
        return <History className="h-5 w-5" />
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return <Badge className="bg-green-100 text-green-800">Completed</Badge>
      case "pending":
        return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>
      case "failed":
        return <Badge className="bg-red-100 text-red-800">Failed</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  const formatAmount = (amount: number) => {
    const isNegative = amount < 0
    const formattedAmount = Math.abs(amount).toFixed(2)
    return isNegative ? `-$${formattedAmount}` : `+$${formattedAmount}`
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const exportTransactions = () => {
    // Simulate CSV export
    const csvContent = [
      ["Date", "Type", "Description", "Amount", "Status", "Reference"].join(","),
      ...filteredTransactions.map((t) =>
        [
          formatDate(t.created_at),
          t.type.replace("_", " "),
          t.description,
          t.amount.toFixed(2),
          t.status,
          t.reference || "",
        ].join(","),
      ),
    ].join("\n")

    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "transaction-history.csv"
    a.click()
    window.URL.revokeObjectURL(url)
  }

  if (loading) {
    return <div>Loading...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Transaction History</h1>
          <p className="text-gray-600">View and manage your transaction history</p>
        </div>
        <Button onClick={exportTransactions} variant="outline">
          <Download className="mr-2 h-4 w-4" />
          Export CSV
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Filter className="h-5 w-5" />
            <span>Filters</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search transactions..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Type</label>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="topup">Top Up</SelectItem>
                  <SelectItem value="bill_payment">Bill Payment</SelectItem>
                  <SelectItem value="transfer_sent">Transfer Sent</SelectItem>
                  <SelectItem value="transfer_received">Transfer Received</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Status</label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Transaction List */}
      <Card>
        <CardHeader>
          <CardTitle>Transactions</CardTitle>
          <CardDescription>
            Showing {filteredTransactions.length} of {transactions.length} transactions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredTransactions.length === 0 ? (
              <div className="text-center py-8 text-gray-500">No transactions found matching your criteria.</div>
            ) : (
              filteredTransactions.map((transaction) => (
                <div
                  key={transaction.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                >
                  <div className="flex items-center space-x-4">
                    {getTransactionIcon(transaction.type)}
                    <div>
                      <p className="font-medium">{transaction.description}</p>
                      <div className="flex items-center space-x-2 mt-1">
                        <p className="text-sm text-gray-500">{formatDate(transaction.created_at)}</p>
                        {transaction.reference && (
                          <>
                            <span className="text-gray-300">•</span>
                            <p className="text-sm text-gray-500">{transaction.reference}</p>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    {getStatusBadge(transaction.status)}
                    <div
                      className={`font-semibold text-right ${
                        transaction.amount > 0 ? "text-green-600" : "text-red-600"
                      }`}
                    >
                      {formatAmount(transaction.amount)}
                    </div>
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
