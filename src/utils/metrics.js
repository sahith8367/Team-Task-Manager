export function isOverdue(task, today = new Date()) {
  const endOfToday = new Date(today)
  endOfToday.setHours(23, 59, 59, 999)
  return task.status !== 'Done' && new Date(task.dueDate) < endOfToday
}

export function getProjectMetrics(tasks, users) {
  const byStatus = tasks.reduce(
    (acc, task) => ({ ...acc, [task.status]: (acc[task.status] || 0) + 1 }),
    { 'To Do': 0, 'In Progress': 0, Done: 0 },
  )

  const perUser = users.map((user) => ({
    user,
    total: tasks.filter((task) => task.assigneeId === user.id).length,
    open: tasks.filter((task) => task.assigneeId === user.id && task.status !== 'Done').length,
  }))

  return {
    total: tasks.length,
    byStatus,
    perUser,
    overdue: tasks.filter((task) => isOverdue(task)),
  }
}
