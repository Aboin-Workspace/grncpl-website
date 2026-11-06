import { lazy, Suspense, useEffect, useMemo, useRef, useState } from 'react'
import { COMPLETED_PROJECTS, COMPLETED_PROJECTS_COLUMNS as COL, COMPLETED_PROJECTS_TITLE, PROJECT_FILTERS, PRODUCTION, PRODUCTION_GRAND_TOTAL, PRODUCTION_SERIES, PRODUCTION_TITLE, STATE_NAMES, type Client, type CompletedProject, type StateId } from '@/data/projects'
import { ProjectMap } from '@/components/works/ProjectMap'
import { Seo } from '@/components/ui/Seo'
import { Section, Eyebrow } from '@/components/layout/Section'
import { SplitText } from '@/components/motion/SplitText'
import { Reveal } from '@/components/motion/Reveal'
import { Counter } from '@/components/motion/Counter'
import { DataTable, type Column } from '@/components/ui/DataTable'
import { useReducedMotion } from '@/hooks/useReducedMotion'

const ProductionChart = lazy(() => import('@/components/charts/ProductionChart'))

const toDate = (d: string) => {
  const [dd, mm, yyyy] = d.split('-').map(Number)
  return new Date(yyyy, mm - 1, dd).getTime()
}

export default function CompletedProjects() {
  const [filter, setFilter] = useState<Client | 'All'>('All')
  const [state, setState] = useState<StateId | 'All'>('All')
  const rows = useMemo(() => COMPLETED_PROJECTS.filter((r) => (filter === 'All' || r.client === filter) && (state === 'All' || r.state === state)), [filter, state])
  const reduced = useReducedMotion()
  const chartRef = useRef<HTMLDivElement>(null)
  const [chartIn, setChartIn] = useState(false)
  useEffect(() => {
    const el = chartRef.current
    if (!el) return
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setChartIn(true); io.disconnect() } }, { threshold: 0.3 })
    io.observe(el)
    return () => io.disconnect()
  }, [])

  const columns: Column<CompletedProject>[] = [
    { key: 'sno', label: COL.sno, mobileHidden: true, className: 'w-16' },
    { key: 'name', label: COL.name, sortable: true },
    { key: 'from', label: COL.from, sortable: true, className: 'w-36 whitespace-nowrap' },
    { key: 'to', label: COL.to, sortable: true, className: 'w-36 whitespace-nowrap' },
    { key: 'quantity', label: COL.quantity, sortable: true, align: 'right', className: 'w-44', render: (r) => r.quantity.toFixed(2) },
  ]
  const comparators = {
    from: (a: CompletedProject, b: CompletedProject) => toDate(a.from) - toDate(b.from),
    to: (a: CompletedProject, b: CompletedProject) => toDate(a.to) - toDate(b.to),
    name: (a: CompletedProject, b: CompletedProject) => a.name.localeCompare(b.name),
  }

  return (
    <>
      <Seo path="/completed-projects/" />
      <Section className="pt-40 md:pt-48">
        <Eyebrow>Works</Eyebrow>
        <SplitText as="h1" text={COMPLETED_PROJECTS_TITLE} immediate className="mt-4 font-display text-display-xl uppercase text-bone" />
        <Reveal className="mt-12 md:mt-16">
          <ProjectMap active={state} onChange={setState} />
        </Reveal>
        <Reveal className="mt-14 flex flex-wrap items-center gap-2" aria-label="Filter by client">
          {PROJECT_FILTERS.map((f) => (
            <button
              key={f.value}
              type="button"
              aria-pressed={filter === f.value}
              onClick={() => setFilter(f.value)}
              className={`border px-4 py-2 font-body text-[13px] font-semibold uppercase tracking-[0.14em] transition-colors duration-fast ${filter === f.value ? 'border-amber bg-amber text-ink' : 'border-steel text-bone/70 hover:border-bone/60 hover:text-bone'}`}
            >
              {f.label}
            </button>
          ))}
          {state !== 'All' && (
            <button type="button" onClick={() => setState('All')} className="ml-2 border border-amber/60 px-3 py-2 font-body text-[12px] uppercase tracking-[0.14em] text-amber hover:bg-amber hover:text-ink">
              {STATE_NAMES[state]} ×<span className="sr-only"> clear state filter</span>
            </button>
          )}
        </Reveal>
        <div className="mt-8">
          <DataTable columns={columns} rows={rows} rowKey={(r) => r.sno} caption={COMPLETED_PROJECTS_TITLE} titleKey="name" comparators={comparators} />
        </div>
        <p className="mt-4 font-body text-xs text-bone/60">{rows.length} of {COMPLETED_PROJECTS.length} projects</p>
      </Section>

      <Section tone="coal" aria-labelledby="production-heading">
        <div className="grid gap-10 lg:grid-cols-12 lg:items-end">
          <div className="lg:col-span-7">
            <Eyebrow>2019-20 → 2025-26 Estd.</Eyebrow>
            <SplitText as="h2" text={PRODUCTION_TITLE} className="mt-4 font-display text-display-lg uppercase text-bone" />
            <span id="production-heading" className="sr-only">{PRODUCTION_TITLE}</span>
          </div>
          <Reveal stagger className="grid grid-cols-2 gap-6 lg:col-span-5">
            <div className="border-l border-steel pl-4">
              <p className="font-display text-[clamp(2.5rem,5vw,5rem)] leading-none text-bone"><Counter value={PRODUCTION_GRAND_TOTAL.coal} decimals={2} /></p>
              <p className="mt-3 font-body text-eyebrow uppercase text-bone/60">{PRODUCTION_GRAND_TOTAL.label} · {PRODUCTION_SERIES.coal}</p>
            </div>
            <div className="border-l border-amber pl-4">
              <p className="font-display text-[clamp(2.5rem,5vw,5rem)] leading-none text-amber"><Counter value={PRODUCTION_GRAND_TOTAL.ob} decimals={2} /></p>
              <p className="mt-3 font-body text-eyebrow uppercase text-bone/60">{PRODUCTION_GRAND_TOTAL.label} · {PRODUCTION_SERIES.ob}</p>
            </div>
          </Reveal>
        </div>
        <div ref={chartRef} className="mt-12 min-h-[380px]">
          {chartIn && (
            <Suspense fallback={<div className="h-[380px] animate-pulse bg-ink/40" />}>
              <ProductionChart animate={!reduced} />
            </Suspense>
          )}
        </div>
        {/* Data table for assistive tech + no-JS reading of the exact figures */}
        <table className="mt-10 w-full border-collapse text-left font-body text-sm">
          <caption className="sr-only">{PRODUCTION_TITLE}</caption>
          <thead>
            <tr className="border-b border-steel text-eyebrow uppercase text-bone/60">
              <th scope="col" className="py-3 pr-4">Year</th>
              <th scope="col" className="py-3 pr-4 text-right">{PRODUCTION_SERIES.coal}</th>
              <th scope="col" className="py-3 text-right">{PRODUCTION_SERIES.ob}</th>
            </tr>
          </thead>
          <tbody>
            {PRODUCTION.map((r) => (
              <tr key={r.year} className="border-b border-steel/50 text-bone/80">
                <td className="py-2 pr-4">{r.year}</td>
                <td className="py-2 pr-4 text-right tabular-nums">{r.coal.toFixed(2)}</td>
                <td className="py-2 text-right tabular-nums">{r.ob.toFixed(2)}</td>
              </tr>
            ))}
            <tr className="font-semibold text-bone">
              <td className="py-3 pr-4">{PRODUCTION_GRAND_TOTAL.label}</td>
              <td className="py-3 pr-4 text-right tabular-nums">{PRODUCTION_GRAND_TOTAL.coal.toFixed(2)}</td>
              <td className="py-3 text-right tabular-nums text-amber">{PRODUCTION_GRAND_TOTAL.ob.toFixed(2)}</td>
            </tr>
          </tbody>
        </table>
      </Section>
    </>
  )
}
