import type { Card, ResourceType, User } from "../models"
import { advanceRingJourney } from './ringHelper'

export const sellCard = (user: User, card: Card) => {
    user.coinCount += card.chapter;
}

export const getCost = (user: User, cost: ResourceType[]) => {
    const availableResources = [...user.resources]
    let optionalOneAvailable = user.hasOptionalOne
    let optionalTwoAvailable = user.hasOptionalTwo
    let optionalAnyAvailable = user.hasOptionalAny
    let coinCost = 0

    for (const resource of cost) {
        const index = availableResources.indexOf(resource)
        if (index === -1) {
            if (optionalOneAvailable && (resource === 'ruse' || resource === 'strength' || resource === 'courage')) {
                optionalOneAvailable = false
            } else if (optionalTwoAvailable && (resource === 'knowledge' || resource === 'leadership')) {
                optionalTwoAvailable = false
            } else if (optionalAnyAvailable) {
                optionalAnyAvailable = false
            } else {
                coinCost += 1
            }
        } else {
            availableResources.splice(index, 1)
        }
    }

    return coinCost
}

// Resolve the coin payment after applying chains and available resources.
const resolveCardCost = (user: User, card: Card) => {
    if (card.chainSymbol !== null && user.ownedChainSymbols.includes(card.chainSymbol)) {
        return 0
    }

    return card.cost.coins + getCost(user, card.cost.resources)
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
    if (card.chainSymbol !== null) user.ownedChainSymbols.push(card.chainSymbol)
    if (card.specialEffect?.includes('optional-resource-crs')) user.hasOptionalOne = true
    if (card.specialEffect?.includes('optional-resource-kl')) user.hasOptionalTwo = true

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

}

export const removeCardFromUser = (user: User, cardId: string) => {
    const card = user.ownedCards.find(c => c.id === cardId)
    if (!card) throw new Error('Card not owned.')
    user.ownedCards = user.ownedCards.filter(c => c.id !== cardId)
    if (card.chainSymbol !== null && !user.ownedCards.some(c => c.chainSymbol === card.chainSymbol)) {
        user.ownedChainSymbols = user.ownedChainSymbols.filter(symbol => symbol !== card.chainSymbol)
    }
    if (card.type === 'resource' && card.resourceType) {
        for (let i = 0; i < card.value; i++) {
            const index = user.resources.indexOf(card.resourceType)
            if (index >= 0) user.resources.splice(index, 1)
        }
    }
    if (card.type === 'alliance' && card.race) {
        user.raceObtained = user.raceObtained.filter((r) => r !== card.race)
    }

    // gold, ring, and military cards do not have any additional effects when removed

    // return the card to be added to the game's discarded cards pile
    return card;
}
