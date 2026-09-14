import type { BuyerSummary } from '../types'
import { formatCurrency } from './format'

function csvEscape(value: string): string {
  if (/[",\n;]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`
  }
  return value
}

export function buildCsv(buyers: BuyerSummary[]): string {
  const header = ['Comprador', 'Teléfono', 'Números', 'Total a pagar', 'Total abonado', 'Saldo pendiente']
  const rows = buyers.map((buyer) => [
    buyer.name,
    buyer.phone ?? '',
    buyer.numbers.map((n) => n.number).join(' '),
    String(buyer.totalOwed),
    String(buyer.totalPaid),
    String(buyer.totalBalance),
  ])
  return [header, ...rows].map((row) => row.map(csvEscape).join(',')).join('\n')
}

export function buildPlainText(buyers: BuyerSummary[], title: string): string {
  const lines = [title, '']
  for (const buyer of buyers) {
    lines.push(`${buyer.name}${buyer.phone ? ` (${buyer.phone})` : ''}`)
    lines.push(`  Números: ${buyer.numbers.map((n) => n.number).join(', ')}`)
    lines.push(
      `  Total: ${formatCurrency(buyer.totalOwed)} | Abonado: ${formatCurrency(buyer.totalPaid)} | Saldo: ${formatCurrency(buyer.totalBalance)}`,
    )
    lines.push('')
  }
  return lines.join('\n')
}

export function downloadFile(filename: string, content: string, mime: string) {
  const blob = new Blob([content], { type: mime })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}
