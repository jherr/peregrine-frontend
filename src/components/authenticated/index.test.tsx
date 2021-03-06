import { render, fireEvent, wait } from 'preact-testing-library'
import Authenticated from '.'
import { h } from 'preact'

const nextTick = () => new Promise(resolve => setImmediate(resolve))

const jwtBody = {
  exp: Date.now() / 1000 + 100,
  sub: 'name',
  pigmiceRoles: { admin: true },
}
const jwt = `asdf.${btoa(JSON.stringify(jwtBody))}.asdf`

test('renders login page then renders contents', async () => {
  const { getByLabelText, getByText } = render(
    <Authenticated render={() => <div>Rendered</div>} />,
  )
  const usernameInput = getByLabelText(/username/i) as HTMLInputElement

  usernameInput.value = 'name'
  fireEvent.input(usernameInput)

  const passwordInput = getByLabelText(/password/i) as HTMLInputElement

  passwordInput.value = 'pwd'
  fireEvent.input(passwordInput)

  await nextTick()

  jest.spyOn(window, 'fetch').mockImplementation(
    (url, options) =>
      new Promise(resolve => {
        expect(url).toMatch(/\/authenticate$/)
        expect(options).toEqual({
          body: '{"username":"name","password":"pwd"}',
          headers: {},
          method: 'POST',
        })
        resolve(
          new Response(JSON.stringify({ accessToken: jwt }), {
            headers: { 'Content-Type': 'application/json' },
          }),
        )
      }),
  )

  fireEvent.submit(getByText('Submit'))

  await wait(() => getByText('Rendered'))

  expect(window.fetch).toHaveBeenCalledTimes(1)

  expect(localStorage.getItem('jwt')).toEqual(jwt)
})

test('displays error for incorrect username/pw', async () => {
  const { getByLabelText, getByText } = render(
    <Authenticated render={() => <div>Rendered</div>} />,
  )
  const usernameInput = getByLabelText(/username/i) as HTMLInputElement

  usernameInput.value = 'name'
  fireEvent.input(usernameInput)

  const passwordInput = getByLabelText(/password/i) as HTMLInputElement

  passwordInput.value = 'incorrect'
  fireEvent.input(passwordInput)

  await nextTick()

  jest.spyOn(window, 'fetch').mockImplementation(
    (url, options) =>
      new Promise(resolve => {
        expect(url).toMatch(/\/authenticate$/)
        expect(options).toEqual({
          body: '{"username":"name","password":"incorrect"}',
          headers: {},
          method: 'POST',
        })
        resolve(
          new Response('Unauthorized', {
            status: 401,
            headers: { 'Content-Type': 'text/plain' },
          }),
        )
      }),
  )

  fireEvent.submit(getByText('Submit'))

  await wait(() => getByText(/invalid/i))

  expect(window.fetch).toHaveBeenCalledTimes(1)

  expect(localStorage.getItem('jwt')).toBeNull()
})

test('renders content directly with jwt in localstorage', async () => {
  localStorage.setItem('jwt', jwt)
  const { getByText } = render(
    <Authenticated
      render={() => (
        <div>
          <h1>Roles</h1>
        </div>
      )}
    />,
  )

  await nextTick()

  getByText('Roles')
})

test('deletes expired jwt', async () => {
  const expiredJWTBody = { exp: Date.now() / 1000 - 100 }
  const expiredJWT = `asdf.${btoa(JSON.stringify(expiredJWTBody))}.asdf`
  localStorage.setItem('jwt', expiredJWT)
  const { getByText } = render(<Authenticated render={() => <h1>Hi</h1>} />)

  await wait(() => getByText('Submit'))

  expect(localStorage.getItem('jwt')).toBeNull()
})
