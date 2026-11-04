import type { ElementType, ReactNode } from 'react'
import { Container } from './Container'

interface Props {
  children: ReactNode
  className?: string
  as?: ElementType
  id?: string
  /** 'ink' (default) or 'coal' surface. */
  tone?: 'ink' | 'coal' | 'ochre'
  /** Skip the inner container (full-bleed content). */
  bleed?: boolean
  'aria-labelledby'?: string
}

const tones = { ink: 'bg-ink', coal: 'bg-coal', ochre: 'bg-ochre' }

export function Section({ children, className = '', as: Tag = 'section', id, tone = 'ink', bleed = false, ...rest }: Props) {
  return (
    <Tag id={id} className={`relative py-section-y ${tones[tone]} ${className}`} {...rest}>
      {bleed ? children : <Container>{children}</Container>}
    </Tag>
  )
}

export function Eyebrow({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <p className={`font-body text-eyebrow uppercase text-amber ${className}`}>{children}</p>
}
