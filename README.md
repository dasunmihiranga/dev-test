# Laravel + Next.js Digital Wallet Frontend

This is the frontend part of a digital wallet application built with Next.js, designed to work with a Laravel backend API.

## Features

- **User Authentication**: Register and login functionality
- **Account Top-up**: Add funds to user accounts with multiple payment methods
- **Bill Payments**: Pay various bills (Electricity, Water, Internet, etc.)
- **Fund Transfer**: Send money to other registered users
- **Transaction History**: View and filter all transactions
- **Responsive Design**: Works on desktop and mobile devices

## Tech Stack

- **Next.js 14** with App Router
- **TypeScript** for type safety
- **Tailwind CSS** for styling
- **shadcn/ui** for UI components
- **Lucide React** for icons

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Laravel backend API (separate repository)

### Installation

1. Clone the repository:
\`\`\`bash
git clone <your-repo-url>
cd laravel-nextjs-frontend
\`\`\`

2. Install dependencies:
\`\`\`bash
npm install
# or
yarn install
\`\`\`

3. Create environment variables:
\`\`\`bash
cp .env.example .env.local
\`\`\`

4. Update the environment variables:
\`\`\`env
NEXT_PUBLIC_API_URL=http://localhost:8000/api
\`\`\`

5. Run the development server:
\`\`\`bash
npm run dev
# or
yarn dev
\`\`\`

6. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

\`\`\`
app/
├── auth/
│   ├── login/page.tsx          # Login page
│   └── register/page.tsx       # Registration page
├── dashboard/
│   ├── layout.tsx              # Dashboard layout with sidebar
│   ├── page.tsx                # Dashboard home
│   ├── topup/page.tsx          # Account top-up
│   ├── bills/page.tsx          # Bill payments
│   ├── transfer/page.tsx       # Fund transfer
│   └── history/page.tsx        # Transaction history
├── api/                        # Mock API routes for development
└── page.tsx                    # Landing page

components/ui/                  # shadcn/ui components
lib/
├── api.ts                      # API client utilities
└── utils.ts                    # Utility functions
\`\`\`

## API Integration

The frontend is designed to work with a Laravel backend. The main API endpoints expected are:

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout

### User Management
- `GET /api/user/profile` - Get user profile
- `GET /api/users/search` - Search users by email

### Transactions
- `POST /api/topup` - Account top-up
- `POST /api/bills/pay` - Pay bills
- `POST /api/transfer` - Transfer funds
- `GET /api/transactions` - Get transaction history
- `GET /api/dashboard/stats` - Get dashboard statistics

## Features Overview

### 1. User Authentication
- Registration with name, email, and password
- Login with email and password
- JWT token-based authentication
- Automatic redirect to dashboard after login

### 2. Dashboard
- Overview of account balance and statistics
- Quick action buttons for common tasks
- Recent transactions display
- Responsive sidebar navigation

### 3. Account Top-up
- Multiple payment method options
- Quick amount selection buttons
- Custom amount input
- Transaction confirmation

### 4. Bill Payments
- Hardcoded list of billers (Electricity, Water, Internet, etc.)
- Biller selection with visual cards
- Account number and amount input
- Payment confirmation

### 5. Fund Transfer
- User search by email address
- Recipient verification display
- Amount and optional note input
- Transfer confirmation

### 6. Transaction History
- Complete transaction listing
- Filter by type, status, and search term
- Export to CSV functionality
- Pagination support

## Mock Data

For development purposes, the application includes mock API routes and data:

- Mock user authentication
- Sample transaction history
- Simulated payment processing
- Demo user search functionality

## Deployment

### Build for Production

\`\`\`bash
npm run build
npm start
\`\`\`

### Environment Variables

Make sure to set the following environment variables in production:

\`\`\`env
NEXT_PUBLIC_API_URL=https://your-laravel-api.com/api
\`\`\`

## Laravel Backend Integration

This frontend expects a Laravel backend with the following features:

1. **Authentication**: Laravel Sanctum or Passport for API authentication
2. **User Management**: User registration, login, and profile management
3. **Transaction Processing**: Handle top-ups, bill payments, and transfers
4. **Activity Logging**: Using Spatie Laravel Activitylog v4
5. **Database**: MySQL/PostgreSQL with proper transaction tables

### Expected Database Tables

- `users` - User accounts
- `transactions` - All transaction records
- `billers` - Available bill payment providers
- `activity_log` - User activity logging (Spatie package)

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is open-source and available under the MIT License.
