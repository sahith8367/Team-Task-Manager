export const statuses = ['To Do', 'In Progress', 'Done']

export const priorities = ['Low', 'Medium', 'High', 'Critical']

export const users = [
  {
    id: 'u-1',
    name: 'Aarav Sharma',
    email: 'aarav@taskflow.dev',
    role: 'Admin',
    avatar: 'AS',
  },
  {
    id: 'u-2',
    name: 'Maya Iyer',
    email: 'maya@taskflow.dev',
    role: 'Member',
    avatar: 'MI',
  },
  {
    id: 'u-3',
    name: 'Kabir Khan',
    email: 'kabir@taskflow.dev',
    role: 'Member',
    avatar: 'KK',
  },
  {
    id: 'u-4',
    name: 'Nila Patel',
    email: 'nila@taskflow.dev',
    role: 'Member',
    avatar: 'NP',
  },
]

export const projects = [
  {
    id: 'p-1',
    name: 'Railway Launch',
    description: 'Prepare the full-stack assignment for production deployment.',
    adminId: 'u-1',
    memberIds: ['u-1', 'u-2', 'u-3'],
    createdAt: '2026-05-01',
  },
  {
    id: 'p-2',
    name: 'Product Sprint',
    description: 'Weekly work board for feature design, QA, and documentation.',
    adminId: 'u-1',
    memberIds: ['u-1', 'u-2', 'u-4'],
    createdAt: '2026-05-03',
  },
]

export const tasks = [
  {
    id: 't-1',
    projectId: 'p-1',
    title: 'Build JWT authentication screens',
    description: 'Signup and login forms with validation states and token-ready flow.',
    dueDate: '2026-05-09',
    priority: 'High',
    status: 'In Progress',
    assigneeId: 'u-2',
    createdBy: 'u-1',
  },
  {
    id: 't-2',
    projectId: 'p-1',
    title: 'Create Railway deployment checklist',
    description: 'Document environment variables, build command, and API URL setup.',
    dueDate: '2026-05-05',
    priority: 'Critical',
    status: 'To Do',
    assigneeId: 'u-3',
    createdBy: 'u-1',
  },
  {
    id: 't-3',
    projectId: 'p-1',
    title: 'Design project member controls',
    description: 'Admins can add and remove team members from a project workspace.',
    dueDate: '2026-05-10',
    priority: 'Medium',
    status: 'Done',
    assigneeId: 'u-1',
    createdBy: 'u-1',
  },
  {
    id: 't-4',
    projectId: 'p-2',
    title: 'Prepare task analytics cards',
    description: 'Show total tasks, status counts, per-user load, and overdue items.',
    dueDate: '2026-05-11',
    priority: 'High',
    status: 'In Progress',
    assigneeId: 'u-4',
    createdBy: 'u-1',
  },
  {
    id: 't-5',
    projectId: 'p-2',
    title: 'QA role-based access states',
    description: 'Verify member view only exposes assigned tasks and status updates.',
    dueDate: '2026-05-06',
    priority: 'Medium',
    status: 'To Do',
    assigneeId: 'u-2',
    createdBy: 'u-1',
  },
]
