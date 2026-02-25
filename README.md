# Food Delivery Order Management System

A complete full-stack food delivery application built with Node.js, Express, MongoDB, React, and TypeScript. This project demonstrates production-ready architecture, comprehensive testing, and modern development practices.

## Features

### Backend

- **RESTful API** with Express.js and TypeScript
- **MongoDB** database with Mongoose ODM
- **Repository Pattern** for clean data access
- **Service Layer** for business logic separation
- **Order Status Simulator** for automatic status progression
- **Comprehensive Validation** using express-validator
- **Error Handling** with custom error classes
- **Security** features (Helmet, CORS, Rate Limiting)
- **Structured Logging** with Winston
- **Test** cases with Jest and Supertest

### Frontend

- **React 19** with TypeScript
- **Vite** for fast development and building
- **Tailwind CSS** for modern, responsive UI
- **React Router** for navigation
- **Context API** for state management
- **Axios** for API communication
- **Cart Persistence** with localStorage
- **Real-time Order Tracking** with polling
- **Component Testing** with React Testing Library

## Project Structure

```
order_management_raftlabs_assignment/
├── backend/
│   ├── src/
│   │   ├── config/          # Database and app configuration
│   │   ├── controllers/     # Request handlers
│   │   ├── middleware/      # Express middleware
│   │   ├── models/          # Mongoose schemas
│   │   ├── repositories/    # Data access layer
│   │   ├── routes/          # API routes
│   │   ├── services/        # Business logic
│   │   ├── utils/           # Helper functions
│   │   ├── app.ts           # Express app setup
│   │   └── index.ts         # Server entry point
│   ├── tests/
│   │   ├── unit/            # Unit tests
│   │   └── integration/     # Integration tests
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/      # React components
│   │   │   ├── cart/        # Cart components
│   │   │   ├── checkout/    # Checkout components
│   │   │   ├── menu/        # Menu components
│   │   │   ├── order/       # Order tracking components
│   │   │   └── shared/      # Shared/reusable components
│   │   ├── contexts/        # React Context providers
│   │   ├── services/        # API client
│   │   ├── types/           # TypeScript type definitions
│   │   ├── __tests__/       # Component tests
│   │   ├── App.tsx          # Main app component
│   │   └── main.tsx         # Entry point
│   └── package.json
└── README.md
```

## Prerequisites

- Node.js (v18 or higher)
- MongoDB (v6 or higher)
- npm or yarn

## Installation

### 1. Clone the Repository

```bash
git clone <repository-url>
cd order_management_raftlabs_assignment
```

### 2. Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file in the backend directory:

```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/food_delivery
ORDER_STATUS_UPDATE_INTERVAL=30000
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
CORS_ORIGIN=http://localhost:5173
```

### 3. Frontend Setup

```bash
cd ../frontend
npm install
```

Create a `.env` file in the frontend directory:

```env
VITE_API_BASE_URL=http://localhost:5000/api
```

## Running the Application

### 1. Start MongoDB

Make sure MongoDB is running on your system:

```bash
# macOS (with Homebrew)
brew services start mongodb-community

# Linux
sudo systemctl start mongod

# Windows
net start MongoDB
```

### 2. Start the Backend Server

```bash
cd backend
npm run dev
```

The backend API will be available at `http://localhost:5000`

### 3. Start the Frontend Development Server

```bash
cd frontend
npm run dev
```

The frontend will be available at `http://localhost:5173`