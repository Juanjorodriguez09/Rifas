import { useState } from 'react'
import type { RaffleConfig, RaffleNumber } from '../types'

interface Props {
  config: RaffleConfig
  numbers: RaffleNumber[]
  onSetWinner: (number: string | null) => Promise<void>
}

export default function WinnerPanel({ config, numbers, onSetWinner }: Props) {
  const [open, setOpen] = useState(false)
  const [selected, setSelected] = useState(config.winner_number ?? '')
  const [saving, setSaving] = useState(false)

  const winnerRow = config.winner_number ? numbers.find((n) => n.number === config.winner_number) : null

  async function handleConfirm() {
    setSaving(true)
    try {
      await onSetWinner(selected || null)
      setOpen(false)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="rounded-3xl bg-white/90 shadow-xl p-4 sm:p-6 flex flex-col sm:flex-row sm:items-center gap-4 justify-between">
      <div>
        <h2 className="font-display text-lg font-extrabold text-fiesta-purple">🏆 Sorteo</h2>
        {config.winner_number ? (
          <p className="text-sm text-gray-600">
            Número ganador: <span className="font-bold text-fiesta-magenta">{config.winner_number}</span>
            {winnerRow?.buyer_name ? (
              <>
                {' '}
                — <span className="font-semibold">{winnerRow.buyer_name}</span>
              </>
            ) : (
              <span className="text-gray-400"> (sin dueño asignado)</span>
            )}
          </p>
        ) : (
          <p className="text-sm text-gray-400">Aún no se ha marcado el número ganador.</p>
        )}
      </div>
      <button
        onClick={() => setOpen(true)}
        className="rounded-xl bg-gradient-to-r from-fiesta-gold to-fiesta-amber text-ink font-bold px-4 py-2.5 shadow hover:opacity-90 shrink-0"
      >
        🎉 Marcar número ganador
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm rounded-3xl bg-white p-6 shadow-2xl space-y-4">
            <h3 className="font-display text-lg font-extrabold text-fiesta-purple">Marcar número ganador</h3>
            <select value={selected} onChange={(e) => setSelected(e.target.value)} className="input">
              <option value="">— Sin ganador —</option>
              {numbers.map((n) => (
                <option key={n.id} value={n.number}>
                  {n.number} {n.buyer_name ? `· ${n.buyer_name}` : '· disponible'}
                </option>
              ))}
            </select>
            <div className="flex gap-3">
              <button
                onClick={() => setOpen(false)}
                className="flex-1 rounded-xl border-2 border-gray-200 py-2.5 font-semibold text-gray-500"
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirm}
                disabled={saving}
                className="flex-1 rounded-xl bg-fiesta-purple text-white py-2.5 font-bold disabled:opacity-60"
              >
                {saving ? 'Guardando...' : 'Confirmar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
