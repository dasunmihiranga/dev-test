"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CreditCard, DollarSign, CheckCircle, AlertCircle } from "lucide-react"
import { apiClient } from "@/lib/api"

export default function TopUpPage() {
  const [amount, setAmount] = useState("")
  const [paymentMethod, setPaymentMethod] = useState("")
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState("")

  const quickAmounts = [10, 25, 50, 100, 200, 500]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")
    setSuccess(false)

    try {
      const response = await apiClient.topUp({
        amount: Number.parseFloat(amount),
        payment_method: paymentMethod,
      })

      if (response.success) {
        setSuccess(true)
        setAmount("")
        setPaymentMethod("")

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
      setError(err.message || "Failed to process top-up")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div className="text-center sm:text-left">
        <h1 className="text-3xl font-bold text-gray-900">Top Up Account</h1>
        <p className="text-gray-600 mt-2">Add funds to your digital wallet</p>
      </div>

      {success && (
        <Alert className="border-green-200 bg-green-50">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">
            Top-up successful! Your account has been credited.
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
            <CreditCard className="h-5 w-5 mr-2" />
            Add Funds
          </CardTitle>
          <CardDescription>Choose an amount and payment method to top up your account</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Quick Amount Selection */}
            <div>
              <Label className="text-base font-medium">Quick Select</Label>
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-3 mt-2">
                {quickAmounts.map((quickAmount) => (
                  <Button
                    key={quickAmount}
                    type="button"
                    variant={amount === quickAmount.toString() ? "default" : "outline"}
                    className="h-12"
                    onClick={() => setAmount(quickAmount.toString())}
                  >
                    ${quickAmount}
                  </Button>
                ))}
              </div>
            </div>

            {/* Custom Amount */}
            <div>
              <Label htmlFor="amount">Custom Amount</Label>
              <div className="relative mt-1">
                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  min="1"
                  max="10000"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="Enter amount"
                  className="pl-10"
                  required
                />
              </div>
            </div>

            {/* Payment Method */}
            <div>
              <Label htmlFor="payment-method">Payment Method</Label>
              <Select value={paymentMethod} onValueChange={setPaymentMethod} required>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select payment method" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="credit_card">Credit Card</SelectItem>
                  <SelectItem value="debit_card">Debit Card</SelectItem>
                  <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                  <SelectItem value="paypal">PayPal</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Submit Button */}
            <Button type="submit" className="w-full h-12 text-base" disabled={loading || !amount || !paymentMethod}>
              {loading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Processing...
                </div>
              ) : (
                `Top Up $${amount || "0.00"}`
              )}
            </Button>
          </form>
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
              <h3 className="font-medium text-blue-900">Secure Transaction</h3>
              <p className="text-sm text-blue-800 mt-1">
                All transactions are encrypted and processed securely. Your payment information is never stored on our
                servers.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
