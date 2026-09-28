import { StyleSheet } from 'react-native'
import { act, create, type ReactTestInstance, type ReactTestRenderer } from 'react-test-renderer'
import { TamaguiProvider } from 'tamagui'
import Sheets from './app/sheets'
import config from './tamagui.config'

jest.useFakeTimers()

test('never-opened modal sheets do not mount empty full-screen portal wrappers', async () => {
  const app = await render()
  expect(emptyWrappers(app)).toHaveLength(0)
})

test('a modal sheet opens, closes and leaves no empty portal wrapper behind', async () => {
  const app = await render()

  await act(async () => app.root.findByProps({ testID: 'open' }).props.onPress())
  await act(async () => {
    // jest has no layout, and the sheet only animates once it has measured itself
    for (const node of app.root.findAll((node) => typeof node.props.onLayout === 'function')) {
      node.props.onLayout({ nativeEvent: { layout: { x: 0, y: 0, width: 390, height: 300 } } })
    }
  })
  await act(async () => jest.advanceTimersByTime(2000))
  expect(hasText(app, 'Sheet content')).toBe(true)

  await act(async () => app.root.findByProps({ testID: 'close' }).props.onPress())
  await act(async () => jest.advanceTimersByTime(2000))
  expect(hasText(app, 'Sheet content')).toBe(false)
  expect(emptyWrappers(app)).toHaveLength(0)
})

async function render() {
  let app: ReactTestRenderer | undefined
  await act(async () => {
    app = create(
      <TamaguiProvider config={config} defaultTheme="light">
        <Sheets />
      </TamaguiProvider>,
    )
  })
  if (!app) throw new Error('app did not render')
  return app
}

function hasText(app: ReactTestRenderer, text: string) {
  return app.root.findAll((node) => (node.type as string) === 'Text' && node.children.includes(text)).length > 0
}

// the wrapper that @tamagui/portal's Portal.native renders around every portal item
function emptyWrappers(app: ReactTestRenderer) {
  return app.root.findAll((node: ReactTestInstance) => {
    if ((node.type as string) !== 'View' || node.children.length > 0) return false
    const style = StyleSheet.flatten(node.props.style) ?? {}
    const pointerEvents = node.props.pointerEvents ?? style.pointerEvents
    return pointerEvents === 'box-none' && style.position === 'absolute' && style.top === 0 && style.bottom === 0 && style.left === 0 && style.right === 0
  })
}
