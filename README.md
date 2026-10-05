# 🥗 Calorie Tracker Backend API

A high-performance, AI-powered Nutrition & Calorie Tracking REST API built with **Node.js**, **Express**, **TypeScript**, **MongoDB**, **OpenAI / OpenRouter**, and **Cloudflare R2**.

---

## 🚀 Features

- **🔐 Authentication & User Management**
  - Secure signup and login with JWT and `bcryptjs` password hashing.
  - User profile management and customizable daily calorie goals.

- **🤖 AI Food Recognition (Vision API)**
  - Food image upload, compression, and optimization via `Sharp`.
  - Cloud storage integration with **Cloudflare R2** (S3-compatible).
  - Automated food identification and macro estimation (calories, protein, carbs, fat, meal type) powered by **OpenAI GPT-4o-mini** via OpenRouter.
  - Structured output validation with `Zod`.

- **📊 Comprehensive Analytics & Reports**
  - **Daily Report**: Meal breakdown (breakfast, lunch, dinner, snack), macro distribution, and goal completion percentage.
  - **Weekly Report**: 7-day historical tracker, daily averages, macro splits, and streak/consistency insights.
  - **Monthly Report**: Day-by-day aggregate trends, highest calorie day, total entries, and days tracked.
  - Optimized real-time stats powered by **MongoDB Aggregation Pipelines** (`$facet`, `$group`, `$sort`).

---

## 🛠️ Tech Stack

- **Runtime & Framework**: Node.js, Express.js (v5), TypeScript
- **Database**: MongoDB with Mongoose ODM
- **AI / Vision**: OpenAI GPT-4o-mini (via OpenRouter), Zod validation
- **Image Processing & Storage**: Sharp, Multer, Cloudflare R2 (@aws-sdk/client-s3)
- **Security**: JSON Web Tokens (JWT), Bcrypt.js, CORS

---

## 📁 Project Structure

```text
backend/
├── config/
│   ├── db.ts            # MongoDB connection
│   ├── env.ts           # Environment configuration
│   └── r2.ts            # Cloudflare R2 S3 client configuration
├── controllers/
│   ├── auth.ts          # Authentication controller (register, login, getMe)
│   ├── foodController.ts# Food scanning, image upload & food logging
│   └── reportController.ts # Daily, weekly, and monthly reports
├── middlewares/
│   ├── auth.ts          # JWT authentication guard
│   └── upload.ts        # Multer memory storage file upload
├── models/
│   ├── FoodEntry.ts     # Food log schema & indices
│   └── User.ts          # User schema & password hashing methods
├── routes/
│   ├── auth.ts          # /api/auth routes
│   ├── food.ts          # /api/food routes
│   └── reports.ts       # /api/reports routes
├── services/
│   ├── colories.ts      # MongoDB aggregation services for metrics
│   └── openai.ts        # OpenRouter/OpenAI Vision analysis service
├── server.ts            # Express application entry point
├── package.json
└── tsconfig.json
```

---

## ⚙️ Environment Variables

Create a `.env` file in the `backend` directory:

```env
PORT=9997
MONGO_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/calorie-tracker?retryWrites=true&w=majority
JWT_SECRET=your_jwt_secret_key_here

# OpenRouter / OpenAI
OPENROUTER_API_KEY=your_openrouter_api_key_here

# Cloudflare R2 Storage
R2_ACCOUNT_ID=your_cloudflare_account_id
R2_ACCESS_KEY_ID=your_r2_access_key_id
R2_SECRET_ACCESS_KEY=your_r2_secret_access_key
R2_BUCKET_NAME=your_bucket_name
R2_PUBLIC_URL=https://pub-<id>.r2.dev
```

---

## 📦 Installation & Setup

1. **Clone the repository:**
   ```bash
   git clone https://github.com/abdirahmanliiban79-arch/calorie-tracker.git
   cd calorie-tracker/backend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Run in development mode:**
   ```bash
   npm run dev
   ```

4. **Build for production:**
   ```bash
   npm run build
   npm start
   ```

---

## 🔌 API Endpoints

### 1. Authentication (`/api/auth`)

| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :---: |
| `POST` | `/api/auth/register` | Register a new user | No |
| `POST` | `/api/auth/login` | Log in existing user | No |
| `GET` | `/api/auth/me` | Fetch authenticated user profile | Yes |

### 2. Food Management & AI Vision (`/api/food`)

| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :---: |
| `POST` | `/api/food/scan` | Upload food photo, optimize, upload to R2, and analyze via AI | Yes (Multipart) |
| `POST` | `/api/food/analyze` | Analyze uploaded food image without saving immediately | Yes (Multipart) |
| `POST` | `/api/food/save` | Confirm and save analyzed food entry | Yes |
| `DELETE`| `/api/food/discard` | Discard food entry and delete uploaded image from R2 | Yes |

### 3. Analytics & Reports (`/api/reports`)

| Method | Endpoint | Query Params | Description | Auth Required |
| :--- | :--- | :--- | :--- | :---: |
| `GET` | `/api/reports/daily` | `?date=YYYY-MM-DD` | Daily meal breakdown, total macros, and goal completion | Yes |
| `GET` | `/api/reports/weekly` | — | Last 7 days summary, daily stats array, and weekly averages | Yes |
| `GET` | `/api/reports/monthly`| `?year=YYYY&month=M` | Monthly day-by-day stats, days tracked, and highest calorie day | Yes |

---

## 🧪 Sample Responses

### Monthly Report (`GET /api/reports/monthly?year=2026&month=10`)
```json
{
  "success": true,
  "year": 2026,
  "month": 10,
  "daysInMonth": 31,
  "daysTracked": 5,
  "dailySummary": [
    {
      "day": 1,
      "date": "2026-10-01",
      "calories": 2150,
      "protein": 140,
      "carbs": 220,
      "fat": 65,
      "entriesCount": 3,
      "goal": 2000,
      "percentComplete": 108
    }
  ],
  "totalCalories": 10750,
  "totalProtein": 700,
  "totalCarbs": 1100,
  "totalFat": 325,
  "avgCalories": 2150,
  "highestDay": 2400,
  "macros": {
    "protein": { "grams": 700, "calories": 2800, "percentage": 27 },
    "carbs": { "grams": 1100, "calories": 4400, "percentage": 43 },
    "fat": { "grams": 325, "calories": 2925, "percentage": 30 }
  },
  "goal": 2000
}
```

---

## 📄 License

This project is licensed under the [ISC License](LICENSE).
