import { useState, type FormEvent } from 'react'
import type { RaffleConfig, RaffleConfigInput } from '../types'

interface Props {
  initial: RaffleConfig | null
  onCancel?: () => void
  onSave: (input: RaffleConfigInput, options?: { regenerateNumbers?: boolean }) => Promise<void>
}

export default function ConfigForm({ initial, onCancel, onSave }: Props) {
  const [title, setTitle] = useState(initial?.title ?? '')
  const [purpose, setPurpose] = useState(initial?.purpose ?? '')
  const [prize, setPrize] = useState(initial?.prize ?? '')
  const [numberPrice, setNumberPrice] = useState(initial?.number_price?.toString() ?? '')
  const [drawDate, setDrawDate] = useState(initial?.draw_date ?? '')
  const [drawMechanism, setDrawMechanism] = useState(initial?.draw_mechanism ?? '')
  const [numberCount, setNumberCount] = useState(initial?.number_count?.toString() ?? '100')
  const [numberDigits, setNumberDigits] = useState(initial?.number_digits?.toString() ?? '2')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const isEdit = Boolean(initial)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setSaving(true)
    try {
      const count = Number(numberCount)
      const digits = Number(numberDigits)
      const countChanged = isEdit && initial ? count !== initial.number_count : false
      await onSave(
        {
          title: title.trim(),
          purpose: purpose.trim(),
          prize: prize.trim(),
          number_price: Number(numberPrice) || 0,
          draw_date: drawDate,
          draw_mechanism: drawMechanism.trim() || null,
          number_count: count,
          number_digits: digits,
        },
        { regenerateNumbers: countChanged },
      )
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ocurrió un error al guardar.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-10">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-xl rounded-3xl bg-white/95 backdrop-blur shadow-2xl p-6 sm:p-8 space-y-5 border-4 border-fiesta-gold"
      >
        <div className="text-center space-y-1">
          <div className="text-4xl">🎉</div>
          <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-fiesta-purple">
            {isEdit ? 'Editar información de la rifa' : '¡Vamos a crear tu rifa!'}
          </h1>
          <p className="text-sm text-gray-500">
            {isEdit
              ? 'Actualiza los datos generales de la rifa.'
              : 'Completa estos datos para generar el grid de números.'}
          </p>
        </div>

        <div className="space-y-4">
          <Field label="Nombre / título de la rifa">
            <input
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="input"
              placeholder="Ej: Rifa Pro-Diplomado en Inteligencia Artificial"
            />
          </Field>

          <Field label="Propósito (para qué es la rifa)">
            <textarea
              required
              value={purpose}
              onChange={(e) => setPurpose(e.target.value)}
              className="input min-h-20 resize-y"
              placeholder="Ej: Recoger fondos para el diplomado de IA como opción de grado"
            />
          </Field>

          <Field label="Premio (qué se gana)">
            <input
              required
              value={prize}
              onChange={(e) => setPrize(e.target.value)}
              className="input"
              placeholder="Ej: $2.000.000 en efectivo"
            />
          </Field>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Valor del número (COP)">
              <input
                required
                type="number"
                min={0}
                value={numberPrice}
                onChange={(e) => setNumberPrice(e.target.value)}
                className="input"
                placeholder="40000"
              />
            </Field>
            <Field label="Fecha del sorteo">
              <input
                required
                type="date"
                value={drawDate}
                onChange={(e) => setDrawDate(e.target.value)}
                className="input"
              />
            </Field>
          </div>

          <Field label="Mecanismo del sorteo (opcional)">
            <input
              value={drawMechanism}
              onChange={(e) => setDrawMechanism(e.target.value)}
              className="input"
              placeholder="Ej: Últimos dos dígitos de la Lotería del Quindío"
            />
          </Field>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Cantidad de números">
              <input
                required
                type="number"
                min={1}
                value={numberCount}
                onChange={(e) => setNumberCount(e.target.value)}
                className="input"
                placeholder="100"
              />
            </Field>
            <Field label="Dígitos del formato">
              <select
                value={numberDigits}
                onChange={(e) => setNumberDigits(e.target.value)}
                className="input"
              >
                <option value="2">2 dígitos (00-99)</option>
                <option value="3">3 dígitos (000-999)</option>
                <option value="4">4 dígitos (0000-9999)</option>
              </select>
            </Field>
          </div>
          {isEdit && (
            <p className="text-xs text-amber-600">
              Si aumentas la cantidad de números se crearán los nuevos vacíos. No se eliminan números existentes.
            </p>
          )}
        </div>

        {error && <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{error}</p>}

        <div className="flex gap-3 pt-2">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 rounded-xl border-2 border-gray-200 py-3 font-semibold text-gray-500 hover:bg-gray-50"
            >
              Cancelar
            </button>
          )}
          <button
            type="submit"
            disabled={saving}
            className="flex-1 rounded-xl bg-gradient-to-r from-fiesta-pink to-fiesta-purple py-3 font-bold text-white shadow-lg hover:opacity-90 disabled:opacity-60"
          >
            {saving ? 'Guardando...' : isEdit ? 'Guardar cambios' : 'Crear rifa y generar números'}
          </button>
        </div>
      </form>
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="block text-sm font-semibold text-gray-600 mb-1">{label}</span>
      {children}
    </label>
  )
}
