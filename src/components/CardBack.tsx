import type { Chapter } from '../models'

const runePaths = {
  1: 'M24 22 L76 30 L42 79 Z M24 22 L42 79 M34 30 L64 35 L44 63 Z',
  2: 'M33 82 L33 19 L75 27 L34 49 M34 49 L70 82 M42 29 L60 32 L42 41',
  3: 'M17 75 L72 23 L79 80 Z M31 69 L65 39 L69 71 Z',
}

export default function CardBack({ chapter }: { chapter: Chapter }) {
  return (
    <span className={`card-face card-back card-back-${chapter}`}>
      <span className="card-back-frame" />
      <svg className="card-back-rune" viewBox="0 0 100 100" aria-hidden="true">
        <path d={runePaths[chapter]} />
      </svg>
      <span className="card-back-chapter">{chapter}</span>
    </span>
  )
}
