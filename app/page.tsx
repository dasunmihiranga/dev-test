import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowRight, CreditCard, Send, Receipt, History } from "lucide-react"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-16">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">Digital Wallet</h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Manage your finances with ease. Top up your account, pay bills, transfer funds, and track all your
            transactions in one place.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="text-lg px-8">
              <Link href="/auth/register">
                Get Started <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="text-lg px-8 bg-transparent">
              <Link href="/auth/login">Sign In</Link>
            </Button>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          <Card className="text-center hover:shadow-lg transition-shadow">
            <CardHeader>
              <CreditCard className="h-12 w-12 mx-auto text-blue-600 mb-4" />
              <CardTitle>Account Top-up</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>Add funds to your account instantly and securely</CardDescription>
            </CardContent>
          </Card>

          <Card className="text-center hover:shadow-lg transition-shadow">
            <CardHeader>
              <Receipt className="h-12 w-12 mx-auto text-green-600 mb-4" />
              <CardTitle>Pay Bills</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>Pay electricity, water, internet and other bills easily</CardDescription>
            </CardContent>
          </Card>

          <Card className="text-center hover:shadow-lg transition-shadow">
            <CardHeader>
              <Send className="h-12 w-12 mx-auto text-purple-600 mb-4" />
              <CardTitle>Fund Transfer</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>Send money to other users quickly and safely</CardDescription>
            </CardContent>
          </Card>

          <Card className="text-center hover:shadow-lg transition-shadow">
            <CardHeader>
              <History className="h-12 w-12 mx-auto text-orange-600 mb-4" />
              <CardTitle>Transaction History</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>Track all your transactions and account activity</CardDescription>
            </CardContent>
          </Card>
        </div>

        {/* CTA Section */}
        <div className="text-center">
          <Card className="max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle className="text-2xl">Ready to get started?</CardTitle>
              <CardDescription className="text-lg">
                Join thousands of users who trust our platform for their financial needs
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild size="lg" className="text-lg px-8">
                <Link href="/auth/register">
                  Create Your Account <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
