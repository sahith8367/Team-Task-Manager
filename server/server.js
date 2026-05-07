import http from 'node:http'
import { randomUUID } from 'node:crypto'
import { readFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { hashPassword, signToken, verifyPassword, verifyToken } from './utils/auth.js'
import { publicUser, readDatabase, writeDatabase } from './utils/database.js'

const PORT = process.env.PORT || 4000
const __dirname = path.dirname(fileURLToPath(import.meta.url))
const clientDist = path.join(__dirname, '..', 'dist')
const statuses = ['To Do', 'In Progress', 'Done']
const priorities = ['Low', 'Medium', 'High', 'Critical']

function sendJson(response, status, data) {
  response.writeHead(status, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': process.env.CLIENT_ORIGIN || '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS',
  })
  response.end(JSON.stringify(data))
}

function parseBody(request) {
  return new Promise((resolve, reject) => {
    let body = ''
    request.on('data', (chunk) => {
      body += chunk
    })
    request.on('end', () => {
      try {
        resolve(body ? JSON.parse(body) : {})
      } catch {
        reject(new Error('Invalid JSON body'))
      }
    })
  })
}

function requireFields(body, fields) {
  const missing = fields.filter((field) => !String(body[field] || '').trim())
  return missing.length ? `${missing.join(', ')} required` : null
}

async function getAuthUser(request) {
  const token = request.headers.authorization?.replace('Bearer ', '')
  const payload = verifyToken(token)
  if (!payload) return null

  const db = await readDatabase()
  const user = db.users.find((item) => item.id === payload.id)
  return user ? { db, user } : null
}

function getUserProjects(db, user) {
  if (user.role === 'Admin') {
    return db.projects.filter((project) => project.adminId === user.id)
  }

  return db.projects.filter((project) => project.memberIds.includes(user.id))
}

function getProjectForUser(db, projectId, user) {
  return getUserProjects(db, user).find((project) => project.id === projectId)
}

function getVisibleTasks(db, project, user) {
  const tasks = db.tasks.filter((task) => task.projectId === project.id)
  return user.role === 'Admin' ? tasks : tasks.filter((task) => task.assigneeId === user.id)
}

async function handleApi(request, response, url) {
  if (request.method === 'OPTIONS') {
    response.writeHead(204, {
      'Access-Control-Allow-Origin': process.env.CLIENT_ORIGIN || '*',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS',
    })
    response.end()
    return
  }

  if (url.pathname === '/api/auth/signup' && request.method === 'POST') {
    const body = await parseBody(request)
    const error = requireFields(body, ['name', 'email', 'password', 'role'])
    if (error) return sendJson(response, 400, { message: error })
    if (!['Admin', 'Member'].includes(body.role)) return sendJson(response, 400, { message: 'Invalid role' })
    if (body.password.length < 6) return sendJson(response, 400, { message: 'Password must be at least 6 characters' })

    const db = await readDatabase()
    const normalizedEmail = body.email.toLowerCase().trim()
    if (db.users.some((user) => user.email === normalizedEmail)) {
      return sendJson(response, 409, { message: 'Email already registered' })
    }

    const user = {
      id: randomUUID(),
      name: body.name.trim(),
      email: normalizedEmail,
      role: body.role,
      passwordHash: hashPassword(body.password),
    }
    db.users.push(user)
    await writeDatabase(db)

    const token = signToken(publicUser(user))
    return sendJson(response, 201, { token, user: publicUser(user) })
  }

  if (url.pathname === '/api/auth/login' && request.method === 'POST') {
    const body = await parseBody(request)
    const error = requireFields(body, ['email', 'password', 'role'])
    if (error) return sendJson(response, 400, { message: error })

    const db = await readDatabase()
    const user = db.users.find((item) => item.email === body.email.toLowerCase().trim())
    if (!user || !verifyPassword(body.password, user.passwordHash)) {
      return sendJson(response, 401, { message: 'Invalid email or password' })
    }
    if (user.role !== body.role) {
      return sendJson(response, 403, { message: `This account is registered as ${user.role}` })
    }

    return sendJson(response, 200, { token: signToken(publicUser(user)), user: publicUser(user) })
  }

  const auth = await getAuthUser(request)
  if (!auth) return sendJson(response, 401, { message: 'Authentication required' })

  const { db, user } = auth

  if (url.pathname === '/api/me' && request.method === 'GET') {
    return sendJson(response, 200, { user: publicUser(user) })
  }

  if (url.pathname === '/api/users' && request.method === 'GET') {
    return sendJson(response, 200, { users: db.users.map(publicUser) })
  }

  if (url.pathname === '/api/projects' && request.method === 'GET') {
    const projects = getUserProjects(db, user)
    return sendJson(response, 200, { projects })
  }

  if (url.pathname === '/api/projects' && request.method === 'POST') {
    if (user.role !== 'Admin') return sendJson(response, 403, { message: 'Only admins can create projects' })

    const body = await parseBody(request)
    const error = requireFields(body, ['name', 'description'])
    if (error) return sendJson(response, 400, { message: error })

    const project = {
      id: randomUUID(),
      name: body.name.trim(),
      description: body.description.trim(),
      adminId: user.id,
      memberIds: [user.id],
      createdAt: new Date().toISOString().slice(0, 10),
    }
    db.projects.push(project)
    await writeDatabase(db)
    return sendJson(response, 201, { project })
  }

  const projectMemberMatch = url.pathname.match(/^\/api\/projects\/([^/]+)\/members$/)
  if (projectMemberMatch && request.method === 'POST') {
    const project = getProjectForUser(db, projectMemberMatch[1], user)
    if (!project) return sendJson(response, 404, { message: 'Project not found' })
    if (project.adminId !== user.id) return sendJson(response, 403, { message: 'Only project admin can add members' })

    const body = await parseBody(request)
    const member = db.users.find((item) => item.id === body.userId)
    if (!member) return sendJson(response, 404, { message: 'User not found' })
    project.memberIds = [...new Set([...project.memberIds, member.id])]
    await writeDatabase(db)
    return sendJson(response, 200, { project })
  }

  const projectMemberDeleteMatch = url.pathname.match(/^\/api\/projects\/([^/]+)\/members\/([^/]+)$/)
  if (projectMemberDeleteMatch && request.method === 'DELETE') {
    const project = getProjectForUser(db, projectMemberDeleteMatch[1], user)
    if (!project) return sendJson(response, 404, { message: 'Project not found' })
    if (project.adminId !== user.id) return sendJson(response, 403, { message: 'Only project admin can remove members' })
    if (projectMemberDeleteMatch[2] === project.adminId) return sendJson(response, 400, { message: 'Cannot remove project admin' })

    project.memberIds = project.memberIds.filter((id) => id !== projectMemberDeleteMatch[2])
    await writeDatabase(db)
    return sendJson(response, 200, { project })
  }

  const taskCollectionMatch = url.pathname.match(/^\/api\/projects\/([^/]+)\/tasks$/)
  if (taskCollectionMatch && request.method === 'GET') {
    const project = getProjectForUser(db, taskCollectionMatch[1], user)
    if (!project) return sendJson(response, 404, { message: 'Project not found' })
    return sendJson(response, 200, { tasks: getVisibleTasks(db, project, user) })
  }

  if (taskCollectionMatch && request.method === 'POST') {
    const project = getProjectForUser(db, taskCollectionMatch[1], user)
    if (!project) return sendJson(response, 404, { message: 'Project not found' })
    if (project.adminId !== user.id) return sendJson(response, 403, { message: 'Only project admin can create tasks' })

    const body = await parseBody(request)
    const error = requireFields(body, ['title', 'description', 'dueDate', 'priority', 'assigneeId'])
    if (error) return sendJson(response, 400, { message: error })
    if (!priorities.includes(body.priority)) return sendJson(response, 400, { message: 'Invalid priority' })
    if (!project.memberIds.includes(body.assigneeId)) return sendJson(response, 400, { message: 'Assignee must be a project member' })

    const task = {
      id: randomUUID(),
      projectId: project.id,
      title: body.title.trim(),
      description: body.description.trim(),
      dueDate: body.dueDate,
      priority: body.priority,
      status: 'To Do',
      assigneeId: body.assigneeId,
      createdBy: user.id,
    }
    db.tasks.push(task)
    await writeDatabase(db)
    return sendJson(response, 201, { task })
  }

  const taskMatch = url.pathname.match(/^\/api\/tasks\/([^/]+)$/)
  if (taskMatch && request.method === 'PUT') {
    const task = db.tasks.find((item) => item.id === taskMatch[1])
    if (!task) return sendJson(response, 404, { message: 'Task not found' })
    const project = getProjectForUser(db, task.projectId, user)
    if (!project) return sendJson(response, 404, { message: 'Project not found' })

    const isProjectAdmin = project.adminId === user.id
    const isAssignedMember = task.assigneeId === user.id
    if (!isProjectAdmin && !isAssignedMember) return sendJson(response, 403, { message: 'Not allowed to update this task' })

    const body = await parseBody(request)
    if (body.status && !statuses.includes(body.status)) return sendJson(response, 400, { message: 'Invalid status' })

    if (isProjectAdmin) {
      Object.assign(task, {
        title: body.title ?? task.title,
        description: body.description ?? task.description,
        dueDate: body.dueDate ?? task.dueDate,
        priority: body.priority ?? task.priority,
        assigneeId: body.assigneeId ?? task.assigneeId,
        status: body.status ?? task.status,
      })
    } else {
      task.status = body.status ?? task.status
    }

    await writeDatabase(db)
    return sendJson(response, 200, { task })
  }

  if (taskMatch && request.method === 'DELETE') {
    const task = db.tasks.find((item) => item.id === taskMatch[1])
    if (!task) return sendJson(response, 404, { message: 'Task not found' })
    const project = getProjectForUser(db, task.projectId, user)
    if (!project || project.adminId !== user.id) return sendJson(response, 403, { message: 'Only project admin can delete tasks' })

    db.tasks = db.tasks.filter((item) => item.id !== task.id)
    await writeDatabase(db)
    return sendJson(response, 200, { message: 'Task deleted' })
  }

  return sendJson(response, 404, { message: 'Route not found' })
}

async function serveClient(request, response, url) {
  try {
    const filePath = url.pathname === '/' ? path.join(clientDist, 'index.html') : path.join(clientDist, url.pathname)
    const file = await readFile(filePath)
    response.writeHead(200)
    response.end(file)
  } catch {
    try {
      const index = await readFile(path.join(clientDist, 'index.html'))
      response.writeHead(200, { 'Content-Type': 'text/html' })
      response.end(index)
    } catch {
      sendJson(response, 404, { message: 'Build frontend first with npm run build' })
    }
  }
}

const server = http.createServer(async (request, response) => {
  const url = new URL(request.url, `http://${request.headers.host}`)

  try {
    if (url.pathname.startsWith('/api')) {
      await handleApi(request, response, url)
      return
    }

    await serveClient(request, response, url)
  } catch (error) {
    sendJson(response, 500, { message: error.message || 'Internal server error' })
  }
})

server.listen(PORT, () => {
  console.log(`Team Task Manager API running on http://localhost:${PORT}`)
})
