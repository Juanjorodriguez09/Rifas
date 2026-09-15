import { useMemo, useRef, useState } from 'react'
import type { RaffleConfig, RaffleNumber } from '../types'
import { formatCurrency, formatDate } from '../utils/format'
import { shareOrDownloadImage } from '../utils/shareImage'

interface Props {
  config: RaffleConfig
  numbers: RaffleNumber[]
  onExit: () => void
}

export default function ShareView({ config, numbers, onExit }: Props) {
  const hasWinner = Boolean(config.winner_number)
  const winnerRow = hasWinner ? numbers.find((n) => n.number === config.winner_number) : null
  const available = useMemo(() => numbers.filter((n) => n.status === 'available'), [numbers])
  const gridNumbers = hasWinner ? numbers : available
  const captureRef = useRef<HTMLDivElement>(null)
  const [sharing, setSharing] = useState(false)
  const [shareError, setShareError] = useState<string | null>(null)

  async function handleShareImage() {
    if (!captureRef.current) return
    setSharing(true)
    setShareError(null)
    try {
      await shareOrDownloadImage(captureRef.current, `${config.title.slice(0, 40)}-rifa.png`, config.title)
    } catch (err) {
      if (err instanceof Error && err.name !== 'AbortError') {
        setShareError('No se pudo compartir la imagen. Intenta con una captura de pantalla manual.')
      }
    } finally {
      setSharing(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-fiesta-purple via-fiesta-pink to-fiesta-magenta">
      <div className="sticky top-0 z-10 flex items-center justify-between gap-2 px-4 py-3 bg-black/10 backdrop-blur">
        <button
          onClick={onExit}
          className="rounded-full bg-white text-fiesta-purple px-4 py-2 text-sm font-bold shadow-lg"
        >
          ← Volver a modo edición
        </button>
        <button
          onClick={handleShareImage}
          disabled={sharing}
          className="rounded-full bg-fiesta-gold text-ink px-4 py-2 text-sm font-bold shadow-lg disabled:opacity-60"
        >
          {sharing ? 'Generando...' : '📤 Compartir imagen'}
        </button>
      </div>
      {shareError && <p className="text-center text-xs text-red-100 bg-red-500/80 py-2 px-4">{shareError}</p>}

      <div
        id="share-capture"
        ref={captureRef}
        className="mx-auto max-w-md px-4 pb-8 pt-3 text-white bg-gradient-to-br from-fiesta-purple via-fiesta-pink to-fiesta-magenta"
      >
        <div className="text-center space-y-1.5 mb-4">
          <p className="uppercase tracking-widest text-xs font-bold text-fiesta-gold">🎟️ Rifa</p>
          <h1 className="font-display text-2xl font-extrabold leading-tight">{config.title}</h1>
          <p className="uppercase tracking-wide text-[10px] text-white/70">Premio</p>
          <p className="font-display text-3xl font-black text-fiesta-gold drop-shadow">{config.prize}</p>
          <p className="inline-block rounded-full bg-white/15 px-3 py-1 text-sm font-bold">
            🎟️ Boleta: {formatCurrency(config.number_price)}
          </p>
          <p className="text-sm font-semibold">📅 Sorteo: {formatDate(config.draw_date)}</p>
          {config.draw_mechanism && <p className="text-[11px] text-white/80">{config.draw_mechanism}</p>}
        </div>

        {hasWinner ? (
          <div className="rounded-2xl bg-fiesta-gold text-ink font-bold px-4 py-3 text-center mb-4 shadow-lg">
            🏆 ¡Número ganador: {config.winner_number}!
            {winnerRow?.buyer_name && <div className="text-sm font-semibold mt-0.5">{winnerRow.buyer_name}</div>}
          </div>
        ) : (
          <p className="text-center text-sm font-semibold mb-4">
            ✨ Quedan <span className="text-fiesta-gold font-extrabold">{available.length}</span> números
            disponibles
          </p>
        )}

        <div className="rounded-3xl bg-white/10 p-2.5 backdrop-blur">
          {gridNumbers.length === 0 ? (
            <p className="text-center text-sm text-white/80 py-6">¡Ya no quedan números disponibles! 🎉</p>
          ) : (
            <div className="grid grid-cols-10 gap-1">
              {gridNumbers.map((n) => (
                <div
                  key={n.id}
                  className={`relative aspect-square rounded-md border flex items-center justify-center font-bold text-[10px] font-display ${
                    n.status === 'available'
                      ? 'bg-white/90 border-white text-gray-500'
                      : 'bg-black/20 border-black/10 text-white/30'
                  } ${config.winner_number === n.number ? 'ring-2 ring-fiesta-gold' : ''}`}
                >
                  {n.number}
                  {config.winner_number === n.number && (
                    <span className="absolute -top-1.5 -right-1.5 text-xs">🏆</span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        <p className="text-center text-xs text-white/70 mt-4">{config.purpose}</p>
      </div>
    </div>
  )
}
