import crypto from 'node:crypto'

const TOKEN_TTL_MS = 1000 * 60 * 60 * 24
const DEFAULT_SECRET = 'replace-this-secret-in-railway'

export function hashPassword(password, salt = crypto.randomBytes(16).toString('hex')) {
  const hash = crypto.pbkdf2Sync(password, salt, 120000, 64, 'sha512').toString('hex')
  return `${salt}:${hash}`
}

export function verifyPassword(password, storedPassword) {
  const [salt] = storedPassword.split(':')
  return hashPassword(password, salt) === storedPassword
}

export function signToken(payload) {
  const secret = process.env.JWT_SECRET || DEFAULT_SECRET
  const body = {
    ...payload,
    exp: Date.now() + TOKEN_TTL_MS,
  }
  const encodedBody = Buffer.from(JSON.stringify(body)).toString('base64url')
  const signature = crypto.createHmac('sha256', secret).update(encodedBody).digest('base64url')
  return `${encodedBody}.${signature}`
}

export function verifyToken(token) {
  if (!token || !token.includes('.')) return null
  const secret = process.env.JWT_SECRET || DEFAULT_SECRET
  const [encodedBody, signature] = token.split('.')
  const expectedSignature = crypto.createHmac('sha256', secret).update(encodedBody).digest('base64url')

  if (
    signature.length !== expectedSignature.length ||
    !crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature))
  ) {
    return null
  }

  const payload = JSON.parse(Buffer.from(encodedBody, 'base64url').toString('utf8'))
  return payload.exp > Date.now() ? payload : null
}
