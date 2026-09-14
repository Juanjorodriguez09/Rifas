import { useCallback, useEffect, useMemo, useState } from 'react'
import { supabase } from '../lib/supabase'
import type {
  BuyerSummary,
  Payment,
  RaffleConfig,
  RaffleConfigInput,
  RaffleNumber,
  RaffleNumberRow,
} from '../types'

function computeStatus(number: RaffleNumberRow, payments: Payment[]): RaffleNumber {
  const paidAmount = payments.reduce((sum, p) => sum + Number(p.amount), 0)
  const balance = Number(number.total_amount) - paidAmount
  const status: RaffleNumber['status'] = !number.buyer_name
    ? 'available'
    : balance > 0
      ? 'partial'
      : 'paid'
  return { ...number, payments, paidAmount, balance, status }
}

export function useRaffle() {
  const [config, setConfig] = useState<RaffleConfig | null>(null)
  const [numbers, setNumbers] = useState<RaffleNumber[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchAll = useCallback(async () => {
    setError(null)
    const { data: configRows, error: configError } = await supabase
      .from('raffle_config')
      .select('*')
      .limit(1)

    if (configError) {
      setError(configError.message)
      setLoading(false)
      return
    }

    const currentConfig = (configRows?.[0] as RaffleConfig | undefined) ?? null
    setConfig(currentConfig)

    if (!currentConfig) {
      setNumbers([])
      setLoading(false)
      return
    }

    const [{ data: numberRows, error: numbersError }, { data: paymentRows, error: paymentsError }] =
      await Promise.all([
        supabase.from('raffle_numbers').select('*').order('number', { ascending: true }),
        supabase.from('payments').select('*').order('paid_at', { ascending: true }),
      ])

    if (numbersError) {
      setError(numbersError.message)
      setLoading(false)
      return
    }
    if (paymentsError) {
      setError(paymentsError.message)
      setLoading(false)
      return
    }

    const paymentsByNumber = new Map<string, Payment[]>()
    for (const payment of (paymentRows as Payment[]) ?? []) {
      const list = paymentsByNumber.get(payment.number_id) ?? []
      list.push(payment)
      paymentsByNumber.set(payment.number_id, list)
    }

    const merged = ((numberRows as RaffleNumberRow[]) ?? []).map((row) =>
      computeStatus(row, paymentsByNumber.get(row.id) ?? []),
    )
    setNumbers(merged)
    setLoading(false)
  }, [])

  useEffect(() => {
    fetchAll()
  }, [fetchAll])

  useEffect(() => {
    const channel = supabase
      .channel('raffle-live')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'raffle_config' }, () => fetchAll())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'raffle_numbers' }, () => fetchAll())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'payments' }, () => fetchAll())
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [fetchAll])

  const regenerateNumbers = useCallback(async (count: number, digits: number) => {
    const { data: existing } = await supabase.from('raffle_numbers').select('number')
    const existingSet = new Set((existing ?? []).map((r: { number: string }) => r.number))
    const desired = Array.from({ length: count }, (_, i) => String(i).padStart(digits, '0'))
    const toInsert = desired.filter((n) => !existingSet.has(n)).map((number) => ({ number, total_amount: 0 }))
    if (toInsert.length > 0) {
      await supabase.from('raffle_numbers').insert(toInsert)
    }
  }, [])

  const saveConfig = useCallback(
    async (input: RaffleConfigInput, options?: { regenerateNumbers?: boolean }) => {
      if (config) {
        const { error: updateError } = await supabase
          .from('raffle_config')
          .update(input)
          .eq('id', config.id)
        if (updateError) throw new Error(updateError.message)

        if (options?.regenerateNumbers) {
          await regenerateNumbers(input.number_count, input.number_digits)
        }
      } else {
        const { data, error: insertError } = await supabase
          .from('raffle_config')
          .insert(input)
          .select()
          .single()
        if (insertError) throw new Error(insertError.message)

        const generated = Array.from({ length: input.number_count }, (_, i) => ({
          number: String(i).padStart(input.number_digits, '0'),
          total_amount: 0,
        }))
        const { error: numbersInsertError } = await supabase.from('raffle_numbers').insert(generated)
        if (numbersInsertError) throw new Error(numbersInsertError.message)
        void data
      }
      await fetchAll()
    },
    [config, fetchAll, regenerateNumbers],
  )

  const assignBuyer = useCallback(
    async (
      numberId: string,
      data: { buyer_name: string; buyer_phone: string | null; total_amount: number; firstPayment: number },
    ) => {
      const { error: updateError } = await supabase
        .from('raffle_numbers')
        .update({
          buyer_name: data.buyer_name,
          buyer_phone: data.buyer_phone,
          total_amount: data.total_amount,
        })
        .eq('id', numberId)
      if (updateError) throw new Error(updateError.message)

      if (data.firstPayment > 0) {
        const { error: paymentError } = await supabase
          .from('payments')
          .insert({ number_id: numberId, amount: data.firstPayment })
        if (paymentError) throw new Error(paymentError.message)
      }
      await fetchAll()
    },
    [fetchAll],
  )

  const updateBuyer = useCallback(
    async (
      numberId: string,
      data: { buyer_name: string; buyer_phone: string | null; total_amount: number },
    ) => {
      const { error: updateError } = await supabase
        .from('raffle_numbers')
        .update({
          buyer_name: data.buyer_name,
          buyer_phone: data.buyer_phone,
          total_amount: data.total_amount,
        })
        .eq('id', numberId)
      if (updateError) throw new Error(updateError.message)
      await fetchAll()
    },
    [fetchAll],
  )

  const addPayment = useCallback(
    async (numberId: string, amount: number, paidAt: string) => {
      const { error: insertError } = await supabase
        .from('payments')
        .insert({ number_id: numberId, amount, paid_at: paidAt })
      if (insertError) throw new Error(insertError.message)
      await fetchAll()
    },
    [fetchAll],
  )

  const releaseNumber = useCallback(
    async (numberId: string) => {
      const { error: deletePaymentsError } = await supabase.from('payments').delete().eq('number_id', numberId)
      if (deletePaymentsError) throw new Error(deletePaymentsError.message)
      const { error: updateError } = await supabase
        .from('raffle_numbers')
        .update({ buyer_name: null, buyer_phone: null, total_amount: 0 })
        .eq('id', numberId)
      if (updateError) throw new Error(updateError.message)
      await fetchAll()
    },
    [fetchAll],
  )

  const setWinner = useCallback(
    async (winnerNumber: string | null) => {
      if (!config) return
      const { error: updateError } = await supabase
        .from('raffle_config')
        .update({ winner_number: winnerNumber })
        .eq('id', config.id)
      if (updateError) throw new Error(updateError.message)
      await fetchAll()
    },
    [config, fetchAll],
  )

  const buyers = useMemo<BuyerSummary[]>(() => {
    const map = new Map<string, BuyerSummary>()
    for (const num of numbers) {
      if (!num.buyer_name) continue
      const key = `${num.buyer_name.trim().toLowerCase()}|${num.buyer_phone ?? ''}`
      const existing = map.get(key)
      if (existing) {
        existing.numbers.push(num)
        existing.totalOwed += Number(num.total_amount)
        existing.totalPaid += num.paidAmount
        existing.totalBalance += num.balance
      } else {
        map.set(key, {
          key,
          name: num.buyer_name,
          phone: num.buyer_phone,
          numbers: [num],
          totalOwed: Number(num.total_amount),
          totalPaid: num.paidAmount,
          totalBalance: num.balance,
        })
      }
    }
    return Array.from(map.values()).sort((a, b) => a.name.localeCompare(b.name, 'es'))
  }, [numbers])

  const metrics = useMemo(() => {
    const totalCollected = numbers.reduce((sum, n) => sum + n.paidAmount, 0)
    const totalPending = numbers.reduce((sum, n) => sum + (n.buyer_name ? Math.max(n.balance, 0) : 0), 0)
    const sold = numbers.filter((n) => n.buyer_name).length
    const available = numbers.length - sold
    return { totalCollected, totalPending, sold, available }
  }, [numbers])

  return {
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
    refetch: fetchAll,
  }
}
