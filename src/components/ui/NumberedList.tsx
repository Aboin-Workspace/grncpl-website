import { Reveal } from '@/components/motion/Reveal'

interface Props { items: readonly string[]; className?: string; start?: number }

/** List as numbered amber-rule rows that reveal on scroll. */
export function NumberedList({ items, className = '', start = 1 }: Props) {
  return (
    <Reveal as="ol" stagger className={`border-t border-steel/70 ${className}`}>
      {items.map((item, i) => (
        <li key={i} className="grid grid-cols-[3rem_1fr] gap-4 border-b border-steel/70 py-5 md:grid-cols-[5rem_1fr] md:py-6">
          <span className="font-display text-display-sm text-amber" aria-hidden="true">{String(start + i).padStart(2, '0')}</span>
          <span className="max-w-measure font-body text-body-lg text-bone/85">{item}</span>
        </li>
      ))}
    </Reveal>
  )
}
