# Order Management System

A full-stack order management application where sales representatives can place orders for clients, and admins/suppliers can monitor all orders, manage products, and track order statuses.

## Features

### Admin (Supplier)
- **Dashboard** - Overview of all orders with stats and recent activity
- **Product Management** - Add, edit, delete, and toggle product availability
- **Order Management** - View all orders, filter by status/sales rep, update order status
- **Notifications** - See new orders with notification badges

### Sales Representative
- **Dashboard** - Personal order stats and quick access to recent orders
- **Product Catalog** - Browse available products
- **Create Orders** - Select products and enter client information
- **Order Tracking** - View order history and track status

## Tech Stack

- **Frontend**: React 18, React Router, Axios, Vite
- **Backend**: Node.js, Express.js
- **Database**: SQLite with better-sqlite3
- **Authentication**: JWT with bcrypt password hashing

## Getting Started

### Prerequisites
- Node.js 18+ installed

### Installation

1. **Install backend dependencies**
   ```bash
   cd backend
   npm install
   ```

2. **Install frontend dependencies**
   ```bash
   cd frontend
   npm install
   ```

### Running the Application

1. **Start the backend server** (runs on port 5000)
   ```bash
   cd backend
   npm start
   ```

2. **Start the frontend development server** (runs on port 3000)
   ```bash
   cd frontend
   npm run dev
   ```

3. Open your browser and navigate to `http://localhost:3000`

### Admin Credentials

The admin account is pre-configured:
- **Username**: abbas123
- **Password**: khanshamman7

### First Time Setup

1. Login as admin using the credentials above
2. Add products from the Products page
3. Sales reps register through the registration page (requires admin approval)
4. Admin approves pending registrations from "User Approvals" page
5. Approved sales reps can login and create orders for clients
6. Admin views incoming orders and updates their status

### User Approval System

- New sales registrations require admin approval before users can login
- Admin receives notification badges for pending registrations
- Admin can approve or reject registrations from the "User Approvals" page
- Rejected registrations are deleted from the system

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Get current user

### Products
- `GET /api/products` - Get all products (admin)
- `GET /api/products/active` - Get active products (sales)
- `POST /api/products` - Create product (admin)
- `PUT /api/products/:id` - Update product (admin)
- `DELETE /api/products/:id` - Delete product (admin)

### Orders
- `POST /api/orders` - Create order (sales)
- `GET /api/orders` - Get all orders (admin)
- `GET /api/orders/my-orders` - Get user's orders (sales)
- `GET /api/orders/:id` - Get order details
- `PUT /api/orders/:id/status` - Update order status (admin)
- `GET /api/orders/admin/notifications/count` - Get unread count (admin)
- `PUT /api/orders/admin/notifications/read-all` - Mark all as read (admin)

## Order Status Flow

```
Pending → Confirmed → Processing → Shipped → Delivered
```

## License

MIT

