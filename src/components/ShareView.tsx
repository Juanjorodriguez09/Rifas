import type { RaffleConfig, RaffleNumber } from '../types'
import { formatDate } from '../utils/format'

interface Props {
  config: RaffleConfig
  numbers: RaffleNumber[]
  showBuyerNames: boolean
  onExit: () => void
}

const statusStyles: Record<RaffleNumber['status'], string> = {
  available: 'bg-white/90 border-white text-gray-500',
  partial: 'bg-fiesta-gold border-fiesta-amber text-ink',
  paid: 'bg-status-paid border-status-paid-border text-white',
}

export default function ShareView({ config, numbers, showBuyerNames, onExit }: Props) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-fiesta-purple via-fiesta-pink to-fiesta-magenta">
      <div className="sticky top-0 z-10 flex justify-center py-3 bg-black/10 backdrop-blur">
        <button
          onClick={onExit}
          className="rounded-full bg-white text-fiesta-purple px-4 py-2 text-sm font-bold shadow-lg"
        >
          ← Volver a modo edición
        </button>
      </div>

      <div id="share-capture" className="mx-auto max-w-md px-5 pb-10 pt-4 text-white">
        <div className="text-center space-y-2 mb-5">
          <p className="uppercase tracking-widest text-xs font-bold text-fiesta-gold">🎟️ Rifa</p>
          <h1 className="font-display text-3xl font-extrabold leading-tight">{config.title}</h1>
          <p className="uppercase tracking-wide text-xs text-white/70">Premio</p>
          <p className="font-display text-4xl font-black text-fiesta-gold drop-shadow">{config.prize}</p>
          <p className="text-sm font-semibold">📅 Sorteo: {formatDate(config.draw_date)}</p>
          {config.draw_mechanism && <p className="text-xs text-white/80">{config.draw_mechanism}</p>}
        </div>

        <div className="flex justify-center gap-4 mb-4 text-xs font-semibold">
          <Legend swatch="bg-white border-white" label="Disponible" />
          <Legend swatch="bg-fiesta-gold border-fiesta-amber" label="Apartado" />
          <Legend swatch="bg-status-paid border-status-paid-border" label="Vendido" />
        </div>

        <div className="rounded-3xl bg-white/10 p-3 backdrop-blur">
          <div className="grid grid-cols-5 xs:grid-cols-6 gap-1.5">
            {numbers.map((n) => (
              <div
                key={n.id}
                className={`relative aspect-square rounded-lg border-2 flex flex-col items-center justify-center font-bold ${statusStyles[n.status]} ${
                  config.winner_number === n.number ? 'ring-4 ring-fiesta-gold' : ''
                }`}
              >
                <span className="text-xs sm:text-sm font-display">{n.number}</span>
                {showBuyerNames && n.buyer_name && (
                  <span className="text-[7px] leading-tight px-0.5 truncate w-full text-center">
                    {n.buyer_name.split(' ')[0]}
                  </span>
                )}
                {config.winner_number === n.number && (
                  <span className="absolute -top-1.5 -right-1.5 text-sm">🏆</span>
                )}
              </div>
            ))}
          </div>
        </div>

        <p className="text-center text-xs text-white/70 mt-4">{config.purpose}</p>
      </div>
    </div>
  )
}

function Legend({ swatch, label }: { swatch: string; label: string }) {
  return (
    <div className="flex items-center gap-1.5">
      <span className={`h-3 w-3 rounded border-2 ${swatch}`} />
      {label}
    </div>
  )
}
