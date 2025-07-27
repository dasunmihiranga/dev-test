"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  LayoutDashboard,
  CreditCard,
  Receipt,
  Send,
  History,
  LogOut,
  Menu,
  X,
  User,
  Settings,
  Wallet,
} from "lucide-react"
import { apiClient } from "@/lib/api"

interface DashboardUser {
  id: number
  name: string
  email: string
  balance: number
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [user, setUser] = useState<DashboardUser | null>(null)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    // Check if user is authenticated
    const token = localStorage.getItem("token")
    const userData = localStorage.getItem("user")

    if (!token || !userData) {
      router.push("/auth/login")
      return
    }

    try {
      const parsedUser = JSON.parse(userData)
      setUser(parsedUser)
      setLoading(false)

      // Optionally fetch fresh user data
      fetchUserData()
    } catch (error) {
      console.error("Error parsing user data:", error)
      router.push("/auth/login")
    }
  }, [router])

  const fetchUserData = async () => {
    try {
      const response = await apiClient.getCurrentUser()
      if (response.success && response.user) {
        setUser(response.user)
        localStorage.setItem("user", JSON.stringify(response.user))
      }
    } catch (error) {
      console.error("Error fetching user data:", error)
      // If token is invalid, redirect to login
      if ((error as any).status === 401) {
        handleLogout()
      }
    }
  }

  const handleLogout = async () => {
    try {
      await apiClient.logout()
    } catch (error) {
      console.error("Logout error:", error)
    } finally {
      // Clear local storage and redirect regardless of API response
      localStorage.removeItem("token")
      localStorage.removeItem("user")
      router.push("/auth/login")
    }
  }

  const navigation = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "Top Up", href: "/dashboard/topup", icon: CreditCard },
    { name: "Pay Bills", href: "/dashboard/bills", icon: Receipt },
    { name: "Transfer", href: "/dashboard/transfer", icon: Send },
    { name: "History", href: "/dashboard/history", icon: History },
  ]

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <div
        className={`
          fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-xl transform transition-transform duration-300 ease-in-out
          lg:translate-x-0 lg:static lg:inset-0
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        {/* Sidebar Header */}
        <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200 bg-white">
          <div className="flex items-center space-x-2">
            <Wallet className="h-8 w-8 text-blue-600" />
            <h1 className="text-xl font-bold text-gray-900">Digital Wallet</h1>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden hover:bg-gray-100"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Balance Card */}
        <div className="p-6 border-b border-gray-200">
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-4 text-white">
            <p className="text-sm opacity-90">Current Balance</p>
            <p className="text-2xl font-bold">${user.balance.toFixed(2)}</p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-2">
          {navigation.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`
                  flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200
                  ${
                    isActive
                      ? "bg-blue-50 text-blue-700 border-r-2 border-blue-700"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  }
                `}
                onClick={() => setSidebarOpen(false)}
              >
                <item.icon className={`mr-3 h-5 w-5 ${isActive ? "text-blue-700" : "text-gray-400"}`} />
                {item.name}
              </Link>
            )
          })}
        </nav>

        {/* User Profile Section */}
        <div className="p-4 border-t border-gray-200">
          <div className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50">
            <Avatar className="h-10 w-10">
              <AvatarImage src="/placeholder.svg" alt={user.name} />
              <AvatarFallback className="bg-blue-100 text-blue-700">{user.name.charAt(0).toUpperCase()}</AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">{user.name}</p>
              <p className="text-xs text-gray-500 truncate">{user.email}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Top bar */}
        <div className="sticky top-0 z-30 bg-white border-b border-gray-200 shadow-sm">
          <div className="flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8">
            {/* Mobile menu button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden hover:bg-gray-100"
            >
              <Menu className="h-5 w-5" />
            </Button>

            {/* Page title - hidden on mobile, shown on larger screens */}
            <div className="hidden sm:block">
              <h2 className="text-lg font-semibold text-gray-900">
                {navigation.find((item) => item.href === pathname)?.name || "Dashboard"}
              </h2>
            </div>

            {/* User menu */}
            <div className="flex items-center space-x-4">
              {/* Balance display on mobile */}
              <div className="sm:hidden">
                <span className="text-sm font-medium text-green-600">${user.balance.toFixed(2)}</span>
              </div>

              {/* User dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-10 w-10 rounded-full hover:bg-gray-100">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src="/placeholder.svg" alt={user.name} />
                      <AvatarFallback className="bg-blue-100 text-blue-700">
                        {user.name.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-64" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">{user.name}</p>
                      <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
                      <p className="text-xs leading-none text-green-600 font-medium">
                        Balance: ${user.balance.toFixed(2)}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                    <User className="mr-2 h-4 w-4" />
                    <span>Profile</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Settings</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="text-red-600 focus:text-red-600">
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>

        {/* Page content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">{children}</div>
        </main>
      </div>
    </div>
  )
}
