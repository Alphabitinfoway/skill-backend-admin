# Alphabit Skill Backend & Admin Panel

A comprehensive full-stack solution featuring a Node.js/Express RESTful API backend and a React/Vite Admin Dashboard for managing blogs, meetings, demo class inquiries, seminar events, and seminar registrations for **Alphabit Skill Studio**.

---

## 📌 Project Overview

This repository is split into two primary components:
1. **Backend API (`alphabit-skill-backend`)**: A robust REST API built with Node.js, Express, and MongoDB. It handles authentication, data persistence, email notifications via Nodemailer, media uploads via Cloudinary, and optional Google Sheets integration for lead collection.
2. **Admin Panel (`admin-panel`)**: A responsive single-page application built with React 19 and Vite. It offers an intuitive dashboard for managing platform content, tracking registrations, activating active seminars, and exporting student registration data to CSV.

---

## 🛠️ Tech Stack

### **Backend (`src/`)**
- **Runtime**: Node.js
- **Framework**: Express.js (v5)
- **Database**: MongoDB with Mongoose ORM
- **Authentication**: JSON Web Tokens (JWT) & bcryptjs
- **File & Media Storage**: Cloudinary with Multer
- **Email Service**: Nodemailer
- **External Integrations**: Google Sheets API (via `googleapis`)
- **Security & Utilities**: `cors`, `express-rate-limit`, `express-validator`

### **Frontend (`admin-panel/`)**
- **Framework / Build Tool**: React 19 + Vite
- **Routing**: React Router DOM (v7)
- **HTTP Client**: Axios (with Request Interceptors for JWT authentication)
- **UI Components & Icons**: Lucide React Icons & Custom CSS Styling
- **Linter**: Oxlint

---

## 📂 Project Structure

```
Alphabit-skill-backend/
├── admin-panel/                  # React + Vite Admin Dashboard
│   ├── public/                   # Static public assets
│   ├── src/
│   │   ├── api/                  # Axios configuration & interceptors
│   │   ├── components/           # Reusable UI components (Layout, Header, Sidebar, etc.)
│   │   ├── contexts/             # React contexts (e.g. AuthContext)
│   │   ├── pages/                # Admin views (Dashboard, Blogs, Meetings, Seminars)
│   │   ├── App.jsx               # Route declarations
│   │   └── main.jsx              # React entry point
│   ├── package.json
│   └── vite.config.js
│
├── src/                          # Express API Source Code
│   ├── config/                   # MongoDB & Cloudinary configuration
│   ├── controllers/              # Route controllers logic
│   ├── middleware/               # Auth, Upload, Error Handling, Rate Limiting
│   ├── models/                   # Mongoose schemas (User, Blog, Meeting, SeminarEvent, SeminarRegistration)
│   ├── routes/                   # API route endpoints (Public & Protected Admin routes)
│   ├── services/                 # Business logic services (Inquiry, Email, User services)
│   ├── utils/                    # Utility functions (Email sending, CSV generation, etc.)
│   ├── validators/               # Input validation rules (Express Validator)
│   ├── app.js                    # Express app setup & middleware wiring
│   └── server.js                 # HTTP server initialization & DB connection
│
├── .env                          # Backend environment variables (git-ignored)
├── package.json                  # Backend dependencies & scripts
└── postman_apis.txt              # API Documentation reference for Postman
```

---

## 🔑 Environment Variables Configuration

Create a `.env` file in the root directory of the project and configure the following variables:

```env
# Server & DB Settings
PORT=5000
MONGODB_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/alphabit-skill?retryWrites=true&w=majority

# JWT Authentication
JWT_SECRET=your_super_secret_jwt_key

# Cloudinary Setup (For image uploads)
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

# SMTP Email Configuration (Nodemailer)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_email_app_password
FROM_NAME=Alphabit Skill Studio
FROM_EMAIL=your_email@gmail.com
ADMIN_EMAIL=admin@example.com

# Google Sheets Integration (Demo Inquiries)
USE_MOCK_SHEETS=false
GOOGLE_SHEET_CLIENT_EMAIL=your_service_account@project.iam.gserviceaccount.com
GOOGLE_SHEET_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
GOOGLE_SHEET_SPREADSHEET_ID=your_google_spreadsheet_id
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18.x or higher)
- npm (v9.x or higher)
- MongoDB instance (Local or MongoDB Atlas)

### 1. Clone the Repository
```bash
git clone <repository-url>
cd Alphabit-skill-backend
```

### 2. Setup & Run Backend API
```bash
# Install backend dependencies
npm install

# Start development server with Nodemailer/Nodemon reloading
npm run dev
```
The API backend will start at `http://localhost:5000`.

### 3. Setup & Run Admin Panel
```bash
# Navigate to admin-panel folder
cd admin-panel

# Install frontend dependencies
npm install

# Start Vite development server
npm run dev
```
The Admin Panel web app will run locally (typically at `http://localhost:5173`).

---

## 📡 API Endpoints Overview

The backend mounts all routes under `/api`. Below is a summary of available endpoints:

| Domain | Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- | :--- |
| **Health Check** | `GET` | `/api/health` | Service health status | No |
| **Auth** | `POST` | `/api/users/register` | Register a new user | No |
| **Auth** | `POST` | `/api/users/login` | Authenticate user & get JWT token | No |
| **Blogs** | `GET` | `/api/blogs` | Get all public blogs | No |
| **Blogs** | `GET` | `/api/blogs/:slug` | Get single blog by slug | No |
| **Blogs (Admin)** | `GET` | `/api/admin/blogs` | List all blogs for admin | Yes |
| **Blogs (Admin)** | `POST` | `/api/admin/blogs` | Create a new blog post | Yes |
| **Blogs (Admin)** | `PUT` | `/api/admin/blogs/:id` | Update an existing blog | Yes |
| **Blogs (Admin)** | `DELETE` | `/api/admin/blogs/:id` | Delete a blog post | Yes |
| **Inquiries** | `POST` | `/api/inquiries` | Submit demo class inquiry (Google Sheets) | No |
| **Meetings** | `GET` | `/api/meetings` | List all meetings | No |
| **Meetings (Admin)**| `POST` | `/api/admin/meetings` | Create meeting entry | Yes |
| **Meetings (Admin)**| `DELETE` | `/api/admin/meetings/:id` | Delete meeting entry | Yes |
| **Seminars** | `GET` | `/api/seminars/current` | Get current active seminar event | No |
| **Seminars** | `POST` | `/api/seminars/register` | Register for current seminar | No |
| **Seminars (Admin)**| `GET` | `/api/admin/seminars` | List seminar registrations (with filters & search) | Yes |
| **Seminars (Admin)**| `PUT` | `/api/admin/seminars/:id` | Update registration status | Yes |
| **Seminars (Admin)**| `GET` | `/api/admin/seminars/export`| Export seminar registrations to CSV | Yes |
| **Seminars (Admin)**| `GET` | `/api/admin/seminars/stats` | Get seminar registration statistics | Yes |
| **Events (Admin)** | `POST` | `/api/admin/seminar-events`| Create a new seminar event | Yes |
| **Events (Admin)** | `PATCH`| `/api/admin/seminar-events/:id/activate` | Activate a seminar event | Yes |

*For complete payload and header details, refer to [`postman_apis.txt`](./postman_apis.txt).*

---

## 📜 Available Scripts

### **Backend Scripts**
- `npm run dev`: Runs the backend in development mode with `nodemon`.
- `npm start`: Runs the production server (`node src/server.js`).

### **Admin Panel Scripts**
- `npm run dev`: Launches Vite dev server with HMR.
- `npm run build`: Bundles the React application for production into `dist/`.
- `npm run lint`: Lints the code using `oxlint`.
- `npm run preview`: Locally previews the production build.

---

## 📄 License

This project is licensed under the ISC License.
