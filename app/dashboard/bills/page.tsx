"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Receipt, DollarSign, CheckCircle, AlertCircle, Zap, Wifi, Car } from "lucide-react"
import { apiClient } from "@/lib/api"

interface Biller {
  id: number
  name: string
  category: string
  description?: string
}

export default function BillsPage() {
  const [billers, setBillers] = useState<Biller[]>([])
  const [selectedBiller, setSelectedBiller] = useState("")
  const [accountNumber, setAccountNumber] = useState("")
  const [amount, setAmount] = useState("")
  const [loading, setLoading] = useState(false)
  const [loadingBillers, setLoadingBillers] = useState(true)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    fetchBillers()
  }, [])

  const fetchBillers = async () => {
    try {
      setLoadingBillers(true)
      const response = await apiClient.getBillers()

      if (response.success && response.billers) {
        setBillers(response.billers)
      } else {
        // Fallback to mock data if API fails
        setBillers([
          { id: 1, name: "Electric Company", category: "utilities", description: "Electricity bills" },
          { id: 2, name: "Water Authority", category: "utilities", description: "Water and sewage" },
          { id: 3, name: "Internet Provider", category: "telecommunications", description: "Internet services" },
          { id: 4, name: "Mobile Carrier", category: "telecommunications", description: "Mobile phone services" },
          { id: 5, name: "Gas Company", category: "utilities", description: "Natural gas services" },
          { id: 6, name: "Insurance Co.", category: "insurance", description: "Auto insurance" },
        ])
      }
    } catch (error) {
      console.error("Error fetching billers:", error)
      // Use mock data as fallback
      setBillers([
        { id: 1, name: "Electric Company", category: "utilities", description: "Electricity bills" },
        { id: 2, name: "Water Authority", category: "utilities", description: "Water and sewage" },
        { id: 3, name: "Internet Provider", category: "telecommunications", description: "Internet services" },
        { id: 4, name: "Mobile Carrier", category: "telecommunications", description: "Mobile phone services" },
        { id: 5, name: "Gas Company", category: "utilities", description: "Natural gas services" },
        { id: 6, name: "Insurance Co.", category: "insurance", description: "Auto insurance" },
      ])
    } finally {
      setLoadingBillers(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSuccess(false)

    if (!selectedBiller || !accountNumber || !amount) {
      setError("Please fill in all required fields")
      return
    }

    const numAmount = Number.parseFloat(amount)
    if (isNaN(numAmount) || numAmount <= 0) {
      setError("Please enter a valid amount")
      return
    }

    if (numAmount < 1) {
      setError("Minimum payment amount is $1.00")
      return
    }

    // Get current user balance
    const user = JSON.parse(localStorage.getItem("user") || "{}")
    if (numAmount > user.balance) {
      setError("Insufficient balance for this payment")
      return
    }

    try {
      setLoading(true)
      const response = await apiClient.payBill({
        biller_id: Number.parseInt(selectedBiller),
        account_number: accountNumber,
        amount: numAmount,
      })

      if (response.success) {
        setSuccess(true)
        setSelectedBiller("")
        setAccountNumber("")
        setAmount("")

        // Update user balance in localStorage
        user.balance = response.new_balance
        localStorage.setItem("user", JSON.stringify(user))

        // Refresh the page after 2 seconds
        setTimeout(() => {
          window.location.reload()
        }, 2000)
      } else {
        setError(response.message || "Payment failed. Please try again.")
      }
    } catch (error: any) {
      console.error("Bill payment error:", error)
      if (error.status === 400) {
        setError(error.message || "Invalid payment details")
      } else {
        setError("An error occurred. Please try again.")
      }
    } finally {
      setLoading(false)
    }
  }

  const getBillerIcon = (category: string) => {
    switch (category) {
      case "utilities":
        return <Zap className="h-5 w-5 text-yellow-600" />
      case "telecommunications":
        return <Wifi className="h-5 w-5 text-blue-600" />
      case "insurance":
        return <Car className="h-5 w-5 text-green-600" />
      default:
        return <Receipt className="h-5 w-5 text-gray-600" />
    }
  }

  const currentUser = JSON.parse(localStorage.getItem("user") || "{}")

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900">Pay Bills</h1>
        <p className="text-gray-600 mt-2">Pay your bills quickly and securely</p>
      </div>

      {/* Balance Card */}
      <Card className="bg-gradient-to-r from-green-50 to-green-100 border-green-200">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-green-600">Available Balance</p>
              <p className="text-2xl font-bold text-green-900">${currentUser.balance?.toFixed(2) || "0.00"}</p>
            </div>
            <DollarSign className="h-8 w-8 text-green-600" />
          </div>
        </CardContent>
      </Card>

      {/* Success Alert */}
      {success && (
        <Alert className="border-green-200 bg-green-50">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">
            Payment successful! Your bill has been paid for ${amount}.
          </AlertDescription>
        </Alert>
      )}

      {/* Error Alert */}
      {error && (
        <Alert className="border-red-200 bg-red-50">
          <AlertCircle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">{error}</AlertDescription>
        </Alert>
      )}

      {/* Bill Payment Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Receipt className="h-5 w-5 mr-2" />
            Bill Payment Details
          </CardTitle>
          <CardDescription>Select a biller and enter your payment details</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Biller Selection */}
            <div>
              <Label htmlFor="biller">Select Biller</Label>
              {loadingBillers ? (
                <div className="mt-1 p-3 border rounded-md">
                  <div className="animate-pulse flex items-center">
                    <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                    <div className="ml-2 h-4 bg-gray-200 rounded w-1/2"></div>
                  </div>
                </div>
              ) : (
                <Select value={selectedBiller} onValueChange={setSelectedBiller} required>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Choose a biller" />
                  </SelectTrigger>
                  <SelectContent>
                    {billers.map((biller) => (
                      <SelectItem key={biller.id} value={biller.id.toString()}>
                        <div className="flex items-center">
                          {getBillerIcon(biller.category)}
                          <span className="ml-2">{biller.name}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>

            {/* Account Number */}
            <div>
              <Label htmlFor="account-number">Account Number</Label>
              <Input
                id="account-number"
                type="text"
                value={accountNumber}
                onChange={(e) => setAccountNumber(e.target.value)}
                placeholder="Enter your account number"
                className="mt-1"
                required
              />
            </div>

            {/* Amount */}
            <div>
              <Label htmlFor="amount">Amount ($)</Label>
              <div className="relative mt-1">
                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  min="1"
                  max={currentUser.balance || 0}
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="Enter payment amount"
                  className="pl-10"
                  required
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">Available: ${currentUser.balance?.toFixed(2) || "0.00"}</p>
            </div>

            {/* Submit Button */}
            <Button type="submit" className="w-full h-12" disabled={loading || loadingBillers}>
              {loading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Processing Payment...
                </div>
              ) : (
                <>
                  <Receipt className="h-4 w-4 mr-2" />
                  Pay ${amount || "0.00"}
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Popular Billers */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Popular Billers</CardTitle>
          <CardDescription>Quick access to commonly used billers</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {billers.slice(0, 6).map((biller) => (
              <Button
                key={biller.id}
                variant="outline"
                className="h-16 flex-col space-y-1 bg-transparent"
                onClick={() => setSelectedBiller(biller.id.toString())}
              >
                {getBillerIcon(biller.category)}
                <span className="text-xs">{biller.name}</span>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Information Card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Payment Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-start space-x-2">
            <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
            <p className="text-sm text-gray-600">
              Payments are processed instantly and confirmation is sent immediately.
            </p>
          </div>
          <div className="flex items-start space-x-2">
            <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
            <p className="text-sm text-gray-600">Keep your account number handy for faster payments.</p>
          </div>
          <div className="flex items-start space-x-2">
            <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
            <p className="text-sm text-gray-600">All transactions are secured with end-to-end encryption.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
