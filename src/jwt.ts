import { Roles } from '@/api/user'

let jwt: string | null = null

interface JWT {
  exp: number
  pigmiceRealm: number
  pigmiceRoles: Roles
  sub: string
  raw: string
}

export const getJWT = () => {
  const j = jwt || localStorage.getItem('jwt')
  const parsed = parseJWT(j)
  if (parsed && new Date(parsed.exp * 1000) > new Date()) {
    jwt = j
    return parsed
  }
  // jwt is expired, remove it from localstorage
  setJWT(null)
}

const parseJWT = (jwt?: string | null) => {
  if (!jwt) return
  const payload = jwt.split('.', 2)[1]
  const data = JSON.parse(atob(payload))
  data.raw = jwt
  return data as JWT
}

export const setJWT = (newJWT: string | null) => {
  jwt = newJWT
  jwt ? localStorage.setItem('jwt', jwt) : localStorage.removeItem('jwt')
}