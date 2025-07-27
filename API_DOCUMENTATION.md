# Digital Wallet API Documentation

This document provides comprehensive information about all API endpoints for the Digital Wallet application built with Next.js frontend and Laravel backend.

## Table of Contents

- [Overview](#overview)
- [Base Configuration](#base-configuration)
- [Authentication](#authentication)
- [User Management](#user-management)
- [Transactions](#transactions)
- [Error Handling](#error-handling)
- [Development Setup](#development-setup)

## Overview

The Digital Wallet API provides endpoints for user authentication, account management, financial transactions including transfers, bill payments, and account top-ups.

## Base Configuration

### Environment Variables
\`\`\`env
NEXT_PUBLIC_API_URL=http://localhost:8000/api
\`\`\`

### Base URL
\`\`\`
http://localhost:8000/api
\`\`\`

### Authentication
All authenticated endpoints require a Bearer token in the Authorization header:
\`\`\`
Authorization: Bearer {your_jwt_token}
\`\`\`

## Authentication

### Register User

**Endpoint:** `POST /api/auth/register`

**Headers:**
\`\`\`json
{
  "Content-Type": "application/json"
}
\`\`\`

**Request Body:**
\`\`\`json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "password_confirmation": "password123"
}
\`\`\`

**Response (Success - 201):**
\`\`\`json
{
  "success": true,
  "user": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "balance": 0.00
  },
  "token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
  "message": "Registration successful"
}
\`\`\`

### Login User

**Endpoint:** `POST /api/auth/login`

**Headers:**
\`\`\`json
{
  "Content-Type": "application/json"
}
\`\`\`

**Request Body:**
\`\`\`json
{
  "email": "john@example.com",
  "password": "password123"
}
\`\`\`

**Response (Success - 200):**
\`\`\`json
{
  "success": true,
  "user": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "balance": 1250.75
  },
  "token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
  "message": "Login successful"
}
\`\`\`

### Logout User

**Endpoint:** `POST /api/auth/logout`

**Headers:**
\`\`\`json
{
  "Authorization": "Bearer {token}",
  "Content-Type": "application/json"
}
\`\`\`

**Response (Success - 200):**
\`\`\`json
{
  "success": true,
  "message": "Logout successful"
}
\`\`\`

## User Management

### Get User Profile

**Endpoint:** `GET /api/user/profile`

**Headers:**
\`\`\`json
{
  "Authorization": "Bearer {token}"
}
\`\`\`

**Response (Success - 200):**
\`\`\`json
{
  "success": true,
  "user": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "balance": 1250.75,
    "created_at": "2025-01-15T10:30:00Z",
    "updated_at": "2025-01-20T14:45:00Z"
  }
}
\`\`\`

### Search User by Email

**Endpoint:** `GET /api/users/search?email={email}`

**Headers:**
\`\`\`json
{
  "Authorization": "Bearer {token}"
}
\`\`\`

**Query Parameters:**
- `email` (required): Email address to search for

**Example Request:**
\`\`\`
GET /api/users/search?email=jane@example.com
\`\`\`

**Response (Success - 200):**
\`\`\`json
{
  "success": true,
  "user": {
    "id": 2,
    "name": "Jane Smith",
    "email": "jane@example.com"
  }
}
\`\`\`

**Response (Not Found - 404):**
\`\`\`json
{
  "success": false,
  "message": "User not found"
}
\`\`\`

## Transactions

### Account Top-up

**Endpoint:** `POST /api/topup`

**Headers:**
\`\`\`json
{
  "Authorization": "Bearer {token}",
  "Content-Type": "application/json"
}
\`\`\`

**Request Body:**
\`\`\`json
{
  "amount": 100.00,
  "payment_method": "credit_card"
}
\`\`\`

**Response (Success - 200):**
\`\`\`json
{
  "success": true,
  "transaction": {
    "id": 123,
    "type": "topup",
    "amount": 100.00,
    "status": "completed",
    "reference": "TXN-123456789",
    "created_at": "2025-01-20T15:30:00Z"
  },
  "new_balance": 1350.75,
  "message": "Top-up successful"
}
\`\`\`

### Bill Payment

**Endpoint:** `POST /api/bills/pay`

**Headers:**
\`\`\`json
{
  "Authorization": "Bearer {token}",
  "Content-Type": "application/json"
}
\`\`\`

**Request Body:**
\`\`\`json
{
  "biller_id": "electricity_board",
  "amount": 150.00,
  "account_number": "ACC123456789"
}
\`\`\`

**Response (Success - 200):**
\`\`\`json
{
  "success": true,
  "transaction": {
    "id": 124,
    "type": "bill_payment",
    "amount": 150.00,
    "status": "completed",
    "reference": "BILL-987654321",
    "biller": "Electricity Board",
    "account_number": "ACC123456789",
    "created_at": "2025-01-20T16:00:00Z"
  },
  "new_balance": 1200.75,
  "message": "Bill payment successful"
}
\`\`\`

### Fund Transfer

**Endpoint:** `POST /api/transfer`

**Headers:**
\`\`\`json
{
  "Authorization": "Bearer {token}",
  "Content-Type": "application/json"
}
\`\`\`

**Request Body:**
\`\`\`json
{
  "recipient_id": 2,
  "amount": 50.00,
  "note": "Payment for lunch"
}
\`\`\`

**Response (Success - 200):**
\`\`\`json
{
  "success": true,
  "transaction": {
    "id": 125,
    "type": "transfer_sent",
    "amount": 50.00,
    "status": "completed",
    "reference": "TRF-555666777",
    "recipient": "Jane Smith",
    "note": "Payment for lunch",
    "created_at": "2025-01-20T16:30:00Z"
  },
  "new_balance": 1150.75,
  "message": "Transfer successful"
}
\`\`\`

### Get Transaction History

**Endpoint:** `GET /api/transactions`

**Headers:**
\`\`\`json
{
  "Authorization": "Bearer {token}"
}
\`\`\`

**Query Parameters (Optional):**
- `type`: Filter by transaction type (`bill_payment`, `transfer_sent`, `transfer_received`, `topup`)
- `status`: Filter by status (`completed`, `pending`, `failed`)
- `search`: Search term for descriptions
- `limit`: Number of transactions to return (default: 50)
- `offset`: Number of transactions to skip (default: 0)

**Example Request:**
\`\`\`
GET /api/transactions?type=transfer_sent&status=completed&limit=10
\`\`\`

**Response (Success - 200):**
\`\`\`json
{
  "success": true,
  "transactions": [
    {
      "id": 125,
      "type": "transfer_sent",
      "amount": 50.00,
      "description": "Transfer to Jane Smith",
      "status": "completed",
      "reference": "TRF-555666777",
      "recipient": "Jane Smith",
      "note": "Payment for lunch",
      "created_at": "2025-01-20T16:30:00Z"
    },
    {
      "id": 124,
      "type": "bill_payment",
      "amount": 150.00,
      "description": "Electricity Board payment",
      "status": "completed",
      "reference": "BILL-987654321",
      "biller": "Electricity Board",
      "account_number": "ACC123456789",
      "created_at": "2025-01-20T16:00:00Z"
    }
  ],
  "pagination": {
    "total": 25,
    "limit": 10,
    "offset": 0,
    "has_more": true
  }
}
\`\`\`

### Get Dashboard Statistics

**Endpoint:** `GET /api/dashboard/stats`

**Headers:**
\`\`\`json
{
  "Authorization": "Bearer {token}"
}
\`\`\`

**Response (Success - 200):**
\`\`\`json
{
  "success": true,
  "stats": {
    "current_balance": 1150.75,
    "total_income": 2000.00,
    "total_expenses": 849.25,
    "recent_transactions_count": 5,
    "pending_transactions_count": 0,
    "monthly_spending": {
      "current_month": 350.00,
      "previous_month": 280.50
    },
    "transaction_summary": {
      "topups": {
        "count": 3,
        "total_amount": 500.00
      },
      "transfers": {
        "sent": {
          "count": 8,
          "total_amount": 200.00
        },
        "received": {
          "count": 5,
          "total_amount": 150.00
        }
      },
      "bills": {
        "count": 4,
        "total_amount": 499.25
      }
    }
  }
}
\`\`\`

## Error Handling

### HTTP Status Codes

- `200` - OK (Success)
- `201` - Created (Resource created successfully)
- `400` - Bad Request (Validation errors)
- `401` - Unauthorized (Invalid credentials or token)
- `403` - Forbidden (Access denied)
- `404` - Not Found (Resource not found)
- `422` - Unprocessable Entity (Validation failed)
- `500` - Internal Server Error

### Error Response Format

All error responses follow this structure:

\`\`\`json
{
  "success": false,
  "message": "Error description",
  "errors": {
    "field_name": [
      "Specific error message"
    ]
  }
}
\`\`\`

### Common Error Examples

**Validation Error (422):**
\`\`\`json
{
  "success": false,
  "message": "Validation failed",
  "errors": {
    "email": [
      "The email field is required."
    ],
    "password": [
      "The password must be at least 8 characters."
    ]
  }
}
\`\`\`

**Authentication Error (401):**
\`\`\`json
{
  "success": false,
  "message": "Invalid credentials"
}
\`\`\`

**Authorization Error (401):**
\`\`\`json
{
  "success": false,
  "message": "Token expired or invalid"
}
\`\`\`

**Insufficient Balance Error (400):**
\`\`\`json
{
  "success": false,
  "message": "Insufficient balance for this transaction"
}
\`\`\`

## Development Setup

### Current Implementation

The project currently includes mock API routes for development purposes:

- `/app/api/auth/login/route.ts` - Mock login endpoint
- `/app/api/auth/register/route.ts` - Mock registration endpoint

### API Client

The project includes an API client class located at `/lib/api.ts` with the following methods:

- `login(credentials)` - User authentication
- `register(userData)` - User registration  
- `logout()` - User logout
- `getProfile()` - Get user profile
- `searchUser(email)` - Search users by email
- `topUp(amount, paymentMethod)` - Account top-up
- `payBill(billData)` - Bill payments
- `transferFunds(transferData)` - Fund transfers
- `getTransactionHistory(filters)` - Get transaction history
- `getDashboardStats()` - Get dashboard statistics

### Usage Example

\`\`\`typescript
import { ApiClient } from '@/lib/api';

const api = new ApiClient();

// Login
const loginResult = await api.login({
  email: 'user@example.com',
  password: 'password123'
});

// Transfer funds
const transferResult = await api.transferFunds({
  recipient_id: 2,
  amount: 100.00,
  note: 'Payment for services'
});
\`\`\`

### Environment Configuration

Create a `.env.local` file in your project root:

\`\`\`env
NEXT_PUBLIC_API_URL=http://localhost:8000/api
\`\`\`

For production, update the API URL accordingly:

\`\`\`env
NEXT_PUBLIC_API_URL=https://your-api-domain.com/api
\`\`\`

---

**Last Updated:** July 27, 2025  
**Version:** 1.0.0
