# Team Task Manager

Full-stack Team Task Management Web Application built with React, Vite, and a Node.js REST API.

## Features

- Signup and secure login with role selection: `Admin` or `Member`
- Password hashing with Node `crypto`
- Token-based authentication
- Admin verified users can create projects
- Admins can add/remove project members
- Admins can create, assign, update, and delete tasks
- Members can view only admin-allocated projects
- Members can update only their assigned task status
- Dashboard with total tasks, tasks by status, tasks per user, and overdue tasks
- RESTful backend with JSON file database
- Railway-ready `start` script and environment variables

## Demo Accounts

Admin:

```txt
Email: admin@taskmanager.dev
Password: admin123
Role: Admin
```

Member:

```txt
Email: member@taskmanager.dev
Password: member123
Role: Member
```

## Folder Structure

```txt
server/
  server.js              REST API and static frontend server
  data/
    seed.js              Initial demo users, projects, tasks
    database.json        Created automatically at first server start
  utils/
    auth.js              Password hashing and token helpers
    database.js          JSON database read/write helpers

src/
  components/            Frontend UI modules
  services/api.js        Frontend API client
  data/mockData.js       Shared task status and priority options
  utils/metrics.js       Dashboard calculations
  App.jsx                Authenticated app shell and role logic
  App.css                Main styling
```

## Local Setup

Install dependencies:

```bash
npm install
```

Start backend:

```bash
npm run server
```

Start frontend in another terminal:

```bash
npm run dev
```

Open:

```txt
http://localhost:5173
```

## Production Build

```bash
npm run build
npm start
```

The backend serves the built frontend from `dist` and exposes API routes under `/api`.

## Environment Variables

Copy `.env.example` and configure these values:

```txt
VITE_API_URL=http://localhost:4000/api
PORT=4000
JWT_SECRET=change-this-before-deploying
CLIENT_ORIGIN=http://localhost:5173
```

For Railway, set:

```txt
JWT_SECRET=<strong-secret>
CLIENT_ORIGIN=<your-public-frontend-url>
```

If deploying frontend and backend as one Railway service, leave `VITE_API_URL` unset before build so the frontend uses `/api`.

## Railway Deployment

1. Push this project to GitHub.
2. Create a new Railway project from the GitHub repository.
3. Add environment variable `JWT_SECRET`.
4. Railway will run:

```bash
npm install
npm run build
npm start
```

5. Open the generated Railway public URL.

## API Overview

- `POST /api/auth/signup`
- `POST /api/auth/login`
- `GET /api/me`
- `GET /api/users`
- `GET /api/projects`
- `POST /api/projects`
- `POST /api/projects/:projectId/members`
- `DELETE /api/projects/:projectId/members/:userId`
- `GET /api/projects/:projectId/tasks`
- `POST /api/projects/:projectId/tasks`
- `PUT /api/tasks/:taskId`
- `DELETE /api/tasks/:taskId`
