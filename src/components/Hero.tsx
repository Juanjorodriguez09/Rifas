import type { RaffleConfig } from '../types'
import { formatDate } from '../utils/format'

interface Props {
  config: RaffleConfig
  onEdit?: () => void
  compact?: boolean
}

export default function Hero({ config, onEdit, compact }: Props) {
  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-fiesta-purple via-fiesta-pink to-fiesta-magenta text-white shadow-2xl px-5 py-6 sm:px-8 sm:py-8">
      <div className="pointer-events-none absolute -top-10 -right-10 h-40 w-40 rounded-full bg-fiesta-gold/30 blur-2xl" />
      <div className="pointer-events-none absolute -bottom-14 -left-10 h-48 w-48 rounded-full bg-fiesta-teal/30 blur-2xl" />

      <div className="relative flex flex-wrap items-start justify-between gap-3">
        <div className="space-y-2 min-w-0 flex-1">
          <p className="uppercase tracking-widest text-xs sm:text-sm font-bold text-fiesta-gold">🎟️ Rifa</p>
          <h1 className="font-display text-2xl sm:text-4xl font-extrabold leading-tight">{config.title}</h1>
          {config.winner_number ? (
            <div className="inline-flex items-center gap-2 rounded-full bg-fiesta-gold text-ink px-4 py-1.5 font-bold text-sm sm:text-base animate-pop">
              🏆 Número ganador: {config.winner_number}
            </div>
          ) : (
            <div>
              <p className="text-xs sm:text-sm uppercase tracking-wide text-white/70">Premio</p>
              <p className="font-display text-3xl sm:text-5xl font-black text-fiesta-gold drop-shadow">
                {config.prize}
              </p>
            </div>
          )}
        </div>
        {onEdit && (
          <button
            onClick={onEdit}
            className="shrink-0 rounded-full bg-white/15 hover:bg-white/25 backdrop-blur px-3 py-2 text-xs sm:text-sm font-semibold border border-white/30"
          >
            ✏️ Editar información
          </button>
        )}
      </div>

      {!compact && (
        <div className="relative mt-4 flex flex-wrap gap-x-6 gap-y-1 text-sm sm:text-base">
          <p>
            <span className="font-semibold">📅 Sorteo:</span> {formatDate(config.draw_date)}
          </p>
          {config.draw_mechanism && (
            <p className="text-white/80">
              <span className="font-semibold text-white">🎲 Mecanismo:</span> {config.draw_mechanism}
            </p>
          )}
        </div>
      )}

      {!compact && (
        <p className="relative mt-2 text-xs sm:text-sm text-white/80 max-w-2xl">{config.purpose}</p>
      )}
    </div>
  )
}
