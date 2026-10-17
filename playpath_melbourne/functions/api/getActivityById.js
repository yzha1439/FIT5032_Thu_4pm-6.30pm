const upstream = 'https://australia-southeast2-playpath-melbourne.cloudfunctions.net/getActivityById'

export async function onRequest(context) {
  const url = new URL(context.request.url)
  const target = new URL(upstream)
  url.searchParams.forEach((value, key) => target.searchParams.set(key, value))
  const response = await fetch(target)
  const headers = new Headers(response.headers)
  headers.set('cache-control', 'no-store')
  headers.set('access-control-allow-origin', '*')
  return new Response(response.body, { status: response.status, headers })
}
