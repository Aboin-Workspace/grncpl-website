import { useId, useRef, type KeyboardEvent } from 'react'
import { LayoutGroup, m } from 'motion/react'
import { useReducedMotion } from '@/hooks/useReducedMotion'

export interface FleetTab { id: string; label: string; units: number }
interface Props {
  tabs: FleetTab[]
  active: string
  onChange: (id: string) => void
  label: string
  /** ids used to link panels: `${id}-panel-<tab>` */
  idBase?: string
}

/**
 * Fleet category rail. Vertical tablist on desktop (numbered, with unit counts),
 * horizontal scroll strip on small screens. Roving tabindex + arrow keys.
 */
export function FleetSelector({ tabs, active, onChange, label, idBase }: Props) {
  const gen = useId()
  const id = idBase ?? gen
  const list = useRef<HTMLDivElement>(null)
  const reduced = useReducedMotion()

  const onKeyDown = (e: KeyboardEvent) => {
    const i = tabs.findIndex((t) => t.id === active)
    let next = i
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') next = (i + 1) % tabs.length
    else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') next = (i - 1 + tabs.length) % tabs.length
    else if (e.key === 'Home') next = 0
    else if (e.key === 'End') next = tabs.length - 1
    else return
    e.preventDefault()
    onChange(tabs[next].id)
    list.current?.querySelectorAll<HTMLButtonElement>('[role="tab"]')[next]?.focus()
  }

  return (
    <LayoutGroup id={id}>
      <div
        ref={list}
        role="tablist"
        aria-label={label}
        aria-orientation="vertical"
        onKeyDown={onKeyDown}
        className="-mx-gutter flex gap-1 overflow-x-auto px-gutter lg:mx-0 lg:flex-col lg:gap-0 lg:overflow-visible lg:px-0"
      >
        {tabs.map((t, i) => {
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
              data-cursor-grow
              className={`group relative flex shrink-0 items-center gap-4 border-b border-steel/50 px-3 py-4 text-left transition-colors duration-fast lg:w-full lg:px-0 lg:py-5 ${on ? 'text-bone' : 'text-bone/55 hover:text-bone'}`}
            >
              {on && (
                <m.span
                  layoutId="fleet-indicator"
                  className="absolute inset-x-0 -bottom-px h-0.5 bg-amber lg:inset-y-0 lg:left-0 lg:h-auto lg:w-0.5"
                  transition={reduced ? { duration: 0 } : { type: 'spring', stiffness: 380, damping: 34 }}
                  aria-hidden="true"
                />
              )}
              <span className={`font-body text-[11px] hud-mono lg:pl-5 ${on ? 'text-amber' : 'text-bone/40'}`} aria-hidden="true">{String(i + 1).padStart(2, '0')}</span>
              <span className="font-display text-[1.35rem] uppercase leading-none tracking-[0.02em] lg:text-[1.9rem]">{t.label}</span>
              <span className={`ml-auto hidden font-body text-[11px] hud-mono lg:inline ${on ? 'text-bone' : 'text-bone/40'}`}>
                {t.units}<span className="sr-only"> units</span>
              </span>
            </button>
          )
        })}
      </div>
    </LayoutGroup>
  )
}
