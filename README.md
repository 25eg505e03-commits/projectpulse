# PROJECTPULSE — Agile Project & Team Collaboration Suite

**PROJECTPULSE** is a full-stack, production-grade MERN (MongoDB, Express, React, Node.js) web application designed for software engineering and business teams to manage agile projects, sprints, backlog items, Kanban workflows, issues, milestones, file attachments, activities, notifications, and analytics.

---

## 🌟 Key Features

1. **Multi-Tenant Organization Management**:
   - Create and update organizations.
   - User invitation workflow (in-app portal).
   - Organization team management (Frontend, Backend, QA).

2. **Project-Scoped Role-Based Access Control (RBAC)**:
   - Dynamic permissions per project context.
   - Roles: **Organization Admin**, **Project Manager**, **Team Lead**, **Developer/Member**, **Stakeholder**.
   - Strict backend API authorization checking middleware.

3. **Agile Sprint & Backlog Planner**:
   - Backlog task prioritization and story point allocation.
   - Move tasks between backlog and planned iterations.
   - Start and complete sprints with automated return of unfinished tasks to backlog.

4. **Interactive Drag-and-Drop Kanban Board**:
   - Status columns: `TODO`, `IN PROGRESS`, `REVIEW`, `DONE`.
   - Powered by `@hello-pangea/dnd`.
   - Optimistic UI updates with instant REST API background synchronization and rollback protection.

5. **Issue & Defect Tracker**:
   - Severity tags: `low`, `medium`, `high`, `critical`.
   - Record reproduction steps, expected vs actual behavior, and resolution status history.

6. **Comment System & Automated @Mentions**:
   - Add comments on Tasks and Issues.
   - `@username` parsing triggers real-time in-app notifications.

7. **File Attachments (Multer)**:
   - Attachment uploads with 10MB limit and mime-type security validation.

8. **Visual Project Timeline & Gantt**:
   - Roadmap depicting start dates, target deadlines, milestones, and sprint durations.

9. **Team Workload & Recharts Reporting**:
   - Member task load and story point distribution.
   - Visual Recharts: Task status pie chart and priority breakdown bar chart.

---

## 🚀 Tech Stack

- **Frontend**: React.js, Vite, React Router DOM, Axios, Context API, Tailwind CSS, Lucide React Icons, `@hello-pangea/dnd`, Recharts.
- **Backend**: Node.js, Express.js, MongoDB, Mongoose, JWT, bcryptjs, cookie-parser, CORS, dotenv, Multer, Jest, Supertest.

---

## 📁 Folder Structure

```
projectpulse/
├── backend/
│   ├── config/ (db.js)
│   ├── controllers/ (authController, organizationController, invitationController, teamController, projectController, milestoneController, sprintController, taskController, issueController, commentController, labelController, attachmentController, activityController, notificationController, reportController)
│   ├── middleware/ (authMiddleware, roleMiddleware, errorMiddleware, uploadMiddleware)
│   ├── models/ (User, Organization, Invitation, Team, Project, Milestone, Sprint, Task, Issue, Comment, Label, Attachment, Activity, Notification)
│   ├── routes/ (authRoutes, organizationRoutes, invitationRoutes, teamRoutes, projectRoutes, milestoneRoutes, sprintRoutes, taskRoutes, issueRoutes, commentRoutes, labelRoutes, attachmentRoutes, activityRoutes, notificationRoutes, reportRoutes)
│   ├── utils/ (generateToken, permissions, activityLogger, notificationHelper)
│   ├── seed/ (seedData.js)
│   ├── tests/ (auth.test.js, project.test.js)
│   ├── uploads/
│   ├── server.js
│   ├── package.json
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── components/ (common, layout, kanban, comments)
│   │   ├── context/ (AuthContext, OrganizationContext, ProjectContext)
│   │   ├── pages/ (Login, Register, Dashboard, Organizations, OrgDetails, Teams, Projects, KanbanPage, BacklogPage, MilestonesPage, IssuesPage, TimelinePage, WorkloadPage, ReportsPage, ActivityPage, InvitationsPage, ProfilePage)
│   │   ├── services/ (api.js)
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── package.json
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── .env.example
└── README.md
```

---

## 🔑 Demo Credentials (TechNova Solutions)

All demo accounts use password: `password123`

| User Name | Role | Email |
| --- | --- | --- |
| **Rahul Sharma** | Organization Admin | `admin@technova.com` |
| **Anjali Verma** | Project Manager | `pm@technova.com` |
| **Vikram Patel** | Team Lead | `lead@technova.com` |
| **Siddharth Rao** | Developer | `dev1@technova.com` |
| **Priya Nair** | Developer | `dev2@technova.com` |
| **Amitabh Sen** | Stakeholder | `stakeholder@technova.com` |

---

## 🛠️ Installation & Setup

### 1. Backend Setup
```bash
cd backend
npm install
cp .env.example .env
npm run seed     # Populate database with TechNova Solutions demo data
npm run dev      # Start Express backend server on port 5000
```

### 2. Frontend Setup
```bash
cd frontend
npm install
cp .env.example .env
npm run dev      # Start Vite React frontend on port 5173
```

### 3. Run Automated Tests
```bash
cd backend
npm test         # Run Jest and Supertest test suites
```

---

## 🌐 Key API Endpoints Summary

- `POST /api/auth/register` - User Registration
- `POST /api/auth/login` - User Authentication
- `GET /api/auth/me` - Get Current User Profile
- `POST /api/organizations` - Create Organization
- `GET /api/projects` - Get User Projects
- `PATCH /api/tasks/:id/status` - Kanban Status Update (Drag-and-Drop)
- `PATCH /api/tasks/:id/sprint` - Assign Task to Sprint/Backlog
- `PATCH /api/sprints/:id/start` - Start Sprint
- `PATCH /api/sprints/:id/complete` - Complete Sprint & return incomplete items to Backlog
- `GET /api/reports/project/:projectId` - Recharts Reporting Aggregation
- `GET /api/reports/workload/:projectId` - Team Member Workload Matrix

---

## 🎓 Capstone Viva Explanation Guide

1. **Why MERN Stack?**: MongoDB's JSON document model cleanly represents nested task dependencies, comments, and member roles, while Node/Express provides high-throughput async I/O.
2. **Project-Scoped RBAC**: Permissions are evaluated based on the user's role within the *target project context* rather than a single static user role, allowing a user to be a Manager on Project A and a Developer on Project B.
3. **Optimistic UI in Kanban**: Dragging a task updates React component state immediately for zero latency user experience, while firing a REST API request in the background with rollback handling on error.
