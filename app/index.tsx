import { Link } from 'expo-router'
import { Button, YStack } from 'tamagui'

export default function Home() {
  return (
    <YStack flex={1} alignItems="center" justifyContent="center" backgroundColor="$background">
      <Link href="/sheets" asChild>
        <Button testID="navigate">Go to screen with sheets</Button>
      </Link>
    </YStack>
  )
}
