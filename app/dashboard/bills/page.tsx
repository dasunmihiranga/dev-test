"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Receipt, DollarSign, CheckCircle, AlertCircle, Building } from "lucide-react"
import { apiClient } from "@/lib/api"

interface Biller {
  id: number
  name: string
  category: string
  description: string
  is_active: boolean
}

export default function BillsPage() {
  const [billers, setBillers] = useState<Biller[]>([])
  const [selectedBiller, setSelectedBiller] = useState("")
  const [amount, setAmount] = useState("")
  const [accountNumber, setAccountNumber] = useState("")
  const [loading, setLoading] = useState(false)
  const [loadingBillers, setLoadingBillers] = useState(true)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    fetchBillers()
  }, [])

  const fetchBillers = async () => {
    try {
      const response = await apiClient.getBillers()
      if (response.success && response.billers) {
        setBillers(response.billers.filter((biller: Biller) => biller.is_active))
      }
    } catch (err) {
      console.error("Error fetching billers:", err)
      // Fallback to mock data
      setBillers([
        {
          id: 1,
          name: "Electricity Company",
          category: "Utilities",
          description: "Monthly electricity bill payment",
          is_active: true,
        },
        {
          id: 2,
          name: "Water Department",
          category: "Utilities",
          description: "Monthly water bill payment",
          is_active: true,
        },
        {
          id: 3,
          name: "Internet Provider",
          category: "Telecommunications",
          description: "Monthly internet service payment",
          is_active: true,
        },
      ])
    } finally {
      setLoadingBillers(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")
    setSuccess(false)

    try {
      const response = await apiClient.payBill({
        biller_id: Number.parseInt(selectedBiller),
        amount: Number.parseFloat(amount),
        account_number: accountNumber,
      })

      if (response.success) {
        setSuccess(true)
        setSelectedBiller("")
        setAmount("")
        setAccountNumber("")

        // Update user balance in localStorage
        const user = JSON.parse(localStorage.getItem("user") || "{}")
        user.balance = response.new_balance
        localStorage.setItem("user", JSON.stringify(user))

        // Refresh the page after 2 seconds
        setTimeout(() => {
          window.location.reload()
        }, 2000)
      }
    } catch (err: any) {
      setError(err.message || "Failed to process bill payment")
    } finally {
      setLoading(false)
    }
  }

  const selectedBillerData = billers.find((b) => b.id.toString() === selectedBiller)

  if (loadingBillers) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading billers...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div className="text-center sm:text-left">
        <h1 className="text-3xl font-bold text-gray-900">Pay Bills</h1>
        <p className="text-gray-600 mt-2">Pay your bills quickly and securely</p>
      </div>

      {success && (
        <Alert className="border-green-200 bg-green-50">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">
            Bill payment successful! Your payment has been processed.
          </AlertDescription>
        </Alert>
      )}

      {error && (
        <Alert className="border-red-200 bg-red-50">
          <AlertCircle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">{error}</AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Receipt className="h-5 w-5 mr-2" />
            Bill Payment
          </CardTitle>
          <CardDescription>Select a biller and enter your payment details</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Biller Selection */}
            <div>
              <Label htmlFor="biller">Select Biller</Label>
              <Select value={selectedBiller} onValueChange={setSelectedBiller} required>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Choose a biller" />
                </SelectTrigger>
                <SelectContent>
                  {billers.map((biller) => (
                    <SelectItem key={biller.id} value={biller.id.toString()}>
                      <div className="flex items-center space-x-2">
                        <Building className="h-4 w-4" />
                        <div>
                          <div className="font-medium">{biller.name}</div>
                          <div className="text-xs text-gray-500">{biller.category}</div>
                        </div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {selectedBillerData && <p className="text-sm text-gray-600 mt-1">{selectedBillerData.description}</p>}
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
              <Label htmlFor="amount">Amount</Label>
              <div className="relative mt-1">
                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  min="0.01"
                  max="10000"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="Enter amount"
                  className="pl-10"
                  required
                />
              </div>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full h-12 text-base"
              disabled={loading || !selectedBiller || !amount || !accountNumber}
            >
              {loading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Processing...
                </div>
              ) : (
                `Pay $${amount || "0.00"}`
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Available Billers */}
      <Card>
        <CardHeader>
          <CardTitle>Available Billers</CardTitle>
          <CardDescription>All supported billers and services</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {billers.map((biller) => (
              <div key={biller.id} className="p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                <div className="flex items-start space-x-3">
                  <div className="p-2 bg-blue-100 rounded-full">
                    <Building className="h-4 w-4 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900">{biller.name}</h3>
                    <p className="text-sm text-gray-600">{biller.category}</p>
                    <p className="text-xs text-gray-500 mt-1">{biller.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Security Notice */}
      <Card className="border-blue-200 bg-blue-50">
        <CardContent className="pt-6">
          <div className="flex items-start space-x-3">
            <div className="p-1 bg-blue-100 rounded-full">
              <CheckCircle className="h-4 w-4 text-blue-600" />
            </div>
            <div>
              <h3 className="font-medium text-blue-900">Secure Payment</h3>
              <p className="text-sm text-blue-800 mt-1">
                All bill payments are processed securely and confirmed with the biller. You'll receive a confirmation
                once payment is complete.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
