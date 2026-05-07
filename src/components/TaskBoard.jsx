import { priorities, statuses } from '../data/mockData'
import { isOverdue } from '../utils/metrics'

function TaskBoard({ tasks, members, isAdmin, onCreateTask, onStatusChange, onDeleteTask }) {
  return (
    <section className="task-board" aria-label="Task board">
      <div className="board-toolbar">
        <div>
          <p className="eyebrow">Tasks</p>
          <h2>{isAdmin ? 'Project board' : 'My assigned tasks'}</h2>
        </div>
        {isAdmin && (
          <button className="primary-action compact" onClick={onCreateTask}>
            New Task
          </button>
        )}
      </div>

      <div className="kanban">
        {statuses.map((status) => (
          <div className="lane" key={status}>
            <div className="lane-header">
              <h3>{status}</h3>
              <span>{tasks.filter((task) => task.status === status).length}</span>
            </div>

            {tasks
              .filter((task) => task.status === status)
              .map((task) => {
                const assignee = members.find((member) => member.id === task.assigneeId)
                return (
                  <article className="task-card" key={task.id}>
                    <div className="task-card-header">
                      <span className={`priority ${task.priority.toLowerCase()}`}>{task.priority}</span>
                      {isOverdue(task) && <span className="overdue">Overdue</span>}
                    </div>
                    <h4>{task.title}</h4>
                    <p>{task.description}</p>
                    <div className="task-meta">
                      <span>Due {task.dueDate}</span>
                      <span>{assignee?.name || 'Unassigned'}</span>
                    </div>
                    <div className="task-actions">
                      <select value={task.status} onChange={(event) => onStatusChange(task.id, event.target.value)}>
                      {statuses.map((nextStatus) => (
                          <option key={nextStatus} value={nextStatus}>
                            {nextStatus}
                          </option>
                      ))}
                    </select>
                      {isAdmin && <button onClick={() => onDeleteTask(task.id)}>Delete</button>}
                    </div>
                  </article>
                )
              })}
          </div>
        ))}
      </div>
    </section>
  )
}

export function TaskModal({ members, onClose, onSave }) {
  const [defaultPriority] = priorities
  const [firstMember] = members
  const today = new Date().toISOString().slice(0, 10)

  function handleSubmit(event) {
    event.preventDefault()
    const form = new FormData(event.currentTarget)
    onSave({
      title: form.get('title'),
      description: form.get('description'),
      dueDate: form.get('dueDate'),
      priority: form.get('priority'),
      assigneeId: form.get('assigneeId'),
    })
  }

  return (
    <div className="modal-backdrop" role="presentation">
      <section className="modal" role="dialog" aria-modal="true" aria-label="Create task">
        <div className="section-heading">
          <h2>Create task</h2>
          <button className="icon-button" onClick={onClose} title="Close">
            x
          </button>
        </div>
        <form className="form-grid" onSubmit={handleSubmit}>
          <label>
            Title
            <input name="title" required placeholder="Task title" />
          </label>
          <label>
            Description
            <textarea name="description" required placeholder="What needs to be done?" rows="4" />
          </label>
          <div className="form-row">
            <label>
              Due date
              <input name="dueDate" type="date" defaultValue={today} required />
            </label>
            <label>
              Priority
              <select name="priority" defaultValue={defaultPriority}>
                {priorities.map((priority) => (
                  <option key={priority} value={priority}>
                    {priority}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <label>
            Assign to
            <select name="assigneeId" defaultValue={firstMember?.id} required>
              {members.map((member) => (
                <option key={member.id} value={member.id}>
                  {member.name}
                </option>
              ))}
            </select>
          </label>
          <button className="primary-action" type="submit">
            Save Task
          </button>
        </form>
      </section>
    </div>
  )
}

export default TaskBoard
