import { Skeleton } from "@/components/ui/skeleton";

export function CardSkeleton() {
  return (
    <div className="rounded-lg border border-border bg-card p-5 space-y-3">
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-3 w-1/2" />
      <div className="flex gap-2 pt-1">
        <Skeleton className="h-5 w-16 rounded-full" />
        <Skeleton className="h-5 w-20 rounded-full" />
      </div>
    </div>
  );
}

export function GridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: count }).map((_, i) => (
        <CardSkeleton key={i} />
      ))}
    </div>
  );
}

export function TopicPageSkeleton() {
  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <Skeleton className="h-4 w-64" />
      <Skeleton className="h-8 w-96" />
      <Skeleton className="h-24 w-full rounded-lg" />
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="space-y-2">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-20 w-full" />
          </div>
        ))}
      </div>
    </div>
  );
}
