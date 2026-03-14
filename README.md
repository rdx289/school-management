# 🎓 EduSync — School Management System

A **full-stack School Management System** built with React, Node.js/Express, and MySQL. Features a modern dark UI, JWT authentication, role-based access control, and comprehensive modules for managing every aspect of a school.

---

## 🚀 Quick Start

### Prerequisites
- Node.js v18+
- MySQL 8.0+
- npm or yarn

---

### 1. Database Setup

```bash
# Login to MySQL
mysql -u root -p

# Run the schema (creates DB + tables + seed data)
mysql -u root -p < backend/config/schema.sql
```

---

### 2. Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Copy and configure environment
cp .env.example .env
```

Edit `.env`:
```env
PORT=5000
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password_here
DB_NAME=school_management
JWT_SECRET=change_this_to_a_long_random_secret
JWT_EXPIRES_IN=7d
```

```bash
# Start backend (development)
npm run dev

# OR production
npm start
```

Backend runs at: **http://localhost:5000**

---

### 3. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm start
```

Frontend runs at: **http://localhost:3000**

---

## 🔑 Demo Login Credentials

| Role    | Email                | Password   |
|---------|----------------------|------------|
| Admin   | admin@school.edu     | password   |
| Teacher | john@school.edu      | password   |
| Student | alice@student.edu    | password   |

> New teachers get default password: `Teacher@123`

---

## 📁 Project Structure

```
school-management/
│
├── backend/
│   ├── config/
│   │   ├── database.js          # MySQL connection pool (mysql2)
│   │   └── schema.sql           # Complete DB schema + seed data
│   │
│   ├── controllers/
│   │   ├── authController.js    # JWT login / me / change-password
│   │   ├── studentController.js # CRUD + photo upload + user account creation
│   │   ├── teacherController.js # CRUD + auto user account
│   │   ├── attendanceController.js  # Mark bulk + history + summary
│   │   ├── feesController.js    # Collect + stats + receipt number
│   │   ├── examController.js    # Schedule + auto-grade engine (A+→F)
│   │   ├── noticeController.js  # Post + audience filtering
│   │   └── dashboardController.js   # Parallel analytics queries
│   │
│   ├── middleware/
│   │   └── auth.js              # JWT verify + RBAC middleware
│   │
│   ├── routes/
│   │   ├── auth.js
│   │   ├── students.js          # Multer file upload configured
│   │   ├── teachers.js
│   │   ├── classes.js           # Also serves /subjects
│   │   ├── attendance.js
│   │   ├── fees.js
│   │   ├── exams.js             # Results endpoint included
│   │   ├── notices.js
│   │   └── dashboard.js
│   │
│   ├── uploads/                 # Auto-created on startup
│   │   ├── students/
│   │   └── teachers/
│   │
│   ├── server.js                # Express app entry point
│   └── .env.example
│
└── frontend/
    ├── public/
    │   └── index.html           # Sora + JetBrains Mono fonts loaded
    │
    └── src/
        ├── context/
        │   └── AuthContext.js   # Global auth state (login/logout/role helpers)
        │
        ├── services/
        │   └── api.js           # Axios instance + all API helpers + interceptors
        │
        ├── components/
        │   ├── Sidebar.js       # Role-aware navigation
        │   ├── Header.js        # Sticky header with user chip
        │   └── Toast.js         # Notification system (success/error/warning)
        │
        ├── pages/
        │   ├── Login.js         # Demo quick-fill + animated background
        │   ├── Dashboard.js     # Area chart, bar chart, pie chart (Recharts)
        │   ├── Students.js      # Full CRUD: table + search + modals + pagination
        │   ├── Teachers.js      # Full CRUD with photo upload
        │   ├── Classes.js       # Card grid with capacity bar
        │   ├── Attendance.js    # Mark tab + history tab
        │   ├── Exams.js         # Schedule exams
        │   ├── Fees.js          # Collect + receipt modal + fee stats
        │   ├── Notices.js       # Card board with priority colors
        │   └── Reports.js       # Charts + CSV export
        │
        ├── App.js               # Router + ProtectedRoute + AppLayout
        ├── index.js
        └── index.css            # Complete dark design system (CSS variables)
```

---

## 🗄️ Database Schema

| Table              | Description                              |
|--------------------|------------------------------------------|
| `users`            | Auth accounts for all roles              |
| `students`         | Student profiles + parent details        |
| `teachers`         | Teacher profiles                         |
| `classes`          | Grade/section definitions                |
| `subjects`         | Subject catalog                          |
| `class_teachers`   | Teacher ↔ class assignments              |
| `attendance`       | Daily student attendance records         |
| `teacher_attendance` | Teacher attendance                     |
| `exams`            | Scheduled exams                          |
| `results`          | Exam results + auto-grade                |
| `fee_structure`    | Fee templates per class                  |
| `fees`             | Payment records + receipts               |
| `timetable`        | Weekly class schedules                   |
| `notices`          | Announcements with priority & audience   |

---

## 🔌 REST API Reference

### Auth
| Method | Endpoint                | Access    | Description          |
|--------|-------------------------|-----------|----------------------|
| POST   | /api/auth/login         | Public    | Login, returns JWT   |
| GET    | /api/auth/me            | Any       | Current user         |
| PUT    | /api/auth/change-password | Any     | Change password      |

### Students
| Method | Endpoint           | Access       |
|--------|--------------------|--------------|
| GET    | /api/students      | Any          |
| GET    | /api/students/:id  | Any          |
| POST   | /api/students      | Admin        |
| PUT    | /api/students/:id  | Admin        |
| DELETE | /api/students/:id  | Admin        |

### Teachers
| Method | Endpoint           | Access  |
|--------|--------------------|---------|
| GET    | /api/teachers      | Any     |
| POST   | /api/teachers      | Admin   |
| PUT    | /api/teachers/:id  | Admin   |
| DELETE | /api/teachers/:id  | Admin   |

### Attendance
| Method | Endpoint                 | Access         |
|--------|--------------------------|----------------|
| GET    | /api/attendance          | Any            |
| POST   | /api/attendance          | Admin/Teacher  |
| GET    | /api/attendance/summary  | Any            |

### Fees
| Method | Endpoint       | Access |
|--------|----------------|--------|
| GET    | /api/fees      | Any    |
| POST   | /api/fees      | Admin  |
| GET    | /api/fees/stats | Any   |

### Exams & Results
| Method | Endpoint            | Access         |
|--------|---------------------|----------------|
| GET    | /api/exams          | Any            |
| POST   | /api/exams          | Admin/Teacher  |
| GET    | /api/exams/results  | Any            |
| POST   | /api/exams/results  | Admin/Teacher  |

### Notices
| Method | Endpoint          | Access |
|--------|-------------------|--------|
| GET    | /api/notices      | Any    |
| POST   | /api/notices      | Admin  |
| DELETE | /api/notices/:id  | Admin  |

### Dashboard
| Method | Endpoint             | Access |
|--------|----------------------|--------|
| GET    | /api/dashboard/stats | Admin  |

---

## ✨ Features

### Authentication
- JWT-based login (7-day expiry)
- Role-based access: Admin / Teacher / Student
- Auto-redirect on expired token
- Protected routes in React

### Student Management
- Full CRUD with soft delete
- Photo upload (Multer)
- Auto-generated Student IDs (e.g. STU-240001)
- Optional login account creation
- Search, filter by class/gender, pagination

### Teacher Management
- Full CRUD
- Auto-generated Teacher IDs (e.g. TCH-001)
- Auto-creates login account (default: Teacher@123)
- Photo upload

### Attendance
- Bulk mark for whole class
- Mark-all shortcuts (present/absent/late/excused)
- History view with filters
- Monthly summary stats

### Exams & Results
- Schedule exams with type/subject/class/date
- Auto-grading engine: A+ (≥90%), A (≥80%), B+ (≥70%), B (≥60%), C (≥50%), D (≥35%), F
- Pass/fail detection

### Fees
- Flexible fee types (Tuition, Exam, Library, etc.)
- Discount + fine support
- Auto receipt number generation
- Printable receipt modal
- Fee statistics dashboard

### Reports
- Overview charts (Bar, Pie, Area)
- Students, Fees, Attendance tabs
- CSV export for all reports
- Filter by class, month, year

### Notice Board
- Priority levels (Low/Normal/High/Urgent)
- Audience targeting (All/Students/Teachers/Parents)
- Expiry date support
- Card-based UI with priority color bars

---

## 🎨 Design System

- **Palette**: Deep navy `#0d0f1a` background, `#6378ff` primary, `#00d4aa` secondary
- **Typography**: Sora (headings) + JetBrains Mono (code/IDs)
- **Components**: Cards, badges, modals, toasts, tables, pagination — all custom
- **Animations**: fadeIn, slideUp, shimmer skeleton loader, spin
- **Responsive**: CSS Grid adapts to tablet and mobile

---

## 🛠️ Tech Stack

| Layer     | Technology                                |
|-----------|-------------------------------------------|
| Frontend  | React 18, React Router v6, Recharts       |
| Backend   | Node.js, Express 4                        |
| Database  | MySQL 8 with mysql2 (connection pool)     |
| Auth      | JSON Web Tokens (jsonwebtoken + bcryptjs) |
| File Upload | Multer                                  |
| HTTP      | Axios (with interceptors)                 |
| Styles    | Custom CSS (no UI framework dependencies) |

---

## 📝 Environment Variables

```env
# Backend .env
PORT=5000
NODE_ENV=development

DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=school_management

JWT_SECRET=your_secret_key_min_32_chars
JWT_EXPIRES_IN=7d

FRONTEND_URL=http://localhost:3000
```

---

## 🔒 Security Features

- Passwords hashed with bcrypt (cost factor 10)
- JWT tokens with expiry
- Role-based middleware on every protected endpoint
- Soft delete (data preserved, just hidden)
- SQL injection prevention via parameterized queries (mysql2)
- CORS configured for specific origin
- File upload size limited to 5MB

---

## 📈 Extending the System

- **Timetable**: Schema already has `timetable` table — add routes/UI
- **SMS/Email alerts**: Hook into fee due dates or exam schedules
- **Parent portal**: Add `parent` role in users table
- **PDF export**: Use `pdfkit` or `puppeteer` in a new `/api/reports/pdf` endpoint
- **Real-time**: Add Socket.io for live attendance notifications
# school-management
