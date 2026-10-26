import type { Card, ResourceType, User } from "../models"
import { advanceRingJourney } from './ringHelper'

export const sellCard = (user: User, card: Card) => {
    user.coinCount += card.chapter;
}

// Resolve the coin payment after applying chains and available resources.
const resolveCardCost = (user: User, card: Card) => {
    if (card.chainSymbol !== null && user.ownedChainSymbols.includes(card.chainSymbol)) {
        return 0
    }

    if (typeof card.cost === 'number') {
        return card.cost
    }

    const availableResources = [...user.resources]
    let coinCost = 0

    for (const resource of card.cost) {
        const index = availableResources.indexOf(resource)
        if (index === -1) {
            coinCost += 1
        } else {
            availableResources.splice(index, 1)
        }
    }

    return coinCost
}

export const canAcquireCard = (user: User, card: Card) => {
    return user.coinCount >= resolveCardCost(user, card)
}

export const getCardCoinCost = (user: User, card: Card) => resolveCardCost(user, card)

export const acquireCardForUser = (user: User, card: Card) => {
    if (!canAcquireCard(user, card)) throw new Error('Not enough coins to acquire this card.')
    const updated: User = {
        ...user,
        ownedCards: [...user.ownedCards],
        resources: [...user.resources],
        raceObtained: [...user.raceObtained],
        ownedChainSymbols: [...user.ownedChainSymbols],
        coinCount: user.coinCount - resolveCardCost(user, card),
    }
    addCardToUser(updated, card)
    return updated
}

export const addCardToUser = (user: User, card: Card) => {
    user.ownedCards.push(card)

    if (card.type === 'resource' && card.resourceType) {
        user.resources.push(...Array<ResourceType>(card.value).fill(card.resourceType))
    }

    if (card.type === 'gold') {
        user.coinCount += card.value
    }

    if (card.type === 'ring') {
        advanceRingJourney(user, card.value)
    }

    if (card.type === 'alliance' && card.race) {
        user.raceObtained.push(card.race)
    }

    if (card.type === 'military') {
        // TODO: show "the add units to territory" UI to the user
    }
}

export const removeCardFromUser = (user: User, cardId: string) => {
    user.ownedCards = user.ownedCards.filter((card) => card.id !== cardId)
    // Remove the corresponding resource if the card was a resource card
    const card = user.ownedCards.find((c) => c.id === cardId)
    if (!card) {
        throw new Error(`Card with ID ${cardId} not found in user's owned cards.`)
    }

    if (card.type === 'resource') {
        user.resources = user.resources.filter((r) => r !== card.resourceType)
    }

    if (card.type === 'alliance' && card.race) {
        user.raceObtained = user.raceObtained.filter((r) => r !== card.race)
    }

    // gold, ring, and military cards do not have any additional effects when removed

    // return the card to be added to the game's discarded cards pile
    return card;
}
