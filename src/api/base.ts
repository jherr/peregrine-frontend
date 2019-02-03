import { getJWT } from '@/jwt'

const apiUrl =
  (process.env.PEREGRINE_API_URL ||
    (process.env.NODE_ENV === 'production' && process.env.BRANCH === 'master'
      ? 'https://api.peregrine.ga:8081'
      : 'https://edge.api.peregrine.ga:8081')) + '/'

type PeregrineResponse<T> = Readonly<{ T }>

const qs = (
  q: { [key: string]: string | number | undefined } | null | undefined,
) => {
  if (!q) return ''
  const v = Object.entries(q)
    .filter(([_key, val]) => val !== undefined)
    .map(([key, val]) => `${key}=${val}`)
    .join('&')
  return v ? `?${v}` : ''
}

class HTTPError extends Error {
  code: number
  message: string

  constructor(code: number, message: string) {
    super(`got status ${code} with message '${message}'`)

    this.code = code
    this.message = message
  }
}

export const request = async <T extends any>(
  method: 'GET' | 'DELETE' | 'POST' | 'PUT' | 'PATCH',
  endpoint: string,
  params?: { [key: string]: string | number | undefined } | null,
  body?: any,
  notAuthenticated?: true,
): Promise<PeregrineResponse<T> | null> => {
  const jwt = notAuthenticated ? false : await getJWT()

  const resp = await fetch(apiUrl + endpoint + qs(params), {
    method,
    body: JSON.stringify(body),
    headers: jwt ? { Authorization: `Bearer ${jwt.raw}` } : {},
  })

  const contentType = resp.headers.get('Content-Type')

  if (resp.status === 201 || resp.status === 204) {
    return null
  } else if (!resp.ok) {
    if (contentType === 'application/json') {
      throw new HTTPError(resp.status, (await resp.json()).error)
    } else {
      throw new HTTPError(resp.status, await resp.text())
    }
  } else {
    return (await resp.json()) as PeregrineResponse<T>
  }
}
