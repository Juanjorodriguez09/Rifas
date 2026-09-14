import type { RaffleNumber } from '../types'
import { formatCurrency } from '../utils/format'

interface Props {
  number: RaffleNumber
  isWinner: boolean
  onClick: () => void
}

const statusStyles: Record<RaffleNumber['status'], string> = {
  available:
    'bg-status-available border-status-available-border text-gray-500 hover:border-fiesta-purple hover:text-fiesta-purple',
  partial: 'bg-status-partial border-status-partial-border text-amber-900',
  paid: 'bg-status-paid border-status-paid-border text-white',
}

export default function NumberCell({ number, isWinner, onClick }: Props) {
  return (
    <button
      onClick={onClick}
      title={
        number.buyer_name
          ? `${number.buyer_name} · ${formatCurrency(number.paidAmount)} de ${formatCurrency(number.total_amount)}`
          : 'Disponible'
      }
      className={`group relative aspect-square rounded-xl border-2 flex flex-col items-center justify-center font-bold transition-transform hover:scale-105 active:scale-95 ${statusStyles[number.status]} ${
        isWinner ? 'ring-4 ring-fiesta-gold animate-winner' : ''
      }`}
    >
      <span className="text-sm sm:text-lg font-display">{number.number}</span>
      {number.buyer_name && (
        <span className="text-[9px] sm:text-[10px] leading-tight px-1 truncate w-full text-center opacity-90">
          {number.status === 'paid' ? formatCurrency(number.total_amount) : `${formatCurrency(number.paidAmount)}`}
        </span>
      )}
      {isWinner && <span className="absolute -top-2 -right-2 text-lg">🏆</span>}
    </button>
  )
}
