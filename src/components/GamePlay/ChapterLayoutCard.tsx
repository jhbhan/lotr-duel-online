import { useState } from 'react'
import type { Card, User } from '../../models'
import { canAcquireCard, getCardCoinCost } from '../../engine/cardHelper'
import CardBack from '../CardBack'
import CardFront, { describeCard } from '../CardFront'

export default function ChapterLayoutCard({
  card,
  player,
  available,
  initiallyFaceUp,
  onBuy,
  onSell,
}: {
  card: Card
  player: User
  available: boolean
  initiallyFaceUp: boolean
  onBuy: () => void
  onSell: () => void
}) {
  const [actionsOpen, setActionsOpen] = useState(false)
  const faceUp = initiallyFaceUp || available
  const cost = getCardCoinCost(player, card)
  const isGold = card.type === 'gold'
  const canBuy = canAcquireCard(player, card)

  return (
    <div
      className={`chapter-layout-card ${faceUp ? 'face-up' : 'face-down'}${available ? ' available' : ''}${available && !initiallyFaceUp ? ' revealing' : ''}${actionsOpen ? ' actions-open' : ''}`}
      role="group"
      tabIndex={available ? 0 : undefined}
      aria-disabled={!available}
      aria-label={`${available ? 'Available' : 'Covered'} ${faceUp ? describeCard(card) : 'hidden card'}`}
      onClick={() => {
        if (available) setActionsOpen(true)
      }}
      onMouseLeave={() => setActionsOpen(false)}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) setActionsOpen(false)
      }}
    >
      <span className="card-flip" aria-hidden="true">
        <CardBack chapter={card.chapter} />
        {card.chapter === 1 ? (
          <CardFront card={card} hideFreeCost />
        ) : (
          <span className="card-face card-front">✧</span>
        )}
      </span>
      {available && (
        <div className={`chapter-card-actions${isGold ? ' single-action' : ''}`}>
          <button
            type="button"
            className="card-hover-action"
            disabled={!canBuy}
            onClick={(event) => {
              event.stopPropagation()
              onBuy()
            }}
            title={
              isGold
                ? `Gain ${card.value} coins`
                : canBuy
                  ? `Buy: ${cost === 0 ? 'free' : `${cost} coins`}`
                  : `Buy: requires ${cost} coins; you have ${player.coinCount}`
            }
            aria-label={
              isGold
                ? `Gain ${card.value} coins`
                : `Buy ${describeCard(card)} for ${cost === 0 ? 'free' : `${cost} coins`}`
            }
          >
            <span aria-hidden="true">{isGold ? `+${card.value}` : `−${cost}`}</span>
            <span className="action-coin" aria-hidden="true" />
          </button>
          {!isGold && (
            <button
              type="button"
              className="card-hover-action"
              onClick={(event) => {
                event.stopPropagation()
                onSell()
              }}
              title={`Sell: gain ${card.chapter} coins`}
              aria-label={`Sell ${describeCard(card)} for ${card.chapter} coins`}
            >
              <span aria-hidden="true">+{card.chapter}</span>
              <span className="action-coin" aria-hidden="true" />
            </button>
          )}
        </div>
      )}
    </div>
  )
}
