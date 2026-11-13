import { createSession, safeEqual, sessionCookie } from './_admin-auth.js'
import process from 'node:process'

export default function handler(request, response) {
  if (request.method !== 'POST') {
    response.setHeader('Allow', 'POST')
    return response.status(405).json({ error: 'Method not allowed' })
  }

  const { username, password } = request.body || {}
  const configuredUsername = process.env.ADMIN_USERNAME
  const configuredPassword = process.env.ADMIN_PASSWORD

  if (!configuredUsername || !configuredPassword) {
    return response.status(500).json({ error: 'Admin login is not configured' })
  }

  if (!safeEqual(String(username || ''), configuredUsername) || !safeEqual(String(password || ''), configuredPassword)) {
    return response.status(401).json({ error: 'Invalid username or password' })
  }

  response.setHeader('Set-Cookie', sessionCookie(createSession()))
  return response.status(200).json({ authenticated: true })
}
