import { sessionCookie } from './_admin-auth.js'

export default function handler(request, response) {
  if (request.method !== 'POST') {
    response.setHeader('Allow', 'POST')
    return response.status(405).json({ error: 'Method not allowed' })
  }

  response.setHeader('Set-Cookie', sessionCookie('', 0))
  return response.status(200).json({ authenticated: false })
}
