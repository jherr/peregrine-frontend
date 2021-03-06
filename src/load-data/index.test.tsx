import LoadData from '.'
import { render, wait } from 'preact-testing-library'
import { h } from 'preact'

test('resolving promise', async () => {
  let resolveData: (value: string) => void = Promise.resolve
  const fakePromise = new Promise<string>(resolve => (resolveData = resolve))
  const getData = () => fakePromise
  const { container, getByTestId } = render(
    <LoadData
      data={{ theData: getData }}
      renderSuccess={({ theData }) =>
        theData ? <pre data-testid="data">{theData}</pre> : <h1>no data</h1>
      }
    />,
  )
  expect(container.firstElementChild).toMatchInlineSnapshot(`
<h1>
  no data
</h1>
`)
  resolveData('HIYA')
  await wait(() => getByTestId('data'))
  expect(container.firstElementChild).toMatchInlineSnapshot(`
<pre
  data-testid="data"
>
  HIYA
</pre>
`)
})

test('rejecting promise', async () => {
  type T = { message: string }
  let rejectData: (reason: T) => void = Promise.reject
  const fakePromise = new Promise<T>((_, reject) => (rejectData = reject))
  const getData = () => fakePromise
  const { container, getByTestId } = render(
    <LoadData
      data={{ theData: getData }}
      renderSuccess={({ theData }) =>
        theData ? <div data-testid="data">{theData}</div> : <div>no data</div>
      }
      renderError={({ theData }) => (
        <div data-testid="error">{theData && theData.message}</div>
      )}
    />,
  )
  expect(container.firstElementChild).toMatchInlineSnapshot(`
<div>
  no data
</div>
`)
  jest.spyOn(console, 'error').mockImplementation()
  rejectData({ message: 'asdf' })
  await wait(() => getByTestId('error'))
  expect(console.error).toHaveBeenCalledWith({ message: 'asdf' })
  jest.spyOn(console, 'error').mockRestore()
  expect(container.firstElementChild).toMatchInlineSnapshot(`
<div
  data-testid="error"
>
  asdf
</div>
`)
})
