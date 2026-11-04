import type { ElementType, ReactNode } from 'react'

interface Props { children: ReactNode; className?: string; as?: ElementType; wide?: boolean }

export function Container({ children, className = '', as: Tag = 'div', wide = false }: Props) {
  return <Tag className={`mx-auto w-full px-gutter ${wide ? 'max-w-[1800px]' : 'max-w-[1440px]'} ${className}`}>{children}</Tag>
}
