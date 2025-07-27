"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Send, DollarSign, User, CheckCircle, AlertCircle, Search } from "lucide-react"
import { apiClient } from "@/lib/api"

interface SearchedUser {
  id: number
  name: string
  email: string
}

export default function TransferPage() {
  const [email, setEmail] = useState("")
  const [amount, setAmount] = useState("")
  const [note, setNote] = useState("")
  const [recipient, setRecipient] = useState<SearchedUser | null>(null)
  const [loading, setLoading] = useState(false)
  const [searching, setSearching] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState("")

  const handleSearchUser = async () => {
    if (!email) return

    setSearching(true)
    setError("")
    setRecipient(null)

    try {
      const response = await apiClient.searchUser(email)
      if (response.success && response.user) {
        setRecipient(response.user)
      }
    } catch (err: any) {
      setError(err.message || "User not found")
    } finally {
      setSearching(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!recipient) return

    setLoading(true)
    setError("")
    setSuccess(false)

    try {
      const response = await apiClient.transferFunds({
        recipient_id: recipient.id,
        amount: Number.parseFloat(amount),
        note: note || undefined,
      })

      if (response.success) {
        setSuccess(true)
        setEmail("")
        setAmount("")
        setNote("")
        setRecipient(null)

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
      setError(err.message || "Failed to process transfer")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div className="text-center sm:text-left">
        <h1 className="text-3xl font-bold text-gray-900">Transfer Funds</h1>
        <p className="text-gray-600 mt-2">Send money to other users instantly</p>
      </div>

      {success && (
        <Alert className="border-green-200 bg-green-50">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">
            Transfer successful! Funds have been sent to the recipient.
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
            <Send className="h-5 w-5 mr-2" />
            Send Money
          </CardTitle>
          <CardDescription>Enter recipient details and transfer amount</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Recipient Search */}
          <div>
            <Label htmlFor="email">Recipient Email</Label>
            <div className="flex space-x-2 mt-1">
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter recipient's email"
                className="flex-1"
              />
              <Button type="button" onClick={handleSearchUser} disabled={!email || searching} variant="outline">
                {searching ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600"></div>
                ) : (
                  <Search className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>

          {/* Recipient Display */}
          {recipient && (
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-green-100 rounded-full">
                  <User className="h-4 w-4 text-green-600" />
                </div>
                <div>
                  <p className="font-medium text-green-900">{recipient.name}</p>
                  <p className="text-sm text-green-700">{recipient.email}</p>
                </div>
              </div>
            </div>
          )}

          {/* Transfer Form */}
          {recipient && (
            <form onSubmit={handleSubmit} className="space-y-6">
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

              {/* Note */}
              <div>
                <Label htmlFor="note">Note (Optional)</Label>
                <Textarea
                  id="note"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Add a note for this transfer"
                  className="mt-1"
                  rows={3}
                />
              </div>

              {/* Submit Button */}
              <Button type="submit" className="w-full h-12 text-base" disabled={loading || !amount}>
                {loading ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Processing...
                  </div>
                ) : (
                  `Send $${amount || "0.00"} to ${recipient.name}`
                )}
              </Button>
            </form>
          )}
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
              <h3 className="font-medium text-blue-900">Instant Transfer</h3>
              <p className="text-sm text-blue-800 mt-1">
                Transfers are processed instantly and securely. The recipient will be notified immediately.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
