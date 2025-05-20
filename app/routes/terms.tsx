import TermsOfService from '@/components/TOS'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/terms')({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <>
      <TermsOfService />
    </>
  )
}
