export default function CoinAmount({
  count,
  className = '',
}: {
  count: number
  className?: string
}) {
  return (
    <span
      className={`coin-amount effect-icon effect-coin ${className}`}
      role="img"
      aria-label={`${count} coins`}
      title={`${count} coins`}
    >
      {count}
    </span>
  )
}
