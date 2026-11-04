/** Branded fallback while a route chunk loads: amber strata line sweeping under the mark. */
export function RouteLoader() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-ink" role="status" aria-label="Loading page">
      <div className="w-40">
        <p className="text-center font-display text-display-sm uppercase tracking-[0.08em] text-bone/70">GRN</p>
        <div className="relative mt-3 h-px w-full overflow-hidden bg-steel">
          <span className="loader-sweep absolute inset-y-0 left-0 w-1/3 bg-amber" />
        </div>
      </div>
    </div>
  )
}
