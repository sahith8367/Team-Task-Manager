function ProjectSidebar({ projects, activeProjectId, isAdmin, onProjectChange, onCreateProject }) {
  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <div>
          <p className="eyebrow">Projects</p>
          <h2>Workspaces</h2>
        </div>
        {isAdmin && (
          <button className="icon-button" title="Create project" onClick={onCreateProject}>
            +
          </button>
        )}
      </div>

      <div className="project-list">
        {projects.map((project) => (
          <button
            className={project.id === activeProjectId ? 'project-link active' : 'project-link'}
            key={project.id}
            onClick={() => onProjectChange(project.id)}
          >
            <strong>{project.name}</strong>
            <span>{project.memberIds.length} members</span>
          </button>
        ))}
        {!projects.length && <p className="empty-state">No allocated projects yet.</p>}
      </div>
    </aside>
  )
}

export default ProjectSidebar
