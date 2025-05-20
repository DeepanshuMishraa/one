import PrivacyPolicy from '@/components/PrivacyPolicy'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/privacy')({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <>
      <PrivacyPolicy />
    </>
  )
}
