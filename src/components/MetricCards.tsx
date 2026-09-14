import { formatCurrency } from '../utils/format'

interface Props {
  totalCollected: number
  totalPending: number
  sold: number
  available: number
}

export default function MetricCards({ totalCollected, totalPending, sold, available }: Props) {
  const items = [
    { label: 'Total recaudado', value: formatCurrency(totalCollected), icon: '💰', accent: 'from-fiesta-teal to-emerald-500' },
    { label: 'Pendiente por cobrar', value: formatCurrency(totalPending), icon: '⏳', accent: 'from-fiesta-amber to-fiesta-gold' },
    { label: 'Números vendidos', value: sold, icon: '🎫', accent: 'from-fiesta-pink to-fiesta-magenta' },
    { label: 'Números disponibles', value: available, icon: '✨', accent: 'from-fiesta-blue to-fiesta-purple' },
  ]

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
      {items.map((item) => (
        <div key={item.label} className="rounded-2xl bg-white shadow-lg p-4 border border-gray-100">
          <div
            className={`inline-flex items-center justify-center h-9 w-9 rounded-xl bg-gradient-to-br ${item.accent} text-lg mb-2`}
          >
            {item.icon}
          </div>
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{item.label}</p>
          <p className="font-display text-lg sm:text-2xl font-extrabold text-gray-800 truncate">{item.value}</p>
        </div>
      ))}
    </div>
  )
}
