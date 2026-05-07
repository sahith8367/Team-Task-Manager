import { useCallback, useEffect, useMemo, useState } from 'react'
import AuthPanel from './components/AuthPanel'
import Dashboard from './components/Dashboard'
import MemberPanel from './components/MemberPanel'
import ProjectSidebar from './components/ProjectSidebar'
import TaskBoard, { TaskModal } from './components/TaskBoard'
import { api } from './services/api'
import './App.css'

function ProjectModal({ onClose, onSave }) {
  function handleSubmit(event) {
    event.preventDefault()
    const form = new FormData(event.currentTarget)
    onSave({
      name: form.get('name'),
      description: form.get('description'),
    })
  }

  return (
    <div className="modal-backdrop" role="presentation">
      <section className="modal" role="dialog" aria-modal="true" aria-label="Create project">
        <div className="section-heading">
          <h2>Create project</h2>
          <button className="icon-button" onClick={onClose} title="Close">
            x
          </button>
        </div>
        <form className="form-grid" onSubmit={handleSubmit}>
          <label>
            Project name
            <input name="name" required placeholder="Project name" />
          </label>
          <label>
            Statement
            <textarea name="description" required placeholder="Project statement or description" rows="4" />
          </label>
          <button className="primary-action" type="submit">
            Create Project
          </button>
        </form>
      </section>
    </div>
  )
}

function App() {
  const [authUser, setAuthUser] = useState(null)
  const [users, setUsers] = useState([])
  const [projects, setProjects] = useState([])
  const [tasks, setTasks] = useState([])
  const [activeProjectId, setActiveProjectId] = useState('')
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false)
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false)
  const [authError, setAuthError] = useState('')
  const [appError, setAppError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const activeProject = projects.find((project) => project.id === activeProjectId)
  const projectMembers = useMemo(
    () => users.filter((user) => activeProject?.memberIds.includes(user.id)),
    [activeProject, users],
  )
  const isAdmin = authUser?.role === 'Admin' && activeProject?.adminId === authUser.id

  const loadWorkspace = useCallback(async (preferredProjectId = '') => {
    const [usersResponse, projectsResponse] = await Promise.all([api.users(), api.projects()])
    setUsers(usersResponse.users)
    setProjects(projectsResponse.projects)

    const selectedProjectId = projectsResponse.projects.some((project) => project.id === preferredProjectId)
      ? preferredProjectId
      : projectsResponse.projects[0]?.id || ''

    setActiveProjectId(selectedProjectId)

    if (selectedProjectId) {
      const tasksResponse = await api.tasks(selectedProjectId)
      setTasks(tasksResponse.tasks)
    } else {
      setTasks([])
    }
  }, [])

  useEffect(() => {
    const token = localStorage.getItem('taskManagerToken')
    if (!token) return

    api
      .me()
      .then(async ({ user }) => {
        setAuthUser(user)
        await loadWorkspace()
      })
      .catch(() => {
        localStorage.removeItem('taskManagerToken')
      })
  }, [loadWorkspace])

  useEffect(() => {
    if (!activeProjectId || !authUser) return

    api
      .tasks(activeProjectId)
      .then(({ tasks: nextTasks }) => setTasks(nextTasks))
      .catch((error) => setAppError(error.message))
  }, [activeProjectId, authUser])

  async function handleAuth(mode, form) {
    setAuthError('')
    setIsLoading(true)

    try {
      const response = mode === 'signup' ? await api.signup(form) : await api.login(form)
      localStorage.setItem('taskManagerToken', response.token)
      setAuthUser(response.user)
      await loadWorkspace()
    } catch (error) {
      setAuthError(error.message)
    } finally {
      setIsLoading(false)
    }
  }

  function logout() {
    localStorage.removeItem('taskManagerToken')
    setAuthUser(null)
    setProjects([])
    setTasks([])
    setActiveProjectId('')
  }

  async function createProject(project) {
    try {
      const { project: createdProject } = await api.createProject(project)
      setProjects((current) => [...current, createdProject])
      setActiveProjectId(createdProject.id)
      setIsProjectModalOpen(false)
    } catch (error) {
      setAppError(error.message)
    }
  }

  async function addMember(userId) {
    if (!userId || !activeProjectId) return
    try {
      const { project } = await api.addMember(activeProjectId, userId)
      setProjects((current) => current.map((item) => (item.id === project.id ? project : item)))
    } catch (error) {
      setAppError(error.message)
    }
  }

  async function removeMember(userId) {
    try {
      const { project } = await api.removeMember(activeProjectId, userId)
      setProjects((current) => current.map((item) => (item.id === project.id ? project : item)))
      const tasksResponse = await api.tasks(activeProjectId)
      setTasks(tasksResponse.tasks)
    } catch (error) {
      setAppError(error.message)
    }
  }

  async function createTask(task) {
    try {
      const { task: createdTask } = await api.createTask(activeProjectId, task)
      setTasks((current) => [...current, createdTask])
      setIsTaskModalOpen(false)
    } catch (error) {
      setAppError(error.message)
    }
  }

  async function updateTaskStatus(taskId, status) {
    try {
      const { task } = await api.updateTask(taskId, { status })
      setTasks((current) => current.map((item) => (item.id === task.id ? task : item)))
    } catch (error) {
      setAppError(error.message)
    }
  }

  async function deleteTask(taskId) {
    try {
      await api.deleteTask(taskId)
      setTasks((current) => current.filter((task) => task.id !== taskId))
    } catch (error) {
      setAppError(error.message)
    }
  }

  if (!authUser) {
    return <AuthPanel onAuth={handleAuth} error={authError} isLoading={isLoading} />
  }

  return (
    <main className="app-shell">
      <header className="topbar">
        <div>
          <strong>{authUser.name}</strong>
          <span>{authUser.role} verified</span>
        </div>
        <button onClick={logout}>Logout</button>
      </header>

      {appError && (
        <button className="app-error" onClick={() => setAppError('')}>
          {appError}
        </button>
      )}

      <div className="workspace-layout full-height">
        <ProjectSidebar
          projects={projects}
          activeProjectId={activeProjectId}
          isAdmin={authUser.role === 'Admin'}
          onProjectChange={setActiveProjectId}
          onCreateProject={() => setIsProjectModalOpen(true)}
        />

        <div className="workspace-main">
          {activeProject ? (
            <>
              <header className="project-header">
                <div>
                  <p className="eyebrow">Allocated project</p>
                  <h2>{activeProject.name}</h2>
                  <p>{activeProject.description}</p>
                </div>
                <div className="role-pill">{isAdmin ? 'Admin access' : 'Member access'}</div>
              </header>

              <Dashboard tasks={tasks} members={projectMembers} />

              <div className="content-grid">
                <TaskBoard
                  tasks={tasks}
                  members={projectMembers}
                  isAdmin={isAdmin}
                  onCreateTask={() => setIsTaskModalOpen(true)}
                  onStatusChange={updateTaskStatus}
                  onDeleteTask={deleteTask}
                />
                <MemberPanel
                  users={users}
                  members={projectMembers}
                  activeUser={authUser}
                  isAdmin={isAdmin}
                  onAddMember={addMember}
                  onRemoveMember={removeMember}
                />
              </div>
            </>
          ) : (
            <section className="empty-workspace">
              <h2>{authUser.role === 'Admin' ? 'Create your first project' : 'No project allocated yet'}</h2>
              <p>
                {authUser.role === 'Admin'
                  ? 'Admins can create projects and then add members, assign tasks, and track progress.'
                  : 'Members only see projects allocated by an admin. Ask an admin to add you to a project.'}
              </p>
              {authUser.role === 'Admin' && (
                <button className="primary-action compact" onClick={() => setIsProjectModalOpen(true)}>
                  Create Project
                </button>
              )}
            </section>
          )}
        </div>
      </div>

      {isLoading && <div className="loading-strip">Loading workspace...</div>}
      {isTaskModalOpen && <TaskModal members={projectMembers} onClose={() => setIsTaskModalOpen(false)} onSave={createTask} />}
      {isProjectModalOpen && <ProjectModal onClose={() => setIsProjectModalOpen(false)} onSave={createProject} />}
    </main>
  )
}

export default App
