import type { Card } from '../models'

export interface ChapterCard extends Card {
    /** IDs of cards that must be removed before this card is available. */
    isCoveredBy: Card['id'][]
}

/** One independent chapter layout. Cards are supplied with their coverage links. */
export class ChapterEngine {
    private readonly chapterCardList = new Map<Card['id'], ChapterCard>()
    private readonly coveredCardMap = new Map<Card['id'], Set<Card['id']>>()
    private readonly coveringCardMap = new Map<Card['id'], Set<Card['id']>>()

    constructor(cards: readonly ChapterCard[]) {
        for (const card of cards) {
            if (this.chapterCardList.has(card.id)) {
                throw new Error(`Duplicate card ID: ${card.id}`)
            }
            if (cards[0] && card.chapter !== cards[0].chapter) {
                throw new Error('All cards must belong to the same chapter.')
            }
            this.chapterCardList.set(card.id, this.copyCard(card))
            this.coveringCardMap.set(card.id, new Set(card.isCoveredBy))
            this.coveredCardMap.set(card.id, new Set())
        }

        for (const [cardId, coveringIds] of this.coveringCardMap) {
            for (const coveringId of coveringIds) {
                const coveredIds = this.coveredCardMap.get(coveringId)
                if (!coveredIds) {
                    throw new Error(`Unknown covering card ID: ${coveringId}`)
                }
                coveredIds.add(cardId)
            }
        }

        // A cycle would leave cards permanently inaccessible.
        const remaining = new Map(
            [...this.coveringCardMap].map(([id, covering]) => [id, covering.size]),
        )
        const available = [...remaining].filter(([, count]) => count === 0).map(([id]) => id)
        let visited = 0
        while (available.length > 0) {
            const id = available.pop()!
            visited += 1
            for (const coveredId of this.coveredCardMap.get(id)!) {
                const count = remaining.get(coveredId)! - 1
                remaining.set(coveredId, count)
                if (count === 0) available.push(coveredId)
            }
        }
        if (visited !== cards.length) {
            throw new Error('Card coverage must not contain cycles.')
        }
    }

    get revealedCards(): ChapterCard[] {
        return [...this.chapterCardList.values()]
            .filter(card => this.coveringCardMap.get(card.id)!.size === 0)
            .map(card => this.copyCard(card))
    }

    get cards(): ChapterCard[] {
        return [...this.chapterCardList.values()].map(card => this.copyCard(card))
    }

    get isComplete(): boolean {
        return this.chapterCardList.size === 0
    }

    /** Remove an available card after it is acquired, sold, or otherwise selected. */
    removeCard(cardId: Card['id']): ChapterCard {
        const card = this.chapterCardList.get(cardId)
        if (!card) {
            throw new Error(`Card not found in chapter: ${cardId}`)
        }
        if (this.coveringCardMap.get(cardId)!.size > 0) {
            throw new Error(`Card is still covered: ${cardId}`)
        }

        for (const coveredId of this.coveredCardMap.get(cardId)!) {
            this.coveringCardMap.get(coveredId)!.delete(cardId)
            const coveredCard = this.chapterCardList.get(coveredId)!
            coveredCard.isCoveredBy = [...this.coveringCardMap.get(coveredId)!]
        }
        this.chapterCardList.delete(cardId)
        this.coveringCardMap.delete(cardId)
        this.coveredCardMap.delete(cardId)
        return this.copyCard(card)
    }

    private copyCard(card: ChapterCard): ChapterCard {
        return {
            ...card,
            cost: Array.isArray(card.cost) ? [...card.cost] : card.cost,
            isCoveredBy: [...card.isCoveredBy],
        }
    }
}
