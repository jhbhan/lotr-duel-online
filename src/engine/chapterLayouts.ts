import type { Card, Chapter } from '../models'
import type { ChapterCard } from './chapterEngine'
import { createChapterOneDeck } from '../data/chapterOneCards'

export interface ChapterLayoutRow {
  ids: string[]
  faceUp: boolean
  spread: boolean
}

const rowCounts: Record<Chapter, number[]> = {
  1: [2, 3, 4, 5, 6],
  2: [6, 5, 4, 3, 2],
  3: [2, 3, 4, 2, 4, 3, 2],
}

function cardPosition(chapter: Chapter, rowIndex: number, cardIndex: number, count: number) {
  if (chapter === 3 && rowIndex === 3) return cardIndex === 0 ? -1 : 1
  return cardIndex - (count - 1) / 2
}

/** Placeholder cards and the exact coverage links for the three chapter shapes. */
export function createChapterLayout(chapter: Chapter, sourceDeck?: readonly Card[]) {
  const counts = rowCounts[chapter]
  const deck = sourceDeck ?? (chapter === 1 ? createChapterOneDeck() : [])
  let offset = 0
  const rows: ChapterLayoutRow[] = counts.map((count, rowIndex) => {
    const row = {
      ids: Array.from({ length: count }, (_, index) => deck[offset + index]?.id ?? `chapter-${chapter}-row-${rowIndex}-card-${index}`),
      faceUp: rowIndex % 2 === 0,
      spread: chapter === 3 && rowIndex === 3,
    }
    offset += count
    return row
  })
  const deckById = new Map(deck.map(card => [card.id, card]))

  const cards: ChapterCard[] = rows.flatMap((row, rowIndex) => row.ids.map((id, cardIndex) => {
    const position = cardPosition(chapter, rowIndex, cardIndex, row.ids.length)
    const coveringRow = rows[rowIndex + 1]
    const isCoveredBy = coveringRow?.ids.filter((_, coveringIndex) => {
      const coveringPosition = cardPosition(chapter, rowIndex + 1, coveringIndex, coveringRow.ids.length)
      return Math.abs(position - coveringPosition) <= 0.5
    }) ?? []

    return {
      id,
      chapter,
      type: 'resource' as const,
      value: 0,
      resourceType: null,
      race: null,
      chainSymbol: null,
      cost: [],
      territories: [],
      ...deckById.get(id),
      isCoveredBy,
    }
  }))

  return { rows, cards, discardedCards: deck.slice(offset) }
}
