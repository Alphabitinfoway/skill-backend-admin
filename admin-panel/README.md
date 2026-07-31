# Alphabit Skill Admin Panel

The **Admin Panel** is a web dashboard built with **React 19** and **Vite** for **Alphabit Skill Studio**. It provides administrative tools to manage blog posts, meeting logs, seminar events, and student seminar registrations.

---

## 🛠️ Tech Stack & Features

- **React 19 & Vite**: Ultra-fast hot module replacement (HMR) and optimized build pipeline.
- **React Router DOM (v7)**: Seamless SPA routing with protected admin layouts.
- **Axios**: API integration with global HTTP request interceptors for handling JWT tokens.
- **Lucide Icons**: Clean, modern UI icons.
- **Custom CSS Design**: Tailored responsive interface with dark/light themes and intuitive data tables.

---

## 📂 Key Sections

1. **Dashboard Overview**: Summary statistics for blog posts, meetings, and active seminar registrations.
2. **Blogs Management**: Create, view, edit, and delete blogs with image uploads.
3. **Meetings Management**: Log internal/external meetings and upload session visual highlights.
4. **Seminar Events**: Create, edit, and activate seminar events (auto-calculates seat availability).
5. **Seminar Registrations**: Search, filter by batch/status, update registration status (registered/attended/cancelled), and export lists directly to CSV.

---

## 🚀 Quick Start

### Installation

```bash
# Navigate to admin-panel directory
cd admin-panel

# Install dependencies
npm install
```

### Running Locally

```bash
npm run dev
```

The app will be accessible at `http://localhost:5173`.

### Production Build

```bash
# Build production bundle
npm run build

# Preview production build locally
npm run preview
```

### Code Linting

```bash
npm run lint
```
