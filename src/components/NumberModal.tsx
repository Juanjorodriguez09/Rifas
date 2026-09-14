import { useState, type FormEvent } from 'react'
import type { RaffleNumber } from '../types'
import { formatCurrency, formatShortDate, todayISO } from '../utils/format'

interface Props {
  number: RaffleNumber
  defaultPrice: number
  onClose: () => void
  onAssign: (data: { buyer_name: string; buyer_phone: string | null; total_amount: number; firstPayment: number }) => Promise<void>
  onAddPayment: (amount: number, paidAt: string) => Promise<void>
  onUpdateBuyer: (data: { buyer_name: string; buyer_phone: string | null; total_amount: number }) => Promise<void>
  onRelease: () => Promise<void>
}

export default function NumberModal({
  number,
  defaultPrice,
  onClose,
  onAssign,
  onAddPayment,
  onUpdateBuyer,
  onRelease,
}: Props) {
  const isOwned = Boolean(number.buyer_name)
  const [mode, setMode] = useState<'payment' | 'edit'>('payment')

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm p-0 sm:p-4">
      <div className="w-full sm:max-w-md rounded-t-3xl sm:rounded-3xl bg-white shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white flex items-center justify-between px-5 py-4 border-b">
          <h2 className="font-display text-xl font-extrabold text-fiesta-purple">
            Número {number.number}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700 text-2xl leading-none px-2">
            ×
          </button>
        </div>

        <div className="p-5 space-y-5">
          {!isOwned && <AssignForm defaultPrice={defaultPrice} onAssign={onAssign} />}

          {isOwned && (
            <>
              <div className="flex rounded-xl bg-gray-100 p-1 text-sm font-semibold">
                <button
                  onClick={() => setMode('payment')}
                  className={`flex-1 rounded-lg py-2 ${mode === 'payment' ? 'bg-white shadow text-fiesta-purple' : 'text-gray-500'}`}
                >
                  Agregar abono
                </button>
                <button
                  onClick={() => setMode('edit')}
                  className={`flex-1 rounded-lg py-2 ${mode === 'edit' ? 'bg-white shadow text-fiesta-purple' : 'text-gray-500'}`}
                >
                  Editar comprador
                </button>
              </div>

              <BuyerStatus number={number} />

              {mode === 'payment' ? (
                <PaymentForm number={number} onAddPayment={onAddPayment} />
              ) : (
                <EditBuyerForm number={number} onUpdateBuyer={onUpdateBuyer} onRelease={onRelease} onClose={onClose} />
              )}

              {number.payments.length > 0 && (
                <div>
                  <p className="text-xs font-bold uppercase text-gray-400 mb-2">Historial de abonos</p>
                  <ul className="space-y-1.5">
                    {[...number.payments].reverse().map((p) => (
                      <li
                        key={p.id}
                        className="flex justify-between text-sm bg-gray-50 rounded-lg px-3 py-2 text-gray-600"
                      >
                        <span>{formatShortDate(p.paid_at)}</span>
                        <span className="font-semibold text-gray-800">{formatCurrency(p.amount)}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}

function BuyerStatus({ number }: { number: RaffleNumber }) {
  const statusLabel =
    number.status === 'paid' ? '✅ Pagado completo' : '🟡 Abono parcial'
  return (
    <div className="rounded-xl bg-fiesta-purple/5 border border-fiesta-purple/20 p-3 space-y-1">
      <p className="font-bold text-gray-800">{number.buyer_name}</p>
      {number.buyer_phone && <p className="text-sm text-gray-500">📞 {number.buyer_phone}</p>}
      <p className="text-sm">{statusLabel}</p>
      <div className="grid grid-cols-3 gap-2 pt-1 text-center text-xs">
        <div>
          <p className="text-gray-400">Total</p>
          <p className="font-bold text-gray-700">{formatCurrency(number.total_amount)}</p>
        </div>
        <div>
          <p className="text-gray-400">Abonado</p>
          <p className="font-bold text-emerald-600">{formatCurrency(number.paidAmount)}</p>
        </div>
        <div>
          <p className="text-gray-400">Saldo</p>
          <p className="font-bold text-amber-600">{formatCurrency(Math.max(number.balance, 0))}</p>
        </div>
      </div>
    </div>
  )
}

function AssignForm({
  defaultPrice,
  onAssign,
}: {
  defaultPrice: number
  onAssign: Props['onAssign']
}) {
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [total, setTotal] = useState(String(defaultPrice))
  const [firstPayment, setFirstPayment] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError(null)
    try {
      await onAssign({
        buyer_name: name.trim(),
        buyer_phone: phone.trim() || null,
        total_amount: Number(total) || 0,
        firstPayment: Number(firstPayment) || 0,
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo asignar el número.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <p className="text-sm text-gray-500">Este número está disponible. Asigna un comprador.</p>
      <input
        required
        placeholder="Nombre del comprador"
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="input"
      />
      <input
        placeholder="Teléfono (opcional)"
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
        className="input"
      />
      <div className="grid grid-cols-2 gap-3">
        <label className="block">
          <span className="block text-xs font-semibold text-gray-500 mb-1">Valor total a pagar</span>
          <input
            type="number"
            min={0}
            value={total}
            onChange={(e) => setTotal(e.target.value)}
            className="input"
          />
        </label>
        <label className="block">
          <span className="block text-xs font-semibold text-gray-500 mb-1">Primer abono</span>
          <input
            type="number"
            min={0}
            placeholder="0"
            value={firstPayment}
            onChange={(e) => setFirstPayment(e.target.value)}
            className="input"
          />
        </label>
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <button
        type="submit"
        disabled={saving}
        className="w-full rounded-xl bg-gradient-to-r from-fiesta-pink to-fiesta-purple py-3 font-bold text-white disabled:opacity-60"
      >
        {saving ? 'Guardando...' : 'Asignar número'}
      </button>
    </form>
  )
}

function PaymentForm({
  number,
  onAddPayment,
}: {
  number: RaffleNumber
  onAddPayment: Props['onAddPayment']
}) {
  const [amount, setAmount] = useState('')
  const [date, setDate] = useState(todayISO())
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError(null)
    try {
      await onAddPayment(Number(amount) || 0, date)
      setAmount('')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo registrar el abono.')
    } finally {
      setSaving(false)
    }
  }

  if (number.status === 'paid') {
    return <p className="text-sm text-emerald-600 font-semibold">Este número ya está pagado completamente. 🎉</p>
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <label className="block">
          <span className="block text-xs font-semibold text-gray-500 mb-1">Monto del abono</span>
          <input
            required
            type="number"
            min={1}
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="input"
            placeholder="Ej: 20000"
          />
        </label>
        <label className="block">
          <span className="block text-xs font-semibold text-gray-500 mb-1">Fecha</span>
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="input" />
        </label>
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <button
        type="submit"
        disabled={saving}
        className="w-full rounded-xl bg-gradient-to-r from-fiesta-teal to-emerald-500 py-3 font-bold text-white disabled:opacity-60"
      >
        {saving ? 'Guardando...' : 'Registrar abono'}
      </button>
    </form>
  )
}

function EditBuyerForm({
  number,
  onUpdateBuyer,
  onRelease,
  onClose,
}: {
  number: RaffleNumber
  onUpdateBuyer: Props['onUpdateBuyer']
  onRelease: Props['onRelease']
  onClose: () => void
}) {
  const [name, setName] = useState(number.buyer_name ?? '')
  const [phone, setPhone] = useState(number.buyer_phone ?? '')
  const [total, setTotal] = useState(String(number.total_amount))
  const [saving, setSaving] = useState(false)
  const [confirmingRelease, setConfirmingRelease] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError(null)
    try {
      await onUpdateBuyer({
        buyer_name: name.trim(),
        buyer_phone: phone.trim() || null,
        total_amount: Number(total) || 0,
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo actualizar.')
    } finally {
      setSaving(false)
    }
  }

  async function handleRelease() {
    setSaving(true)
    setError(null)
    try {
      await onRelease()
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo liberar el número.')
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <input
        required
        placeholder="Nombre del comprador"
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="input"
      />
      <input
        placeholder="Teléfono (opcional)"
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
        className="input"
      />
      <label className="block">
        <span className="block text-xs font-semibold text-gray-500 mb-1">Valor total a pagar</span>
        <input type="number" min={0} value={total} onChange={(e) => setTotal(e.target.value)} className="input" />
      </label>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <button
        type="submit"
        disabled={saving}
        className="w-full rounded-xl bg-fiesta-purple py-3 font-bold text-white disabled:opacity-60"
      >
        {saving ? 'Guardando...' : 'Guardar cambios'}
      </button>

      <div className="pt-2 border-t">
        {!confirmingRelease ? (
          <button
            type="button"
            onClick={() => setConfirmingRelease(true)}
            className="w-full rounded-xl border-2 border-red-200 text-red-500 py-2.5 text-sm font-semibold hover:bg-red-50"
          >
            Liberar este número
          </button>
        ) : (
          <div className="space-y-2">
            <p className="text-sm text-red-600 text-center">
              Esto borra el comprador y el historial de abonos de este número. ¿Confirmas?
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setConfirmingRelease(false)}
                className="flex-1 rounded-xl border-2 border-gray-200 py-2 text-sm font-semibold"
              >
                No
              </button>
              <button
                type="button"
                onClick={handleRelease}
                disabled={saving}
                className="flex-1 rounded-xl bg-red-500 text-white py-2 text-sm font-semibold disabled:opacity-60"
              >
                Sí, liberar
              </button>
            </div>
          </div>
        )}
      </div>
    </form>
  )
}
