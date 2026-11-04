import { useId, useRef, type KeyboardEvent, type ReactNode } from 'react'
import { AnimatePresence, LayoutGroup, m } from 'motion/react'
import { useReducedMotion } from '@/hooks/useReducedMotion'

export interface Tab { id: string; label: string }
interface Props {
  tabs: Tab[]
  active: string
  onChange: (id: string) => void
  children: (id: string) => ReactNode
  label: string
}

/** Accessible tabs: roving tabindex, arrow keys, layoutId sliding indicator, cross-fade panels. */
export function Tabs({ tabs, active, onChange, children, label }: Props) {
  const id = useId()
  const list = useRef<HTMLDivElement>(null)
  const reduced = useReducedMotion()

  const onKeyDown = (e: KeyboardEvent) => {
    const i = tabs.findIndex((t) => t.id === active)
    let next = i
    if (e.key === 'ArrowRight') next = (i + 1) % tabs.length
    else if (e.key === 'ArrowLeft') next = (i - 1 + tabs.length) % tabs.length
    else if (e.key === 'Home') next = 0
    else if (e.key === 'End') next = tabs.length - 1
    else return
    e.preventDefault()
    onChange(tabs[next].id)
    list.current?.querySelectorAll<HTMLButtonElement>('[role="tab"]')[next]?.focus()
  }

  return (
    <LayoutGroup id={id}>
      <div ref={list} role="tablist" aria-label={label} onKeyDown={onKeyDown} className="-mx-gutter flex gap-1 overflow-x-auto border-b border-steel/70 px-gutter md:mx-0 md:px-0">
        {tabs.map((t) => {
          const on = t.id === active
          return (
            <button
              key={t.id}
              type="button"
              role="tab"
              id={`${id}-tab-${t.id}`}
              aria-selected={on}
              aria-controls={`${id}-panel-${t.id}`}
              tabIndex={on ? 0 : -1}
              onClick={() => onChange(t.id)}
              className={`relative shrink-0 px-4 py-4 font-body text-[13px] font-semibold uppercase tracking-[0.14em] transition-colors duration-fast ${on ? 'text-amber' : 'text-bone/60 hover:text-bone'}`}
            >
              {t.label}
              {on && <m.span layoutId="tab-indicator" className="absolute inset-x-0 -bottom-px h-0.5 bg-amber" transition={reduced ? { duration: 0 } : { type: 'spring', stiffness: 400, damping: 36 }} />}
            </button>
          )
        })}
      </div>
      <div className="relative mt-10">
        <AnimatePresence mode="wait" initial={false}>
          <m.div
            key={active}
            role="tabpanel"
            id={`${id}-panel-${active}`}
            aria-labelledby={`${id}-tab-${active}`}
            initial={{ opacity: 0, x: reduced ? 0 : 24 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: reduced ? 0 : -24 }}
            transition={{ duration: reduced ? 0.2 : 0.4, ease: [0.16, 1, 0.3, 1] }}
          >
            {children(active)}
          </m.div>
        </AnimatePresence>
      </div>
    </LayoutGroup>
  )
}
