import { useState } from 'react'

function AuthPanel({ onAuth, error, isLoading }) {
  const [mode, setMode] = useState('login')
  const [form, setForm] = useState({
    name: '',
    email: 'admin@taskmanager.dev',
    password: 'admin123',
    role: 'Admin',
  })

  function updateField(event) {
    const { name, value } = event.target
    setForm((current) => ({ ...current, [name]: value }))
  }

  function submitAuth(event) {
    event.preventDefault()
    onAuth(mode, form)
  }

  function setDemo(role) {
    setForm((current) => ({
      ...current,
      email: role === 'Admin' ? 'admin@taskmanager.dev' : 'member@taskmanager.dev',
      password: role === 'Admin' ? 'admin123' : 'member123',
      role,
    }))
  }

  return (
    <section className="auth-panel" aria-label="Authentication">
      <div>
        <p className="eyebrow">Team Task Manager</p>
        <h1>Plan work, assign ownership, and keep every project moving.</h1>
        <p className="lede">
          Frontend screens for signup, login, role-based workspace access, task tracking, and
          project analytics.
        </p>
      </div>

      <div className="auth-card">
        <div className="segmented" aria-label="Authentication mode">
          <button className={mode === 'login' ? 'active' : ''} onClick={() => setMode('login')}>
            Login
          </button>
          <button className={mode === 'signup' ? 'active' : ''} onClick={() => setMode('signup')}>
            Signup
          </button>
        </div>

        <form className="form-grid" onSubmit={submitAuth}>
          {mode === 'signup' && (
            <label>
              Name
              <input name="name" value={form.name} onChange={updateField} placeholder="Your name" />
            </label>
          )}
          <label>
            Email
            <input name="email" value={form.email} onChange={updateField} placeholder="you@company.com" />
          </label>
          <label>
            Password
            <input
              name="password"
              type="password"
              value={form.password}
              onChange={updateField}
              placeholder="Minimum 8 characters"
            />
          </label>
          <label>
            Login as
            <select name="role" value={form.role} onChange={updateField}>
              <option value="Admin">Admin</option>
              <option value="Member">Member</option>
            </select>
          </label>
          {error && <p className="form-error">{error}</p>}
          <button className="primary-action" type="submit" disabled={isLoading}>
            {isLoading ? 'Verifying...' : mode === 'login' ? 'Secure Login' : 'Create Account'}
          </button>
        </form>

        <div className="demo-logins">
          <button type="button" onClick={() => setDemo('Admin')}>
            Use Admin Demo
          </button>
          <button type="button" onClick={() => setDemo('Member')}>
            Use Member Demo
          </button>
        </div>
      </div>
    </section>
  )
}

export default AuthPanel
