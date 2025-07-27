"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Send, DollarSign, CheckCircle, AlertCircle, User } from "lucide-react"
import { apiClient } from "@/lib/api"

export default function TransferPage() {
  const [recipientEmail, setRecipientEmail] = useState("")
  const [amount, setAmount] = useState("")
  const [description, setDescription] = useState("")
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSuccess(false)

    if (!recipientEmail || !amount) {
      setError("Please fill in all required fields")
      return
    }

    const numAmount = Number.parseFloat(amount)
    if (isNaN(numAmount) || numAmount <= 0) {
      setError("Please enter a valid amount")
      return
    }

    if (numAmount < 1) {
      setError("Minimum transfer amount is $1.00")
      return
    }

    // Get current user balance
    const user = JSON.parse(localStorage.getItem("user") || "{}")
    if (numAmount > user.balance) {
      setError("Insufficient balance for this transfer")
      return
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(recipientEmail)) {
      setError("Please enter a valid email address")
      return
    }

    try {
      setLoading(true)
      
      // First, search for the recipient by email to get their ID
      const searchResponse = await apiClient.searchUser(recipientEmail)
      
      if (!searchResponse.success || !searchResponse.user) {
        setError("Recipient not found. Please check the email address.")
        return
      }

      // Now transfer funds using the recipient ID
      const response = await apiClient.transferFunds({
        recipient_id: searchResponse.user.id,
        amount: numAmount,
        note: description || undefined,
      })

      if (response.success) {
        setSuccess(true)
        setRecipientEmail("")
        setAmount("")
        setDescription("")

        // Update user balance in localStorage
        user.balance = response.new_balance
        localStorage.setItem("user", JSON.stringify(user))

        // Refresh the page after 2 seconds
        setTimeout(() => {
          window.location.reload()
        }, 2000)
      } else {
        setError(response.message || "Transfer failed. Please try again.")
      }
    } catch (error: any) {
      console.error("Transfer error:", error)
      if (error.status === 400) {
        setError(error.message || "Invalid transfer details")
      } else if (error.status === 404) {
        setError("Recipient not found. Please check the email address.")
      } else {
        setError("An error occurred. Please try again.")
      }
    } finally {
      setLoading(false)
    }
  }

  const currentUser = JSON.parse(localStorage.getItem("user") || "{}")

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900">Transfer Funds</h1>
        <p className="text-gray-600 mt-2">Send money to another user</p>
      </div>

      {/* Balance Card */}
      <Card className="bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-blue-600">Available Balance</p>
              <p className="text-2xl font-bold text-blue-900">${currentUser.balance?.toFixed(2) || "0.00"}</p>
            </div>
            <DollarSign className="h-8 w-8 text-blue-600" />
          </div>
        </CardContent>
      </Card>

      {/* Success Alert */}
      {success && (
        <Alert className="border-green-200 bg-green-50">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">
            Transfer successful! ${amount} has been sent to {recipientEmail}.
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

      {/* Transfer Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Send className="h-5 w-5 mr-2" />
            Transfer Details
          </CardTitle>
          <CardDescription>Enter the recipient's details and transfer amount</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Recipient Email */}
            <div>
              <Label htmlFor="recipient">Recipient Email</Label>
              <div className="relative mt-1">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="recipient"
                  type="email"
                  value={recipientEmail}
                  onChange={(e) => setRecipientEmail(e.target.value)}
                  placeholder="Enter recipient's email address"
                  className="pl-10"
                  required
                />
              </div>
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
                  placeholder="Enter amount to transfer"
                  className="pl-10"
                  required
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">Available: ${currentUser.balance?.toFixed(2) || "0.00"}</p>
            </div>

            {/* Description */}
            <div>
              <Label htmlFor="description">Description (Optional)</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Add a note for this transfer"
                className="mt-1"
                rows={3}
              />
            </div>

            {/* Submit Button */}
            <Button type="submit" className="w-full h-12" disabled={loading}>
              {loading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Processing Transfer...
                </div>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Transfer ${amount || "0.00"}
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Information Card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Transfer Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-start space-x-2">
            <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
            <p className="text-sm text-gray-600">Transfers are processed instantly between registered users.</p>
          </div>
          <div className="flex items-start space-x-2">
            <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
            <p className="text-sm text-gray-600">
              The recipient will receive an email notification about the transfer.
            </p>
          </div>
          <div className="flex items-start space-x-2">
            <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
            <p className="text-sm text-gray-600">All transfers are secured and cannot be reversed once completed.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
