/**
 * Hand-rolled SplitText. Splits an element's text into lines → words → chars.
 * The original text stays in the DOM inside a visually-hidden span so screen
 * readers read the sentence, and the split spans are aria-hidden.
 */
export interface SplitOptions {
  /** Words (exact, case-sensitive) that receive the `accent` class on every char. */
  accentWords?: string[]
  lineClass?: string
  wordClass?: string
  charClass?: string
  accentClass?: string
}

export interface SplitResult {
  lines: HTMLElement[]
  words: HTMLElement[]
  chars: HTMLElement[]
  accentChars: HTMLElement[]
  revert: () => void
}

export function splitText(el: HTMLElement, opts: SplitOptions = {}): SplitResult {
  const {
    accentWords = [],
    lineClass = 'split-line',
    wordClass = 'split-word',
    charClass = 'split-char',
    accentClass = 'is-accent',
  } = opts

  const original = el.dataset.splitOriginal ?? el.textContent ?? ''
  el.dataset.splitOriginal = original
  el.textContent = ''

  const sr = document.createElement('span')
  sr.className = 'sr-only'
  sr.textContent = original
  el.appendChild(sr)

  const visual = document.createElement('span')
  visual.setAttribute('aria-hidden', 'true')
  visual.style.display = 'block'
  el.appendChild(visual)

  const words: HTMLElement[] = []
  const chars: HTMLElement[] = []
  const accentChars: HTMLElement[] = []

  original.split(/\s+/).filter(Boolean).forEach((word, i, arr) => {
    const w = document.createElement('span')
    w.className = wordClass
    const isAccent = accentWords.includes(word)
    for (const ch of Array.from(word)) {
      const c = document.createElement('span')
      c.className = isAccent ? `${charClass} ${accentClass}` : charClass
      c.textContent = ch
      w.appendChild(c)
      chars.push(c)
      if (isAccent) accentChars.push(c)
    }
    visual.appendChild(w)
    words.push(w)
    if (i < arr.length - 1) visual.appendChild(document.createTextNode(' '))
  })

  // Group words into lines by their rendered top offset.
  // Measure everything first: moving nodes mid-measure would reflow the rest.
  const tops = words.map((w) => w.offsetTop)
  const lines: HTMLElement[] = []
  let currentTop: number | null = null
  let currentLine: HTMLElement | null = null
  words.forEach((w, i) => {
    const top = tops[i]
    if (currentTop === null || Math.abs(top - currentTop) > 2) {
      currentTop = top
      currentLine = document.createElement('span')
      currentLine.className = lineClass
      lines.push(currentLine)
    }
    if (currentLine!.childNodes.length) {
      const sp = document.createElement('span')
      sp.className = 'split-space'
      sp.textContent = ' '
      currentLine!.appendChild(sp)
    }
    currentLine!.appendChild(w)
  })
  visual.replaceChildren(...lines)

  return {
    lines,
    words,
    chars,
    accentChars,
    revert: () => {
      el.textContent = original
    },
  }
}
