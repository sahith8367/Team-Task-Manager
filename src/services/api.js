const API_BASE_URL = import.meta.env.VITE_API_URL || '/api'

async function request(path, options = {}) {
  const token = localStorage.getItem('taskManagerToken')
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  })

  const data = await response.json()
  if (!response.ok) {
    throw new Error(data.message || 'Request failed')
  }

  return data
}

export const api = {
  signup(payload) {
    return request('/auth/signup', {
      method: 'POST',
      body: JSON.stringify(payload),
    })
  },
  login(payload) {
    return request('/auth/login', {
      method: 'POST',
      body: JSON.stringify(payload),
    })
  },
  me() {
    return request('/me')
  },
  users() {
    return request('/users')
  },
  projects() {
    return request('/projects')
  },
  createProject(payload) {
    return request('/projects', {
      method: 'POST',
      body: JSON.stringify(payload),
    })
  },
  addMember(projectId, userId) {
    return request(`/projects/${projectId}/members`, {
      method: 'POST',
      body: JSON.stringify({ userId }),
    })
  },
  removeMember(projectId, userId) {
    return request(`/projects/${projectId}/members/${userId}`, {
      method: 'DELETE',
    })
  },
  tasks(projectId) {
    return request(`/projects/${projectId}/tasks`)
  },
  createTask(projectId, payload) {
    return request(`/projects/${projectId}/tasks`, {
      method: 'POST',
      body: JSON.stringify(payload),
    })
  },
  updateTask(taskId, payload) {
    return request(`/tasks/${taskId}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    })
  },
  deleteTask(taskId) {
    return request(`/tasks/${taskId}`, {
      method: 'DELETE',
    })
  },
}
