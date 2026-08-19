# Gym Activity Tracker (MERN Stack Application)

A full-stack fitness performance tracking web application designed specifically for two predefined users (`dasun_navindu` and `gayan_maduranga`) to manage monthly workout sets, log daily exercise weights, track personal records, and visualize performance trends through interactive charts.

---

## 🌟 Application Features

- **Predefined Dual-User Authentication**: Restricted login for `dasun_navindu` and `gayan_maduranga` with secure JWT tokens and bcrypt password hashing.
- **Monthly Workout Sets Management**: Create, edit, and delete monthly training routines.
- **Daily Exercise Logging**: Log exercise weight measurements (in kg) and specific workout dates.
- **Interactive Progress Charts**: Dynamic Recharts visual line chart showing weight progression over time with tooltips, legend, and statistics breakdown (Current weight, Personal Record/Best, Average weight, and Trend direction).
- **Security & Account Settings**: Profile overview, member since date, password change form with live strength validation (8+ characters, letters & numbers requirement).
- **Responsive Dark Theme UI**: Built with modern CSS glassmorphic aesthetic, custom controls, and glowing accent colors.

---

## 🛠️ Technology Stack

- **Frontend**: React.js (Hooks & Functional Components), React Router v6, Recharts, Lucide Icons, Axios, Vite.
- **Backend**: Node.js, Express.js REST API, Mongoose ORM, JWT, bcryptjs, CORS, Dotenv.
- **Database**: MongoDB (Atlas or In-Memory fallback for instant out-of-the-box local testing).

---

## 🚀 Quick Start & Installation

### 1. Backend Setup (`server/`)

```bash
cd server
npm install
node scripts/seed.js   # (Optional) Manually seed database
npm start               # Starts Express server on http://localhost:5000
```

### 2. Frontend Setup (`client/`)

```bash
cd client
npm install
npm run dev             # Starts Vite development server on http://localhost:3000
```

---

## 🔑 Pre-Configured Test Credentials

| Username | Default Password | Access Level |
| :--- | :--- | :--- |
| `dasun_navindu` | `!@$$@%^$%^!@%^` | Authorized User |
| `gayan_maduranga` | `!@$$@%^$%^!@%^` | Authorized User |

---

## 📡 REST API Endpoint Documentation

### Authentication Routes
- `POST /api/auth/login` - Authenticate predefined user & issue JWT token.

### Workout Routes (Protected via JWT)
- `GET /api/workouts` - Get all workout sets for current user.
- `POST /api/workouts` - Create a new monthly workout set.
- `DELETE /api/workouts/:id` - Delete workout set and its exercises.
- `GET /api/workouts/:id/exercises` - Get exercises for a specific set.
- `POST /api/workouts/:id/exercises` - Log new exercise inside a set.
- `PUT /api/workouts/exercises/:id` - Update exercise weight, date, or name.
- `DELETE /api/workouts/exercises/:id` - Delete an exercise entry.

### User Routes (Protected via JWT)
- `GET /api/users/profile` - Retrieve current user profile.
- `PUT /api/users/change-password` - Change account password.

### Progress Routes (Protected via JWT)
- `GET /api/progress/exercises` - Get distinct exercise names for current user.
- `GET /api/progress/:exerciseName` - Get historical date vs weight progression for line charts.

---
