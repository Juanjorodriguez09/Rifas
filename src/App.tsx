import { useState } from 'react'
import { useRaffle } from './hooks/useRaffle'
import { supabaseConfigured } from './lib/supabase'
import ConfigForm from './components/ConfigForm'
import Hero from './components/Hero'
import MetricCards from './components/MetricCards'
import NumberGrid from './components/NumberGrid'
import NumberModal from './components/NumberModal'
import BuyerSummaryView from './components/BuyerSummaryView'
import WinnerPanel from './components/WinnerPanel'
import ShareView from './components/ShareView'
import type { RaffleNumber } from './types'

export default function App() {
  const {
    config,
    numbers,
    buyers,
    metrics,
    loading,
    error,
    saveConfig,
    assignBuyer,
    updateBuyer,
    addPayment,
    releaseNumber,
    setWinner,
  } = useRaffle()

  const [editingConfig, setEditingConfig] = useState(false)
  const [selectedNumber, setSelectedNumber] = useState<RaffleNumber | null>(null)
  const [shareMode, setShareMode] = useState(false)
  const [showBuyerNamesInShare, setShowBuyerNamesInShare] = useState(true)

  if (!supabaseConfigured) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="max-w-md rounded-3xl bg-white shadow-2xl p-8 text-center space-y-3">
          <div className="text-4xl">⚠️</div>
          <h1 className="font-display text-xl font-extrabold text-fiesta-purple">Falta configurar Supabase</h1>
          <p className="text-sm text-gray-500">
            Crea un archivo <code className="bg-gray-100 px-1 rounded">.env</code> a partir de{' '}
            <code className="bg-gray-100 px-1 rounded">.env.example</code> con la URL y la llave anónima de tu
            proyecto de Supabase, y ejecuta <code className="bg-gray-100 px-1 rounded">supabase/schema.sql</code>{' '}
            en el editor SQL de tu proyecto.
          </p>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white">
        <p className="text-lg font-semibold animate-pulse">Cargando rifa...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="max-w-md rounded-3xl bg-white shadow-2xl p-8 text-center space-y-3">
          <div className="text-4xl">😵</div>
          <h1 className="font-display text-xl font-extrabold text-red-500">Ocurrió un error</h1>
          <p className="text-sm text-gray-500">{error}</p>
        </div>
      </div>
    )
  }

  if (!config || editingConfig) {
    return (
      <ConfigForm
        initial={config}
        onCancel={config ? () => setEditingConfig(false) : undefined}
        onSave={async (input, options) => {
          await saveConfig(input, options)
          setEditingConfig(false)
        }}
      />
    )
  }

  if (shareMode) {
    return (
      <ShareView
        config={config}
        numbers={numbers}
        showBuyerNames={showBuyerNamesInShare}
        onExit={() => setShareMode(false)}
      />
    )
  }

  return (
    <div className="min-h-screen px-4 py-5 sm:px-6 sm:py-8 space-y-5 max-w-6xl mx-auto">
      <Hero config={config} onEdit={() => setEditingConfig(true)} />

      <div className="flex flex-wrap gap-2 justify-end">
        <label className="flex items-center gap-2 text-xs sm:text-sm font-semibold text-white bg-black/20 rounded-xl px-3 py-2 backdrop-blur">
          <input
            type="checkbox"
            checked={showBuyerNamesInShare}
            onChange={(e) => setShowBuyerNamesInShare(e.target.checked)}
          />
          Mostrar nombres en compartir
        </label>
        <button
          onClick={() => setShareMode(true)}
          className="rounded-xl bg-gradient-to-r from-fiesta-teal to-fiesta-blue text-white font-bold px-4 py-2 text-sm shadow hover:opacity-90"
        >
          📤 Modo compartir
        </button>
      </div>

      <MetricCards
        totalCollected={metrics.totalCollected}
        totalPending={metrics.totalPending}
        sold={metrics.sold}
        available={metrics.available}
      />

      <WinnerPanel config={config} numbers={numbers} onSetWinner={setWinner} />

      <NumberGrid numbers={numbers} winnerNumber={config.winner_number} onSelect={setSelectedNumber} />

      <BuyerSummaryView buyers={buyers} raffleTitle={config.title} />

      {selectedNumber && (
        <NumberModal
          number={numbers.find((n) => n.id === selectedNumber.id) ?? selectedNumber}
          defaultPrice={config.number_price}
          onClose={() => setSelectedNumber(null)}
          onAssign={async (data) => {
            await assignBuyer(selectedNumber.id, data)
          }}
          onAddPayment={async (amount, paidAt) => {
            await addPayment(selectedNumber.id, amount, paidAt)
          }}
          onUpdateBuyer={async (data) => {
            await updateBuyer(selectedNumber.id, data)
          }}
          onRelease={async () => {
            await releaseNumber(selectedNumber.id)
          }}
        />
      )}
    </div>
  )
}
