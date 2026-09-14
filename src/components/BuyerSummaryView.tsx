import { useMemo, useState } from 'react'
import type { BuyerSummary } from '../types'
import { formatCurrency } from '../utils/format'
import { buildCsv, buildPlainText, downloadFile } from '../utils/exportCsv'

interface Props {
  buyers: BuyerSummary[]
  raffleTitle: string
}

export default function BuyerSummaryView({ buyers, raffleTitle }: Props) {
  const [search, setSearch] = useState('')

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase()
    if (!term) return buyers
    return buyers.filter(
      (b) => b.name.toLowerCase().includes(term) || b.numbers.some((n) => n.number.includes(term)),
    )
  }, [buyers, search])

  function exportCsv() {
    downloadFile(`${slug(raffleTitle)}-compradores.csv`, buildCsv(buyers), 'text/csv;charset=utf-8;')
  }

  function exportTxt() {
    downloadFile(`${slug(raffleTitle)}-compradores.txt`, buildPlainText(buyers, raffleTitle), 'text/plain;charset=utf-8;')
  }

  return (
    <div className="rounded-3xl bg-white/90 shadow-xl p-4 sm:p-6 space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 justify-between">
        <h2 className="font-display text-xl font-extrabold text-fiesta-purple">👥 Resumen de compradores</h2>
        <div className="flex gap-2">
          <button
            onClick={exportCsv}
            className="rounded-xl border-2 border-fiesta-purple/30 text-fiesta-purple px-3 py-2 text-sm font-semibold hover:bg-fiesta-purple/5"
          >
            ⬇️ CSV
          </button>
          <button
            onClick={exportTxt}
            className="rounded-xl border-2 border-fiesta-purple/30 text-fiesta-purple px-3 py-2 text-sm font-semibold hover:bg-fiesta-purple/5"
          >
            ⬇️ Texto
          </button>
        </div>
      </div>

      <input
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Buscar comprador o número..."
        className="input"
      />

      {filtered.length === 0 ? (
        <p className="text-sm text-gray-400 text-center py-6">
          {buyers.length === 0 ? 'Todavía no hay compradores registrados.' : 'Sin resultados.'}
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs uppercase text-gray-400 border-b">
                <th className="py-2 pr-3">Comprador</th>
                <th className="py-2 pr-3">Números</th>
                <th className="py-2 pr-3 text-right">Total</th>
                <th className="py-2 pr-3 text-right">Abonado</th>
                <th className="py-2 pr-3 text-right">Saldo</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((buyer) => (
                <tr key={buyer.key} className="border-b last:border-0 hover:bg-fiesta-purple/5">
                  <td className="py-2.5 pr-3">
                    <p className="font-semibold text-gray-800">{buyer.name}</p>
                    {buyer.phone && <p className="text-xs text-gray-400">{buyer.phone}</p>}
                  </td>
                  <td className="py-2.5 pr-3">
                    <div className="flex flex-wrap gap-1">
                      {buyer.numbers.map((n) => (
                        <span
                          key={n.id}
                          className="inline-block rounded-md bg-fiesta-purple/10 text-fiesta-purple font-bold px-1.5 py-0.5 text-xs"
                        >
                          {n.number}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="py-2.5 pr-3 text-right font-semibold text-gray-700">
                    {formatCurrency(buyer.totalOwed)}
                  </td>
                  <td className="py-2.5 pr-3 text-right text-emerald-600 font-semibold">
                    {formatCurrency(buyer.totalPaid)}
                  </td>
                  <td className="py-2.5 pr-3 text-right font-semibold text-amber-600">
                    {formatCurrency(Math.max(buyer.totalBalance, 0))}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

const DIACRITICS_RE = /[̀-ͯ]/g

function slug(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(DIACRITICS_RE, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}
