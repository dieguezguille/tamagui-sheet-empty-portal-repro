import { useState } from 'react'
import { Button, H4, Paragraph, Sheet, YStack } from 'tamagui'

export default function Sheets() {
  const [open, setOpen] = useState(false)
  const [taps, setTaps] = useState(0)
  return (
    <>
      <YStack flex={1} alignItems="center" justifyContent="center" gap="$4" backgroundColor="$background">
        <H4>Closed modal sheets on this screen: 4</H4>
        <Button testID="tap" onPress={() => setTaps((count) => count + 1)}>
          Tap me
        </Button>
        <Paragraph testID="taps">Taps: {taps}</Paragraph>
        <Button testID="open" onPress={() => setOpen(true)}>
          Open sheet
        </Button>
      </YStack>

      {/* never opened, like the confirmation or info sheets a screen declares up front */}
      <ClosedSheet />
      <ClosedSheet />
      <ClosedSheet />

      <Sheet modal open={open} onOpenChange={setOpen} unmountChildrenWhenHidden snapPointsMode="fit">
        <Sheet.Overlay />
        <Sheet.Container padding="$4" gap="$4" paddingBottom="$8">
          <Paragraph>Sheet content</Paragraph>
          <Button testID="close" onPress={() => setOpen(false)}>
            Close sheet
          </Button>
        </Sheet.Container>
      </Sheet>
    </>
  )
}

function ClosedSheet() {
  return (
    <Sheet modal open={false} unmountChildrenWhenHidden>
      <Sheet.Overlay />
      <Sheet.Container>
        <Paragraph>Never shown</Paragraph>
      </Sheet.Container>
    </Sheet>
  )
}
