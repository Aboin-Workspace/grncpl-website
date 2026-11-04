import { SplitText } from '@/components/motion/SplitText'

export function PullQuote({ text, className = '' }: { text: string; className?: string }) {
  return (
    <blockquote className={`border-l-2 border-amber pl-6 md:pl-10 ${className}`}>
      <SplitText as="p" by="words" text={text} className="font-display text-display-md uppercase leading-[0.95] text-bone" />
    </blockquote>
  )
}
