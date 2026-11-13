import { COOKIE_NAME, getCookie, verifySession } from './_admin-auth.js'

export default function handler(request, response) {
  if (request.method !== 'GET') {
    response.setHeader('Allow', 'GET')
    return response.status(405).json({ error: 'Method not allowed' })
  }

  return response.status(200).json({ authenticated: verifySession(getCookie(request, COOKIE_NAME)) })
}
