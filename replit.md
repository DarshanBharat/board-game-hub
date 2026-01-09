# Boardy - Board Game Rental Platform

## Overview
A full-stack board game rental platform built with React, Express, TypeScript, and PostgreSQL. Users can browse games, rent them, join Saturday night events, and find their gaming community.

## Project Structure
- `src/` - React frontend source code
  - `components/` - Reusable UI components (layout, ui)
  - `hooks/` - Custom React hooks (useAuth, use-toast)
  - `lib/` - Utility functions (queryClient, utils)
  - `pages/` - Page components (Games, Events, Admin, etc.)
- `server/` - Express backend
  - `routes.ts` - API endpoints
  - `storage.ts` - Database operations
  - `db.ts` - Database connection
  - `seed.ts` - Seed data
  - `index.ts` - Server entry point
- `shared/` - Shared types and schemas
  - `schema.ts` - Drizzle ORM schema and Zod validation
- `public/` - Static assets

## Tech Stack
- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS, Radix UI, TanStack React Query
- **Backend**: Express, Node.js, Drizzle ORM
- **Database**: PostgreSQL (Neon)
- **Authentication**: Session-based with bcrypt password hashing

## Features
- User authentication (signup with name/email/phone/room/password, login with email/password)
- Game catalog with filtering by category, search, and availability
- Game detail pages with "What's in the Box" section and external rules link
- Rental system with start/end dates, UPI payment tracking (7845267809@ptyes)
- Event registration for Saturday night gaming events
- Admin dashboard for managing games, rentals, events, and users
- Game availability automatically updates based on rental status
- Video rules link and view functionality

## Database Schema
- **users**: id, email, password, name, phone, roomNumber, isAdmin
- **games**: id, name, description, category, minPlayers, maxPlayers, playTime, complexity, imageUrl, rulesUrl, videoRulesUrl, boxContents, available, rentalPrice
- **rentals**: id, userId, gameId, startDate, endDate, status, paymentPhone, paymentTime, createdAt
- **events**: id, title, description, date, time, location, maxParticipants, currentParticipants, price, imageUrl
- **event_registrations**: id, eventId, userId, status, paymentPhone, paymentTime, createdAt

## Development
- Run `npm run dev` to start the development server on port 5000
- Run `npm run db:push` to sync database schema
- Run `npm run db:seed` to seed database with test data

## Deployment
Configured for autoscale deployment. Build: `npm run build`, Run: `npm run start`

## Test Accounts
- Admin: admin@boardy.com / admin123
- User: john@example.com / password123

## Recent Changes
- January 9, 2026: Complete platform implementation
  - PostgreSQL database with Drizzle ORM
  - Session-based authentication
  - Game rental system with UPI payment
  - Event registration system
  - Admin dashboard with full CRUD operations
  - Seeded with test data (4 users, 6 games, 2 events)
  - Added video rules link and view functionality
  - Fixed deployment build configuration for full-stack architecture
