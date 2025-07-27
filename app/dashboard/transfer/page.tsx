"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Send, Loader2, CheckCircle, Search } from "lucide-react"

interface TransferUser {
  id: number
  name: string
  email: string
  avatar?: string
}

export default function TransferPage() {
  const [recipientEmail, setRecipientEmail] = useState("")
  const [amount, setAmount] = useState("")
  const [note, setNote] = useState("")
  const [loading, setLoading] = useState(false)
  const [searchLoading, setSearchLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState("")
  const [recipient, setRecipient] = useState<TransferUser | null>(null)

  const handleSearchUser = async () => {
    if (!recipientEmail) return

    setSearchLoading(true)
    setError("")
    setRecipient(null)

    try {
      // Import the API client
      const { apiClient } = await import("@/lib/api")
      
      // Search user using the real API
      const response = await apiClient.searchUser(recipientEmail)
      
      if (response.success && response.user) {
        setRecipient({
          id: response.user.id,
          name: response.user.name,
          email: response.user.email,
        })
      } else {
        setError("User not found with this email address")
      }
    } catch (err: any) {
      if (err.status === 404) {
        setError("User not found with this email address")
      } else {
        setError(err.message || "Error searching for user")
      }
    } finally {
      setSearchLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")
    setSuccess(false)

    if (!recipient || !amount) {
      setError("Please search for a recipient and enter an amount")
      setLoading(false)
      return
    }

    const transferAmount = Number.parseFloat(amount)
    if (transferAmount <= 0) {
      setError("Please enter a valid amount")
      setLoading(false)
      return
    }

    // Check if user has sufficient balance
    const user = JSON.parse(localStorage.getItem("user") || "{}")
    if (transferAmount > (user.balance || 0)) {
      setError("Insufficient balance for this transfer")
      setLoading(false)
      return
    }

    try {
      // Import the API client
      const { apiClient } = await import("@/lib/api")
      
      // Transfer funds using the real API
      const response = await apiClient.transferFunds({
        recipient_id: recipient.id,
        amount: transferAmount,
        note: note,
      })

      if (response.success) {
        setSuccess(true)
        setAmount("")
        setNote("")
        setRecipient(null)
        setRecipientEmail("")

        // Update user balance in localStorage if provided in response
        if (response.new_balance !== undefined) {
          const user = JSON.parse(localStorage.getItem("user") || "{}")
          user.balance = response.new_balance
          localStorage.setItem("user", JSON.stringify(user))
        }
      } else {
        setError(response.message || "Transfer failed")
      }
    } catch (err: any) {
      if (err.status === 400) {
        setError(err.message || "Insufficient balance for this transfer")
      } else {
        setError(err.message || "Network error. Please try again.")
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Transfer Funds</h1>
        <p className="text-gray-600">Send money to other registered users</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Send className="h-5 w-5" />
            <span>Send Money</span>
          </CardTitle>
          <CardDescription>Enter the recipient's email address and transfer amount</CardDescription>
        </CardHeader>
        <CardContent>
          {success && (
            <Alert className="mb-6 border-green-200 bg-green-50">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">
                Transfer successful! ${amount} has been sent to {recipient?.name}.
              </AlertDescription>
            </Alert>
          )}

          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Recipient Search */}
            <div className="space-y-3">
              <Label htmlFor="recipientEmail">Recipient Email</Label>
              <div className="flex space-x-2">
                <Input
                  id="recipientEmail"
                  type="email"
                  placeholder="Enter recipient's email address"
                  value={recipientEmail}
                  onChange={(e) => setRecipientEmail(e.target.value)}
                  className="flex-1"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleSearchUser}
                  disabled={searchLoading || !recipientEmail}
                >
                  {searchLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                </Button>
              </div>
            </div>

            {/* Recipient Display */}
            {recipient && (
              <Card className="bg-green-50 border-green-200">
                <CardContent className="pt-4">
                  <div className="flex items-center space-x-3">
                    <Avatar>
                      <AvatarImage src={recipient.avatar || "/placeholder.svg"} alt={recipient.name} />
                      <AvatarFallback>
                        <Search className="h-4 w-4" />
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-semibold text-green-800">{recipient.name}</p>
                      <p className="text-sm text-green-600">{recipient.email}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Amount */}
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

            {/* Note */}
            <div className="space-y-2">
              <Label htmlFor="note">Note (Optional)</Label>
              <Input
                id="note"
                type="text"
                placeholder="Add a note for this transfer"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                maxLength={100}
              />
            </div>

            {/* Transfer Summary */}
            {recipient && amount && (
              <Card className="bg-gray-50">
                <CardContent className="pt-4">
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Recipient:</span>
                      <span className="font-medium">{recipient.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Amount:</span>
                      <span className="font-medium">${Number.parseFloat(amount || "0").toFixed(2)}</span>
                    </div>
                    {note && (
                      <div className="flex justify-between">
                        <span>Note:</span>
                        <span className="font-medium">{note}</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            <Button type="submit" className="w-full" disabled={loading || !recipient || !amount}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {loading ? "Processing..." : `Send $${Number.parseFloat(amount || "0").toFixed(2)}`}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
