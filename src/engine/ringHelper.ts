import type { User } from '../models'

export const RING_JOURNEY_GOAL = 12

/** Each faction needs twelve advances from its own starting position. */
export const advanceRingJourney = (user: User, steps: number) => {
    if (!Number.isSafeInteger(steps) || steps < 0) {
        throw new Error('Ring journey steps must be a non-negative safe integer.')
    }
    if (!Number.isSafeInteger(user.ringJourney) || user.ringJourney < 0) {
        throw new Error('Ring journey position must be a non-negative safe integer.')
    }
    user.ringJourney = Math.min(RING_JOURNEY_GOAL, user.ringJourney + steps)
    return user.ringJourney
}

export const hasCompletedRingJourney = (user: User) => user.ringJourney >= RING_JOURNEY_GOAL

export const getRemainingRingSteps = (user: User) => Math.max(0, RING_JOURNEY_GOAL - user.ringJourney)

/** Remove departed Fellowship spaces; its marker remains twelve spaces from Sauron's start. */
export function getRingTrack(fellowship: User, sauron: User) {
    const fellowshipSteps = Math.min(RING_JOURNEY_GOAL, fellowship.ringJourney)
    const visibleNodes = Array.from({ length: 25 }, (_, index) => index)
        .filter(index => index < 12 || index >= 12 + fellowshipSteps)
    return visibleNodes.map((originalIndex, index) => ({
        id: originalIndex,
        bonus: originalIndex > 0 && originalIndex % 3 === 0 && originalIndex !== 12 && originalIndex !== 24,
        destination: originalIndex === 24,
        fellowship: index === 12,
        sauron: index === Math.min(RING_JOURNEY_GOAL, sauron.ringJourney),
    }))
}
