import { useMemo, useState, type ReactNode } from 'react'
import { LayoutGroup, m } from 'motion/react'
import { TABLE } from '@/config/motion'
import { useReducedMotion } from '@/hooks/useReducedMotion'

export interface Column<T> {
  key: keyof T & string
  label: string
  sortable?: boolean
  align?: 'left' | 'right'
  render?: (row: T) => ReactNode
  /** Hide on the mobile card layout (e.g. S.No). */
  mobileHidden?: boolean
  className?: string
}

interface Props<T> {
  columns: Column<T>[]
  rows: T[]
  rowKey: (row: T) => string | number
  caption: string
  /** Column key used as the card title on mobile. */
  titleKey: keyof T & string
  /** Compare function per sortable column; default compares with < >. */
  comparators?: Partial<Record<keyof T & string, (a: T, b: T) => number>>
}

type Dir = 'asc' | 'desc'

/**
 * Sticky-header table with sortable columns. Rows are Framer `layout` items so
 * reorders animate; they rise in on scroll with a stagger. Collapses to cards
 * below md.
 */
export function DataTable<T>({ columns, rows, rowKey, caption, titleKey, comparators }: Props<T>) {
  const [sort, setSort] = useState<{ key: keyof T & string; dir: Dir } | null>(null)
  const reduced = useReducedMotion()

  const sorted = useMemo(() => {
    if (!sort) return rows
    const cmp = comparators?.[sort.key] ?? ((a: T, b: T) => (a[sort.key] < b[sort.key] ? -1 : a[sort.key] > b[sort.key] ? 1 : 0))
    const out = [...rows].sort(cmp)
    return sort.dir === 'asc' ? out : out.reverse()
  }, [rows, sort, comparators])

  const toggle = (key: keyof T & string) =>
    setSort((s) => (s?.key === key ? (s.dir === 'asc' ? { key, dir: 'desc' } : null) : { key, dir: 'asc' }))

  const rowMotion = (i: number) => ({
    layout: !reduced,
    initial: reduced ? undefined : { opacity: 0, y: 12 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, margin: '0px 0px -5% 0px' },
    transition: reduced ? { duration: 0.2 } : { ...TABLE.layoutSpring, opacity: { duration: TABLE.rowDuration, delay: Math.min(i, 12) * TABLE.rowStagger }, y: { duration: TABLE.rowDuration, delay: Math.min(i, 12) * TABLE.rowStagger } },
  })

  return (
    <LayoutGroup>
      {/* Desktop table */}
      <div className="hidden md:block">
        <table className="w-full border-collapse text-left">
          <caption className="sr-only">{caption}</caption>
          <thead className="sticky top-20 z-10 bg-ink/95 backdrop-blur-glass">
            <tr className="border-b border-steel">
              {columns.map((c) => (
                <th key={c.key} scope="col" className={`py-4 pr-4 font-body text-eyebrow uppercase text-bone/60 ${c.align === 'right' ? 'text-right' : ''} ${c.className ?? ''}`} aria-sort={sort?.key === c.key ? (sort.dir === 'asc' ? 'ascending' : 'descending') : undefined}>
                  {c.sortable ? (
                    <button type="button" onClick={() => toggle(c.key)} className={`inline-flex items-center gap-1.5 uppercase hover:text-amber ${sort?.key === c.key ? 'text-amber' : ''}`}>
                      {c.label}
                      <span aria-hidden="true" className="text-[10px]">{sort?.key === c.key ? (sort.dir === 'asc' ? '▲' : '▼') : '◇'}</span>
                    </button>
                  ) : (
                    c.label
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sorted.map((row, i) => (
              <m.tr key={rowKey(row)} {...rowMotion(i)} className="border-b border-steel/60 align-top transition-colors duration-fast hover:bg-coal">
                {columns.map((c) => (
                  <td key={c.key} className={`py-4 pr-4 font-body text-base text-bone/85 ${c.align === 'right' ? 'text-right tabular-nums' : ''} ${c.className ?? ''}`}>
                    {c.render ? c.render(row) : String(row[c.key])}
                  </td>
                ))}
              </m.tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile cards */}
      <ul className="space-y-3 md:hidden" aria-label={caption}>
        {sorted.map((row, i) => (
          <m.li key={rowKey(row)} {...rowMotion(i)} className="border border-steel/70 bg-coal p-5">
            <p className="font-body text-base font-semibold text-bone">{String(row[titleKey])}</p>
            <dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2">
              {columns.filter((c) => c.key !== titleKey && !c.mobileHidden).map((c) => (
                <div key={c.key}>
                  <dt className="font-body text-[11px] uppercase tracking-[0.18em] text-bone/50">{c.label}</dt>
                  <dd className="font-body text-sm tabular-nums text-bone/85">{c.render ? c.render(row) : String(row[c.key])}</dd>
                </div>
              ))}
            </dl>
          </m.li>
        ))}
      </ul>
    </LayoutGroup>
  )
}
