import { Skeleton } from "@/components/ui/skeleton";

const DashboardShellSkeleton = () => {
  return (
    <div className="flex min-h-[calc(100svh-3.5625rem)] w-full flex-1 bg-background">
      <aside className="sticky top-[3.5625rem] hidden h-[calc(100svh-3.5625rem)] w-64 shrink-0 self-start border-r border-border/70 bg-sidebar px-2 pt-4 md:block">
        <div className="space-y-5">
          {[0, 1, 2].map((group) => (
            <div key={group} className="space-y-2 px-1.5">
              <Skeleton className="h-2.5 w-16" />
              <Skeleton className="h-9 w-full rounded-lg" />
              <Skeleton className="h-9 w-full rounded-lg" />
              {group === 0 ? <Skeleton className="h-9 w-full rounded-lg" /> : null}
            </div>
          ))}
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col bg-muted/20">
        <div className="flex h-16 shrink-0 items-center gap-3 border-b border-border/70 bg-background px-4 sm:px-6 lg:px-8">
          <Skeleton className="size-7 rounded-md" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-2.5 w-32" />
            <Skeleton className="h-4 w-24" />
          </div>
        </div>

        <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <Skeleton className="h-52 w-full rounded-2xl" />
        </div>
      </div>
    </div>
  );
};

export default DashboardShellSkeleton;
