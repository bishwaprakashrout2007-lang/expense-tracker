# FinanceFlow – SaaS Personal Expense Tracker Dashboard

FinanceFlow is a premium, SaaS-grade full-stack personal finance dashboard built using the MERN stack (**MongoDB**, **Express.js**, **React.js**, **Node.js**) styled with **Tailwind CSS**. It is fully responsive, supports interactive data visualizations with **Recharts**, exports financial reports to **PDF** and **Excel**, provides custom category-wise budget tracking with real-time warning indicators, and uses safe **JWT Authentication** and password hashing.

---

## 🚀 Key Features

*   **Premium Interactive Dashboard:** Minimalist, SaaS-like UI with dynamic widgets, financial summaries (Income, Expenses, Net Balance, Savings Rate), recent transactions list, and intelligent financial insights.
*   **Secure Auth System:** JWT-based protection, secure routes, login, registration, and BCrypt password encryption.
*   **Income & Expense Management:** Full CRUD operations with detailed categories, filter options, searches, date boundaries, and sortings.
*   **Category Budget Planning:** Establish monthly category budget limits with visual progress indicators and toast alert warning banners if limits are crossed.
*   **Interactive Visual Analytics:** Visualise cash flow charts (Pie charts for category breakdowns, Bar charts for monthly expense details, Area charts for income vs. expense trends).
*   **Report Generation & Export:** Export custom tables and monthly reports to **PDF** (custom layouts with `jsPDF`) and **Excel** (custom spreadsheets with `xlsx/SheetJS`).
*   **Profile Customization:** Edit account credentials and upload profile pictures encoded in Base64.
*   **Responsive Theme System:** Toggles dark and light mode layouts seamlessly with immediate system/localStorage syncing.

---

## 📁 Project Directory Structure

```text
FinanceFlow/
├── client/                 # React Frontend (Vite + Tailwind)
│   ├── public/             # Static files
│   ├── src/
│   │   ├── api/            # API client configuration
│   │   ├── components/     # UI widgets and layouts
│   │   ├── context/        # Theme & Auth React contexts
│   │   ├── pages/          # Auth, dashboard, tracking, reports, profile pages
│   │   ├── utils/          # Export and currency formats helpers
│   │   ├── App.jsx         # App router configurations
│   │   └── main.jsx        # Root entry point
│   ├── index.html          # Main HTML structure
│   ├── vite.config.js      # Vite build configuration
│   └── tailwind.config.js  # Tailwind theme definitions
│
└── server/                 # Express Backend API
    ├── config/             # DB settings
    ├── controllers/        # Express handlers
    ├── middleware/         # Auth checking & error mapping
    ├── models/             # Mongoose schemas
    ├── routes/             # Endpoints
    └── server.js           # Server bootstrap entry
```

---

## 🛠️ Quick Installation Guide

### Prerequisites
*   [Node.js](https://nodejs.org/) (v16+ recommended)
*   [MongoDB](https://www.mongodb.com/) (Local instance or MongoDB Atlas cluster)

### 1. Clone & Configure the Backend Server
1.  Navigate to the `/server` folder:
    ```bash
    cd server
    ```
2.  Install packages:
    ```bash
    npm install
    ```
3.  Duplicate `.env.example` to `.env` and configure credentials:
    ```env
    PORT=5000
    MONGO_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/financeflow
    JWT_SECRET=your_jwt_secret_key_here
    NODE_ENV=development
    ```
4.  Run Server:
    *   **Development mode** (reloads automatically using `nodemon`):
        ```bash
        npm run dev
        ```
    *   **Production start**:
        ```bash
        npm start
        ```

### 2. Configure the Frontend Client
1.  Navigate to the `/client` folder:
    ```bash
    cd ../client
    ```
2.  Install packages:
    ```bash
    npm install
    ```
3.  Configure variables (optional - default points to `http://localhost:5000/api`):
    Create a `.env` file inside `/client` folder if using custom endpoints:
    ```env
    VITE_API_URL=http://localhost:5000/api
    ```
4.  Launch Client Server:
    ```bash
    npm run dev
    ```
    Your dashboard should now be active at `http://localhost:3000`.

---

## 🗺️ API Documentation

### Authentication
*   `POST /api/auth/register` - Create account (returns token)
*   `POST /api/auth/login` - Verify account (returns token)
*   `GET /api/auth/profile` - Retrieve account credentials
*   `PUT /api/auth/profile` - Edit user credentials & avatar

### Incomes
*   `POST /api/income` - Record income stream
*   `GET /api/income` - Retrieve records (supports `search`, `category`, `startDate`, `endDate`, `sortBy`, `sortOrder` query options)
*   `PUT /api/income/:id` - Edit income record
*   `DELETE /api/income/:id` - Delete income record

### Expenses
*   `POST /api/expenses` - Record expense
*   `GET /api/expenses` - Retrieve records (supports query options)
*   `PUT /api/expenses/:id` - Edit expense record
*   `DELETE /api/expenses/:id` - Delete expense record

### Budgets
*   `POST /api/budgets` - Save monthly budget configuration (total budget + category-wise thresholds)
*   `GET /api/budgets/status/:month/:year` - Get category budget limits vs actual spending percentage

### Analytics
*   `GET /api/analytics/dashboard` - Get high-level stats, insights and recent logs
*   `GET /api/analytics/monthly` - Get aggregated past 6 months cash flow data
*   `GET /api/analytics/category-breakdown` - Get current month expense categories data
*   `GET /api/analytics/trends` - Get current year monthly cash flow details

---

## 🌐 Deployment Guidelines

### MongoDB Atlas Setup
1.  Sign in to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) and spin up a free tier Shared Cluster.
2.  Configure Database Access: Create a database user with password permissions.
3.  Configure Network Access: Whitelist your connection IP (or allow access from anywhere `0.0.0.0/0` if deploying to server environments like Render).
4.  Copy your Mongo Connection String (URI) and substitute database placeholders.

### Deploying to Render
Render can host both your Express backend and Vite frontend.

#### Express Backend Deployment
1.  Create a new **Web Service** on Render and hook it to your GitHub Repository.
2.  Set the **Root Directory** option to: `server`.
3.  Set the **Build Command** to: `npm install`.
4.  Set the **Start Command** to: `node server.js`.
5.  Set your environment variables under the **Environment** tab:
    *   `MONGO_URI`
    *   `JWT_SECRET`
    *   `NODE_ENV=production`

#### React Frontend Deployment
1.  Create a new **Static Site** on Render and hook it to your GitHub Repository.
2.  Set the **Root Directory** option to: `client`.
3.  Set the **Build Command** to: `npm run build`.
4.  Set the **Publish Directory** to: `dist`.
5.  Set the **Environment Variables** tab:
    *   `VITE_API_URL` -> URL of your deployed Express backend (e.g. `https://financeflow-api.onrender.com/api`).
