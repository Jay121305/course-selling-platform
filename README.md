# EduLaunch — Course Selling Platform

A full-stack platform where educators can register, create and manage courses, and students can enroll through Razorpay payments and track learning progress. Includes an admin panel for platform management.

## Tech Stack

- **Frontend**: React 18 + Vite
- **Backend**: Node.js + Express
- **Database**: MongoDB + Mongoose
- **Auth**: JWT-based authentication
- **Payments**: Razorpay (with mock fallback)
- **Video**: YouTube embedded player
- **Email**: Nodemailer (SMTP, with console fallback)

## Features

- Educator registration and dashboard with analytics
- Course creation with chapters and YouTube video links
- Student enrollment with Razorpay checkout or mock payment
- Course progress tracking (chapter-by-chapter)
- Reviews & Ratings system
- Admin panel — manage users, courses, and view platform stats
- Email notifications on registration and enrollment
- Responsive dark-theme UI with glassmorphism design

## Project Structure

- `client` — React frontend (Vite)
- `server` — Express API + MongoDB models

## Quick Start

1. Install dependencies:

       npm run install:all

2. Setup backend environment:

   - Copy `server/.env.example` to `server/.env`
   - Add your Razorpay test keys (optional — mock payment works without them)

3. Seed admin user:

       cd server && npm run seed:admin

4. Run the project:

       npm run dev

5. Open frontend at: http://localhost:5173

   Backend runs at: http://localhost:5000

## Default Roles

- `student` — can browse, enroll, learn, track progress, and review courses
- `educator` — can create courses, manage content, and view analytics
- `admin` — can manage all users and courses on the platform

## Default Admin Credentials

- Email: `admin@edulaunch.com`
- Password: `admin123`

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `MONGO_URI` | MongoDB connection string | Yes |
| `JWT_SECRET` | JWT signing secret | Yes |
| `CLIENT_URL` | Frontend URL for CORS | Yes |
| `RAZORPAY_KEY_ID` | Razorpay test key ID | No (mock fallback) |
| `RAZORPAY_KEY_SECRET` | Razorpay test key secret | No (mock fallback) |
| `SMTP_HOST` | SMTP server host | No (console fallback) |
| `SMTP_PORT` | SMTP server port | No |
| `SMTP_USER` | SMTP username/email | No |
| `SMTP_PASS` | SMTP password/app password | No |
| `ADMIN_EMAIL` | Admin seed email | No |
| `ADMIN_PASSWORD` | Admin seed password | No |
