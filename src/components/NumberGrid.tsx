import type { RaffleNumber } from '../types'
import NumberCell from './NumberCell'

interface Props {
  numbers: RaffleNumber[]
  winnerNumber: string | null
  onSelect: (number: RaffleNumber) => void
  highlightNumbers?: Set<string>
}

export default function NumberGrid({ numbers, winnerNumber, onSelect, highlightNumbers }: Props) {
  return (
    <div className="rounded-3xl bg-white/90 shadow-xl p-4 sm:p-6">
      <div className="flex flex-wrap items-center gap-4 mb-4 text-xs sm:text-sm font-semibold text-gray-600">
        <Legend swatch="bg-status-available border-status-available-border" label="Disponible" />
        <Legend swatch="bg-status-partial border-status-partial-border" label="Abono parcial" />
        <Legend swatch="bg-status-paid border-status-paid-border" label="Pagado" />
      </div>
      <div className="grid grid-cols-5 xs:grid-cols-6 sm:grid-cols-8 md:grid-cols-10 gap-2 sm:gap-3">
        {numbers.map((n) => (
          <div
            key={n.id}
            className={highlightNumbers?.has(n.number) ? 'ring-2 ring-fiesta-purple rounded-xl' : undefined}
          >
            <NumberCell number={n} isWinner={winnerNumber === n.number} onClick={() => onSelect(n)} />
          </div>
        ))}
      </div>
    </div>
  )
}

function Legend({ swatch, label }: { swatch: string; label: string }) {
  return (
    <div className="flex items-center gap-1.5">
      <span className={`h-3.5 w-3.5 rounded border-2 ${swatch}`} />
      {label}
    </div>
  )
}
