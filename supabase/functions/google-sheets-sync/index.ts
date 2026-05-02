import { serve } from 'https://deno.land/std@0.224.0/http/server.ts'

serve(async (req) => {
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 })
  }

  const webhookUrl = Deno.env.get('GOOGLE_SHEETS_WEBHOOK_URL')
  if (!webhookUrl) {
    return Response.json({ ok: false, error: 'GOOGLE_SHEETS_WEBHOOK_URL is not configured' }, { status: 500 })
  }

  const payload = await req.json().catch(() => ({}))

  const upstream = await fetch(webhookUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  })

  const responseText = await upstream.text()

  return new Response(responseText, {
    status: upstream.status,
    headers: {
      'Content-Type': upstream.headers.get('Content-Type') || 'application/json',
    },
  })
})
