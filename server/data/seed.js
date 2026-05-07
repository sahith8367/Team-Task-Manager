export const seedUsers = [
  {
    id: 'u-admin',
    name: 'Admin User',
    email: 'admin@taskmanager.dev',
    role: 'Admin',
  },
  {
    id: 'u-member',
    name: 'Member User',
    email: 'member@taskmanager.dev',
    role: 'Member',
  },
]

export const seedProjects = [
  {
    id: 'p-demo',
    name: 'Assignment Launch',
    description: 'Full-stack team task manager project for deployment.',
    adminId: 'u-admin',
    memberIds: ['u-admin', 'u-member'],
    createdAt: '2026-05-07',
  },
]

export const seedTasks = [
  {
    id: 't-auth',
    projectId: 'p-demo',
    title: 'Connect authentication to backend',
    description: 'Use signup, login, hashed passwords, and token based access.',
    dueDate: '2026-05-09',
    priority: 'High',
    status: 'In Progress',
    assigneeId: 'u-admin',
    createdBy: 'u-admin',
  },
  {
    id: 't-member',
    projectId: 'p-demo',
    title: 'Verify member task workflow',
    description: 'Members can view assigned projects and update their assigned tasks only.',
    dueDate: '2026-05-10',
    priority: 'Medium',
    status: 'To Do',
    assigneeId: 'u-member',
    createdBy: 'u-admin',
  },
]
