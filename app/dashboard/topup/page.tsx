"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { CreditCard, Loader2, CheckCircle } from "lucide-react"

export default function TopUpPage() {
  const [amount, setAmount] = useState("")
  const [paymentMethod, setPaymentMethod] = useState("card")
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState("")

  const quickAmounts = [50, 100, 200, 500]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")
    setSuccess(false)

    if (!amount || Number.parseFloat(amount) <= 0) {
      setError("Please enter a valid amount")
      setLoading(false)
      return
    }

    try {
      // Import the API client
      const { apiClient } = await import("@/lib/api")
      
      // Top up using the real API
      const response = await apiClient.topUp({
        amount: Number.parseFloat(amount),
        payment_method: paymentMethod,
      })

      if (response.success) {
        setSuccess(true)
        setAmount("")
        
        // Update user balance in localStorage if provided in response
        if (response.new_balance !== undefined) {
          const user = JSON.parse(localStorage.getItem("user") || "{}")
          user.balance = response.new_balance
          localStorage.setItem("user", JSON.stringify(user))
        }
      } else {
        setError(response.message || "Top-up failed")
      }
    } catch (err: any) {
      setError(err.message || "Network error. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleQuickAmount = (quickAmount: number) => {
    setAmount(quickAmount.toString())
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Top Up Account</h1>
        <p className="text-gray-600">Add funds to your digital wallet</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <CreditCard className="h-5 w-5" />
            <span>Add Funds</span>
          </CardTitle>
          <CardDescription>Choose an amount and payment method to top up your account</CardDescription>
        </CardHeader>
        <CardContent>
          {success && (
            <Alert className="mb-6 border-green-200 bg-green-50">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">
                Top-up successful! Your account has been credited with ${amount}.
              </AlertDescription>
            </Alert>
          )}

          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Quick Amount Selection */}
            <div className="space-y-3">
              <Label>Quick Select Amount</Label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {quickAmounts.map((quickAmount) => (
                  <Button
                    key={quickAmount}
                    type="button"
                    variant="outline"
                    onClick={() => handleQuickAmount(quickAmount)}
                    className={amount === quickAmount.toString() ? "border-blue-500 bg-blue-50" : ""}
                  >
                    ${quickAmount}
                  </Button>
                ))}
              </div>
            </div>

            {/* Custom Amount */}
            <div className="space-y-2">
              <Label htmlFor="amount">Custom Amount</Label>
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

            {/* Payment Method */}
            <div className="space-y-3">
              <Label>Payment Method</Label>
              <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod}>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="card" id="card" />
                  <Label htmlFor="card">Credit/Debit Card</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="bank" id="bank" />
                  <Label htmlFor="bank">Bank Transfer</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="paypal" id="paypal" />
                  <Label htmlFor="paypal">PayPal</Label>
                </div>
              </RadioGroup>
            </div>

            {/* Payment Details Simulation */}
            <Card className="bg-gray-50">
              <CardContent className="pt-6">
                <div className="text-sm text-gray-600 space-y-2">
                  <p>
                    <strong>Note:</strong> This is a simulation. No actual payment will be processed.
                  </p>
                  <p>
                    Selected Method: <span className="capitalize font-medium">{paymentMethod}</span>
                  </p>
                  {amount && (
                    <p>
                      Amount: <span className="font-medium">${Number.parseFloat(amount || "0").toFixed(2)}</span>
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {loading ? "Processing..." : `Top Up $${Number.parseFloat(amount || "0").toFixed(2)}`}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
