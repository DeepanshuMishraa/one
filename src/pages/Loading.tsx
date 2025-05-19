import { IconLoader2 } from "@tabler/icons-react";

export default function Loading() {
  return (
    <div className="bg-background/50 flex min-h-screen items-center justify-center backdrop-blur-sm">
      <div className="flex flex-col items-center gap-2">
        <IconLoader2 className="text-primary h-10 w-10 animate-spin" />
        <p className="text-muted-foreground animate-pulse text-sm">
          Loading...
        </p>
      </div>
    </div>
  );
}

// Optimized for React.Suspense
export function SuspenseLoading() {
  return <Loading />;
}
