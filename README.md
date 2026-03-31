# CRM System

Full-stack CRM application — React JS + Spring Boot + PostgreSQL.

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, React Router 6, TanStack Query, Zustand, Tailwind CSS |
| HTTP | Axios with JWT interceptor |
| Real-time | SockJS + STOMP WebSocket |
| Backend | Spring Boot 3.x, Spring Security, Spring Data JPA |
| Auth | JWT (jjwt 0.12) |
| Database | PostgreSQL 15+ |
| Migrations | Flyway |
| Build | Maven |

---

## Prerequisites

- Java 17+
- Node.js 18+
- PostgreSQL 15+
- Maven 3.8+

---

## Database Setup

```sql
CREATE DATABASE crm_db;
```

Flyway will run `V1__initial_schema.sql` automatically on first startup, creating all tables and seeding the default admin user.

**Default admin credentials:**
- Email: `admin@crm.com`
- Password: `Admin@123`

---

## Backend Setup

```bash
cd backend

# Update src/main/resources/application.properties if needed:
# spring.datasource.url=jdbc:postgresql://localhost:5432/crm_db
# spring.datasource.username=postgres
# spring.datasource.password=postgres
# jwt.secret=<your-256-bit-secret>
# file.upload-dir=/var/crm/uploads

# Create upload directory
mkdir -p /var/crm/uploads

# Run
mvn spring-boot:run
```

Backend starts on **http://localhost:8080**

---

## Frontend Setup

```bash
cd frontend
npm install
npm start
```

Frontend starts on **http://localhost:3000** and proxies API calls to port 8080.

---

## User Roles & Access

| Role | Home | Capabilities |
|---|---|---|
| **ADMIN** | `/admin` | Create teams/users, upload assignments, monitor all progress |
| **LEADER** | `/leader` | Delegate tasks, monitor team, manage support tokens, view EOD reports |
| **MEMBER** | `/member` | View tasks, update status, submit EOD reports, raise tokens, collaborate in workspaces |

---

## API Endpoints Reference

### Authentication
```
POST /api/v1/auth/login          – Login (returns JWT)
POST /api/v1/auth/register       – Create user (Admin only)
GET  /api/v1/auth/me             – Current user profile
```

### Teams & Users
```
GET    /api/v1/users                   – All users (Admin)
PATCH  /api/v1/users/{id}/role         – Change user role (Admin)
GET    /api/v1/teams                   – All teams (Admin)
POST   /api/v1/teams                   – Create team (Admin)
GET    /api/v1/teams/{id}/members      – Team members (Admin/Leader)
POST   /api/v1/teams/{id}/members      – Add member to team (Admin)
```

### Assignments & Tasks
```
POST   /api/v1/assignments             – Upload assignment (Admin, multipart)
GET    /api/v1/assignments?teamId=     – Team assignments (Leader/Admin)
POST   /api/v1/assignments/{id}/assign – Delegate to members (Leader)
GET    /api/v1/tasks/me                – My tasks (Member)
PATCH  /api/v1/tasks/{id}/status       – Update task status (Member)
GET    /api/v1/progress?teamId=        – Team progress (Leader/Admin)
```

### EOD Reports
```
POST   /api/v1/reports                 – Submit EOD report (Member, multipart)
GET    /api/v1/reports/me              – My reports (Member)
GET    /api/v1/reports?memberId=&date= – Filter reports (Leader/Admin)
```

### Support Tokens
```
POST   /api/v1/tokens                  – Raise token (Member)
GET    /api/v1/tokens?teamId=          – Team tokens (Leader)
GET    /api/v1/tokens/me               – My tokens (Member)
PATCH  /api/v1/tokens/{id}/status      – Update status (Leader)
POST   /api/v1/tokens/{id}/comments    – Add comment (Leader/Member)
GET    /api/v1/tokens/{id}/comments    – Get comments
```

### Workspaces & Chat
```
POST   /api/v1/workspaces              – Create workspace (Leader)
POST   /api/v1/workspaces/{id}/members – Add members (Leader)
GET    /api/v1/workspaces/me           – My workspaces (Member/Leader)
GET    /api/v1/workspaces/{id}         – Get workspace
PATCH  /api/v1/workspaces/{id}/notes   – Update shared notes
POST   /api/v1/workspaces/{id}/docs    – Upload document
GET    /api/v1/workspaces/{id}/docs    – List documents
GET    /api/v1/messages?workspaceId=   – Chat history
```

### WebSocket (STOMP)
```
Endpoint:   /ws  (SockJS)
Send chat:  /app/chat.send  { workspaceId, senderId, content }
Chat sub:   /topic/workspace/{workspaceId}
Token sub:  /topic/leader/{leaderId}/tokens
```

---

## Project Structure

```
crm-project/
├── backend/
│   ├── pom.xml
│   └── src/main/
│       ├── java/com/crm/
│       │   ├── CrmApplication.java
│       │   ├── auth/          – JWT, login, register
│       │   ├── user/          – User, Team entities + CRUD
│       │   ├── task/          – Assignment, TaskAssignment, EodReport
│       │   ├── token/         – SupportToken, TokenComment
│       │   ├── workspace/     – Workspace, Message, WorkspaceDoc
│       │   ├── chat/          – STOMP chat controller + service
│       │   └── config/        – Security, WebSocket, CORS, FileStorage
│       └── resources/
│           ├── application.properties
│           └── db/migration/V1__initial_schema.sql
└── frontend/
    ├── package.json
    ├── tailwind.config.js
    └── src/
        ├── App.jsx            – Router + role-guarded routes
        ├── index.js
        ├── index.css
        ├── context/           – AuthContext
        ├── services/          – API service modules
        ├── hooks/             – useWebSocket
        ├── components/
        │   ├── common/        – Badge, Modal, Spinner, EmptyState
        │   └── layout/        – AppLayout, Sidebar, ProtectedRoute
        └── pages/
            ├── LoginPage.jsx
            ├── admin/         – Dashboard, Teams, Users, Assignments, Progress
            ├── leader/        – Dashboard, Assignments, Progress, Tokens, EODReports
            └── member/        – Dashboard, Tasks, EODReport, Tokens, Workspaces, WorkspaceDetail
```

---

## Implementation Phases (per spec)

| Phase | Scope | Status |
|---|---|---|
| Phase 1 | Auth, Users, Teams, DB schema | ✅ |
| Phase 2 | Assignments, Task delegation, Progress | ✅ |
| Phase 3 | EOD Reports, Support Tokens, WebSocket push | ✅ |
| Phase 4 | Workspaces, Real-time STOMP chat, Shared docs | ✅ |

---

## Security Notes

- All passwords hashed with BCrypt
- JWT tokens expire after 8 hours (configurable)
- Role enforcement via Spring `@PreAuthorize` — never trusted from frontend
- File uploads validated; UUID filenames prevent path traversal
- HTTPS recommended in production (self-signed cert acceptable for dev)
- Change `jwt.secret` to a strong 256-bit key before production
