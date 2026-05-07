import { getProjectMetrics } from '../utils/metrics'

function Dashboard({ tasks, members }) {
  const metrics = getProjectMetrics(tasks, members)

  return (
    <section className="dashboard-grid" aria-label="Dashboard">
      <article className="metric-card">
        <span>Total tasks</span>
        <strong>{metrics.total}</strong>
        <small>Across the selected project</small>
      </article>
      <article className="metric-card">
        <span>To Do</span>
        <strong>{metrics.byStatus['To Do']}</strong>
        <small>Ready for assignment or execution</small>
      </article>
      <article className="metric-card">
        <span>In Progress</span>
        <strong>{metrics.byStatus['In Progress']}</strong>
        <small>Currently being worked on</small>
      </article>
      <article className="metric-card danger">
        <span>Overdue</span>
        <strong>{metrics.overdue.length}</strong>
        <small>Open tasks past due date</small>
      </article>

      <div className="workload-panel">
        <div className="section-heading">
          <h2>Tasks per user</h2>
          <span>Live workload</span>
        </div>
        <div className="workload-list">
          {metrics.perUser.map(({ user, total, open }) => (
            <div className="workload-row" key={user.id}>
              <div className="avatar">{user.avatar}</div>
              <div>
                <strong>{user.name}</strong>
                <span>{open} open tasks</span>
              </div>
              <b>{total}</b>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default Dashboard
