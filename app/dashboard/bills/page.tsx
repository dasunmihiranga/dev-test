"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Receipt, Loader2, CheckCircle, Zap, Droplets, Wifi, Phone, Car, Home } from "lucide-react"

interface Biller {
  id: number
  name: string
  category: string
  description: string
  is_active: boolean
}

// Fallback billers in case API fails
const fallbackBillers = [
  {
    id: 1,
    name: "Electricity Company",
    category: "Utilities",
    description: "Pay your monthly electricity bill",
    is_active: true,
  },
  {
    id: 2,
    name: "Water Authority",
    category: "Utilities", 
    description: "Water and sewerage services",
    is_active: true,
  },
  {
    id: 3,
    name: "Internet Provider",
    category: "Telecommunications",
    description: "Broadband internet services",
    is_active: true,
  },
]

export default function BillsPage() {
  const [billers, setBillers] = useState<Biller[]>(fallbackBillers)
  const [selectedBiller, setSelectedBiller] = useState<number | null>(null)
  const [amount, setAmount] = useState("")
  const [accountNumber, setAccountNumber] = useState("")
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    fetchBillers()
  }, [])

  const fetchBillers = async () => {
    try {
      // Import the API client
      const { apiClient } = await import("@/lib/api")
      
      // Fetch billers from Laravel backend
      const response = await apiClient.getBillers()
      
      if (response.success && response.billers) {
        setBillers(response.billers.filter((biller: Biller) => biller.is_active))
      }
    } catch (error) {
      console.error("Error fetching billers:", error)
      // Use fallback billers if API fails
      setBillers(fallbackBillers)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")
    setSuccess(false)

    const biller = billers.find((b) => b.id === selectedBiller)
    const billAmount = Number.parseFloat(amount)

    if (!selectedBiller || !amount || !accountNumber) {
      setError("Please fill in all fields")
      setLoading(false)
      return
    }

    if (!biller) {
      setError("Please select a valid biller")
      setLoading(false)
      return
    }

    if (billAmount <= 0) {
      setError("Please enter a valid amount")
      setLoading(false)
      return
    }

    try {
      // Import the API client
      const { apiClient } = await import("@/lib/api")
      
      // Pay bill using the real API
      const response = await apiClient.payBill({
        biller_id: selectedBiller,
        amount: billAmount,
        account_number: accountNumber,
      })

      if (response.success) {
        setSuccess(true)
        setSelectedBiller(null)
        setAmount("")
        setAccountNumber("")

        // Update user balance in localStorage if provided in response
        if (response.new_balance !== undefined) {
          const user = JSON.parse(localStorage.getItem("user") || "{}")
          user.balance = response.new_balance
          localStorage.setItem("user", JSON.stringify(user))
        }
      } else {
        setError(response.message || "Payment failed")
      }
    } catch (err: any) {
      if (err.status === 400) {
        setError(err.message || "Insufficient balance for this payment")
      } else {
        setError(err.message || "Network error. Please try again.")
      }
    } finally {
      setLoading(false)
    }
  }

  const selectedBillerData = billers.find((b) => b.id === selectedBiller)

  const getCategoryIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case 'utilities':
        return <Zap className="h-8 w-8 text-blue-600 mt-1" />
      case 'telecommunications':
        return <Wifi className="h-8 w-8 text-blue-600 mt-1" />
      case 'insurance':
        return <Home className="h-8 w-8 text-blue-600 mt-1" />
      default:
        return <Receipt className="h-8 w-8 text-blue-600 mt-1" />
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Pay Bills</h1>
        <p className="text-gray-600">Pay your utility and service bills quickly and securely</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Biller Selection */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Available Billers</CardTitle>
              <CardDescription>Select a biller to pay your bill</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-4">
                {billers.map((biller) => (
                  <Card
                    key={biller.id}
                    className={`cursor-pointer transition-all hover:shadow-md ${
                      selectedBiller === biller.id ? "ring-2 ring-blue-500 bg-blue-50" : ""
                    }`}
                    onClick={() => setSelectedBiller(biller.id)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start space-x-3">
                        {getCategoryIcon(biller.category)}
                        <div className="flex-1">
                          <h3 className="font-semibold">{biller.name}</h3>
                          <p className="text-sm text-gray-600 mb-2">{biller.description}</p>
                          <Badge variant="secondary" className="text-xs">
                            {biller.category}
                          </Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Payment Form */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Receipt className="h-5 w-5" />
                <span>Payment Details</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {success && (
                <Alert className="mb-6 border-green-200 bg-green-50">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <AlertDescription className="text-green-800">
                    Payment successful! Your bill has been paid.
                  </AlertDescription>
                </Alert>
              )}

              {error && (
                <Alert variant="destructive" className="mb-6">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="biller">Selected Biller</Label>
                  <Select 
                    value={selectedBiller?.toString() || ""} 
                    onValueChange={(value) => setSelectedBiller(Number.parseInt(value))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a biller" />
                    </SelectTrigger>
                    <SelectContent>
                      {billers.map((biller) => (
                        <SelectItem key={biller.id} value={biller.id.toString()}>
                          {biller.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {selectedBillerData && (
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-2 mb-2">
                      {getCategoryIcon(selectedBillerData.category)}
                      <span className="font-medium">{selectedBillerData.name}</span>
                    </div>
                    <p className="text-sm text-gray-600">
                      {selectedBillerData.description}
                    </p>
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="accountNumber">Account Number</Label>
                  <Input
                    id="accountNumber"
                    type="text"
                    placeholder="Enter your account number"
                    value={accountNumber}
                    onChange={(e) => setAccountNumber(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="amount">Amount</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                    <Input
                      id="amount"
                      type="number"
                      placeholder="0.00"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      className="pl-8"
                      min="0"
                      step="0.01"
                      required
                    />
                  </div>
                </div>

                <Button type="submit" className="w-full" disabled={loading || !selectedBiller}>
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {loading ? "Processing..." : `Pay $${Number.parseFloat(amount || "0").toFixed(2)}`}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
