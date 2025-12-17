# Hasan Enterprises Plot Purchase Management System

## Overview
A comprehensive backend system for managing plot purchases, payments, and legal escalations for Hasan Enterprises. Built with Node.js, Express.js, and MongoDB.

## Tech Stack
- **Runtime**: Node.js 20
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT-based with role-based access control
- **File Upload**: Multer

## Project Structure
```
src/
├── config/           # Database and constants configuration
├── controllers/      # Route handlers
├── middleware/       # Auth, upload, error handling
├── models/           # Mongoose schemas
├── routes/           # API route definitions
├── utils/            # Helper functions (milestone service)
└── server.js         # Entry point
```

## Entities (MongoDB Collections)
- **User**: Authentication users with roles
- **Purchase**: Purchaser information (name, CNIC, phone, balance)
- **ServiceProvider**: Service provider details
- **Place**: Company information (Hassan Enterprises)
- **Plot**: Plot listings with status tracking
- **PlotDetails**: Documents and milestone certificates
- **PaymentSchedule**: Payment plan per plot
- **PaymentInstallment**: Individual payment records
- **FailedPayment**: Overdue payments and legal cases

## Use Cases Implemented
- UC-01: Select Plot and Submit Documents
- UC-02: Pay in accordance with payment schedule
- UC-03: Checkup with client about payment (failed payment tracking)
- UC-04: Prepare Allotment Documents (10% milestone)
- UC-05: Prepare Allocation Documents (50% milestone)
- UC-06: Prepare Possession Documents (75% milestone)
- UC-07: Prepare Clearance Certificate (100% milestone)
- UC-08: Case Filing against Client
- UC-09: Setup Payment Schedule
- UC-10: Details Stored in Company Records

## API Endpoints
- **Auth**: POST /api/auth/register, /api/auth/login, /api/auth/logout
- **Plots**: GET/POST /api/plots, POST /api/plots/:id/apply, POST /api/plots/:id/documents
- **Payments**: POST /api/payments/schedule, POST /api/payments/:id/pay
- **Cases**: POST /api/cases/failed-payment, POST /api/cases/:id/file
- **Dashboard**: GET /api/dashboard/purchaser, /service-provider, /admin

## Roles
- **purchaser**: Can apply for plots, upload documents, make payments
- **service_provider**: Can verify documents, create schedules, file cases
- **admin**: Full access, reports, audit logs
- **legal**: Case management, reports

## Environment Variables Required
- MONGODB_URI: MongoDB connection string
- JWT_SECRET: Secret for JWT tokens
- PORT: Server port (default: 5000)

## Running the Server
```bash
npm install
npm start
```
