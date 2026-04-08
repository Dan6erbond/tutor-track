import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/app/confirmations/$confirmationId')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/app/confirmations/$confirmationId"!</div>
}
