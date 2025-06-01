import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute('/')({
  component: Home,
})


function Home() {
  return (
    <div className="flex items-center justify-center h-screen">
      <h1 className="text-4xl">Welcome to One</h1>
    </div>
  )
}
