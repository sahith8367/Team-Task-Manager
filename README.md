TEAM TASK MANAGER

Project Name:
Team Task Manager

Project Description:
Team Task Manager is a full-stack web application where users can create and join projects, assign tasks, and track progress. It supports role-based access for Admin and Member users.

Features:
1. User signup and secure login.
2. Role-based login as Admin or Member.
3. Password hashing and token-based authentication.
4. Admin can create projects.
5. Admin can add and remove project members.
6. Admin can create, assign, update, and delete tasks.
7. Member can view only admin-allocated projects.
8. Member can view and update only assigned tasks.
9. Task statuses: To Do, In Progress, Done.
10. Task priority: Low, Medium, High, Critical.
11. Dashboard showing total tasks, tasks by status, tasks per user, and overdue tasks.
12. REST APIs with backend validation.
13. JSON file database with Users, Projects, and Tasks relationships.
14. Railway deployment support.

Demo Login Details:

Admin Login:
Email: admin@taskmanager.dev
Password: admin123
Role: Admin

Member Login:
Email: member@taskmanager.dev
Password: member123
Role: Member

Tech Stack:
Frontend: React, Vite, CSS
Backend: Node.js REST API
Database: JSON file database
Authentication: Token-based authentication with hashed passwords
Deployment: Railway

Setup Steps:

1. Clone the GitHub repository:
git clone YOUR_GITHUB_REPO_URL

2. Open the project folder:
cd team-task-manager

3. Install dependencies:
npm install

4. Start the backend server:
npm run server

5. Start the frontend development server in another terminal:
npm run dev

6. Open the app:
http://localhost:5173

Production Build Steps:

1. Build the frontend:
npm run build

2. Start the production server:
npm start

The production server serves both the frontend and backend APIs.

Railway Deployment Steps:

1. Push the project to GitHub.
2. Open Railway.
3. Create a new project.
4. Select Deploy from GitHub Repository.
5. Choose the Team Task Manager repository.
6. Add environment variable:
JWT_SECRET=your_secure_secret_key

7. Railway will install dependencies, build the project, and start the server.
8. Generate a public Railway domain from the Networking section.
9. Open the live Railway URL and test Admin and Member login.

Environment Variables:

JWT_SECRET=your_secure_secret_key
PORT=4000

Live Application URL:
PASTE_YOUR_RAILWAY_LIVE_URL_HERE

GitHub Repository URL:
PASTE_YOUR_GITHUB_REPOSITORY_URL_HERE

API Routes:

POST /api/auth/signup
POST /api/auth/login
GET /api/me
GET /api/users
GET /api/projects
POST /api/projects
POST /api/projects/:projectId/members
DELETE /api/projects/:projectId/members/:userId
GET /api/projects/:projectId/tasks
POST /api/projects/:projectId/tasks
PUT /api/tasks/:taskId
DELETE /api/tasks/:taskId

Role-Based Access:

Admin:
Admin can create projects, manage members, create tasks, assign tasks, update tasks, delete tasks, and view dashboard details.

Member:
Member can view only allocated projects and assigned tasks. Member can update the status of assigned tasks only.
