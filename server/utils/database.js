import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { seedProjects, seedTasks, seedUsers } from '../data/seed.js'
import { hashPassword } from './auth.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const dataDir = path.join(__dirname, '..', 'data')
const dbPath = process.env.DB_PATH || path.join(dataDir, 'database.json')

async function ensureDatabase() {
  await fs.mkdir(dataDir, { recursive: true })

  try {
    await fs.access(dbPath)
  } catch {
    const users = seedUsers.map((user) => ({
      ...user,
      passwordHash: hashPassword(user.role === 'Admin' ? 'admin123' : 'member123'),
    }))

    await writeDatabase({
      users,
      projects: seedProjects,
      tasks: seedTasks,
    })
  }
}

export async function readDatabase() {
  await ensureDatabase()
  const raw = await fs.readFile(dbPath, 'utf8')
  return JSON.parse(raw)
}

export async function writeDatabase(data) {
  await fs.writeFile(dbPath, JSON.stringify(data, null, 2))
}

export function publicUser(user) {
  const safeUser = { ...user }
  delete safeUser.passwordHash
  return safeUser
}
