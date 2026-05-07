function MemberPanel({ users, members, isAdmin, activeUser, onAddMember, onRemoveMember }) {
  const availableUsers = users.filter((user) => !members.some((member) => member.id === user.id))

  return (
    <section className="member-panel" aria-label="Project members">
      <div className="section-heading">
        <h2>Team</h2>
        <span>{isAdmin ? 'Admin controls' : 'View only'}</span>
      </div>

      <div className="member-list">
        {members.map((member) => (
          <div className="member-row" key={member.id}>
            <div className="avatar">{member.avatar}</div>
            <div>
              <strong>{member.name}</strong>
              <span>
                {member.role}
                {member.id === activeUser.id ? ' - You' : ''}
              </span>
            </div>
            {isAdmin && member.role !== 'Admin' && (
              <button onClick={() => onRemoveMember(member.id)}>Remove</button>
            )}
          </div>
        ))}
      </div>

      {isAdmin && (
        <label className="member-add">
          Add member
          <select value="" onChange={(event) => onAddMember(event.target.value)}>
            <option value="" disabled>
              Select user
            </option>
            {availableUsers.map((user) => (
              <option key={user.id} value={user.id}>
                {user.name}
              </option>
            ))}
          </select>
        </label>
      )}
    </section>
  )
}

export default MemberPanel
