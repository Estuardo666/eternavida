export default function PublicLoading() {
  return (
    <div className="bg-gradient-to-b from-[#72b25514] via-white to-white">
      <section className="w-full py-4 sm:py-6 lg:py-8">
        <div className="space-y-5 lg:space-y-0">
          <div className="relative w-full overflow-hidden border-y border-border-soft bg-surface-canvas shadow-sm sm:border">
            <div className="relative min-h-[540px] animate-pulse bg-surface-soft sm:min-h-[620px] lg:min-h-[680px]" />
          </div>
        </div>
      </section>

      <section className="container py-8 sm:py-10 lg:py-12">
        <div className="flex gap-4 overflow-hidden">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="min-w-[220px] flex-1 animate-pulse rounded-[24px] bg-surface-soft"
              style={{ aspectRatio: "3/4" }}
            />
          ))}
        </div>
      </section>

      <section className="container py-8 sm:py-10 lg:py-12">
        <div className="grid items-center gap-8 lg:grid-cols-2 lg:gap-12">
          <div className="animate-pulse rounded-[32px] bg-surface-soft" style={{ aspectRatio: "4/3" }} />
          <div className="space-y-4">
            <div className="h-4 w-20 animate-pulse rounded-full bg-surface-soft" />
            <div className="h-8 w-3/4 animate-pulse rounded-lg bg-surface-soft" />
            <div className="h-4 w-full animate-pulse rounded bg-surface-soft" />
            <div className="h-4 w-2/3 animate-pulse rounded bg-surface-soft" />
          </div>
        </div>
      </section>

      <section className="container py-8 sm:py-10 lg:py-12">
        <div className="flex gap-4 overflow-hidden">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="min-w-[220px] flex-1 animate-pulse rounded-[24px] bg-surface-soft"
              style={{ aspectRatio: "3/4" }}
            />
          ))}
        </div>
      </section>

      <section className="container py-4 sm:py-6">
        <div className="animate-pulse rounded-[32px] bg-surface-soft" style={{ aspectRatio: "3/1" }} />
      </section>

      <section className="w-full py-8 sm:py-10 lg:py-12">
        <div className="container space-y-8">
          <div className="mx-auto h-4 w-48 animate-pulse rounded-full bg-surface-soft" />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="animate-pulse rounded-[28px] bg-surface-soft" style={{ aspectRatio: "4/3" }} />
            ))}
          </div>
        </div>
      </section>

      <section className="container py-12 sm:py-16 lg:py-20">
        <div className="animate-pulse rounded-[36px] border border-border-soft bg-surface-soft" style={{ aspectRatio: "3/1" }} />
      </section>
    </div>
  );
}