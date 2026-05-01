import { Skeleton } from '@bukz/ui';

export default function JobsLoadingPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <Skeleton className="h-10 w-64" />
      <Skeleton className="mt-2 h-4 w-96" />
      <div className="mt-8 flex gap-8">
        <div className="w-64">
          <Skeleton className="h-96" />
        </div>
        <div className="flex-1">
          <Skeleton className="h-12" />
          <div className="mt-6 space-y-4">
            <Skeleton className="h-32" />
            <Skeleton className="h-32" />
            <Skeleton className="h-32" />
          </div>
        </div>
      </div>
    </div>
  );
}