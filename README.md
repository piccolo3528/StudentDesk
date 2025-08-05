# This project is not complete its work under process


# Student Mess Delivery Website

A MERN stack application for students and meal providers to manage mess deliveries and subscriptions.

## Overview

This platform connects students with meal providers, allowing:

- Students to browse providers, subscribe to meal plans, and manage their deliveries
- Providers to create meal plans, manage menus, and track subscriptions

## Features

### For Students
- Browse available meal providers
- View provider details, menus, and reviews
- Subscribe to monthly meal plans
- Choose meal preferences (breakfast, lunch, dinner)
- Track orders and deliveries
- Rate and review providers

### For Providers
- Create and manage business profile
- Create meal plans with various options
- Manage menu items
- View subscribers and their preferences
- Process orders and update delivery status

## Tech Stack

### Backend
- Node.js with Express
- MongoDB with Mongoose
- JWT Authentication
- RESTful API design

### Frontend
- React.js
- Context API for state management
- React Router for navigation
- Responsive design with CSS

## Getting Started

### Prerequisites
- Node.js (v14 or later)
- MongoDB (local or Atlas)
- npm or yarn

### Installation

1. Clone the repository
```
git clone <repository-url>
cd studentdesk
```

2. Install backend dependencies
```
cd backend
npm install
```

3. Install frontend dependencies
```
cd ../frontend
npm install
```

4. Configure environment variables
Create a `.env` file in the backend folder with:
```
PORT=5000
MONGO_URI=mongodb://localhost:27017/student-mess-delivery
JWT_SECRET=your_secret_key
```

5. Run the application
```
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm start
```

## API Endpoints

### Authentication
- POST /api/auth/register - Register a new user (student or provider)
- POST /api/auth/login - Login user
- GET /api/auth/me - Get current user profile
- GET /api/auth/logout - Logout user

### Student Routes
- GET /api/students/providers - Get all providers
- GET /api/students/providers/:id - Get provider details
- POST /api/students/subscribe - Subscribe to a meal plan
- GET /api/students/subscriptions - Get student's subscriptions
- POST /api/students/reviews/:providerId - Add a review for a provider
- GET /api/students/orders - Get student's orders

### Provider Routes
- PUT /api/providers/profile - Update provider profile
- POST /api/providers/meal-plans - Create a meal plan
- GET /api/providers/meal-plans - Get provider's meal plans
- POST /api/providers/menu-items - Create a menu item
- GET /api/providers/menu-items - Get provider's menu items
- GET /api/providers/subscribers - Get provider's subscribers
- GET /api/providers/orders - Get provider's orders
- PUT /api/providers/orders/:id - Update order status 