# ⚡ Skill Swap Platform

A full-stack SaaS-style web application for exchanging skills. Teach what you know, learn what you want.

---

## Tech Stack

| Layer | Tech |
|-------|------|
| Frontend | React 19, React Router v7, CSS Variables (dark mode) |
| Backend | Node.js, Express.js |
| Database | MongoDB + Mongoose |
| Auth | JWT (7-day tokens) |
| Notifications | react-hot-toast |

---

## Project Structure

```
skill-swap-platform/
├── server/                  # Express backend
│   ├── controllers/         # Route logic
│   ├── middleware/          # JWT auth middleware
│   ├── models/              # Mongoose schemas
│   ├── routes/              # API routes
│   ├── index.js             # Entry point
│   ├── seed.js              # Sample data seeder
│   └── .env                 # Environment variables
│
└── skill-swap-frontend/     # React frontend
    └── src/
        ├── api/             # Axios instance
        ├── components/      # Navbar, UserCard, SkillTag, SkillForm
        ├── context/         # AuthContext, ThemeContext
        └── pages/           # Home, Login, Register, Dashboard, Profile, Explore, Matches, UserProfile
```

---

## Setup Instructions

### Prerequisites
- Node.js 18+
- MongoDB running locally (`mongod`) or a MongoDB Atlas URI

---

### 1. Backend

```bash
cd server
npm install
```

Edit `.env` if needed (defaults work for local MongoDB):
```
PORT=5000
MONGO_URI=mongodb://localhost:27017/skillswap
JWT_SECRET=skillswap_super_secret_jwt_key_2024
```

Start the server:
```bash
npm run dev      # with nodemon (auto-reload)
# or
npm start        # production
```

Seed sample data (optional but recommended):
```bash
node seed.js
```

---

### 2. Frontend

```bash
cd skill-swap-frontend
npm install
npm start        # runs on http://localhost:3000
```

The frontend proxies `/api` requests to `http://localhost:5000` automatically.

---

## API Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/register` | ❌ | Register new user |
| POST | `/api/auth/login` | ❌ | Login, returns JWT |
| GET | `/api/auth/me` | ✅ | Get current user |
| GET | `/api/users` | ✅ | List users (search/filter) |
| GET | `/api/users/:id` | ✅ | Get user profile |
| PUT | `/api/users/profile` | ✅ | Update own profile |
| POST | `/api/users/connect/:id` | ✅ | Send connection request |
| POST | `/api/skills/offered` | ✅ | Add offered skill |
| POST | `/api/skills/wanted` | ✅ | Add wanted skill |
| DELETE | `/api/skills/offered/:skillId` | ✅ | Remove offered skill |
| DELETE | `/api/skills/wanted/:skillId` | ✅ | Remove wanted skill |
| GET | `/api/matches` | ✅ | Get skill-matched users |

---

## Sample Test Accounts (after seeding)

| Name | Email | Password |
|------|-------|----------|
| Alice Johnson | alice@example.com | password123 |
| Bob Martinez | bob@example.com | password123 |
| Carol Chen | carol@example.com | password123 |
| David Kim | david@example.com | password123 |
| Emma Wilson | emma@example.com | password123 |

> Use the "Fill demo credentials" button on the login page to auto-fill Alice's credentials.

---

## Features

- JWT authentication with protected routes
- Dark mode (persisted to localStorage)
- Smart skill matching algorithm (scored by overlap)
- Search & filter users by skill name, category, and level
- Add/remove skills with category and experience level tags
- Send connection requests
- Responsive layout (mobile, tablet, desktop)
- Toast notifications for all actions
- Loading states and empty states throughout
- Profile avatars via URL or DiceBear auto-generated
