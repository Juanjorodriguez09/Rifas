export interface RaffleConfig {
  id: string
  title: string
  purpose: string
  prize: string
  number_price: number
  draw_date: string
  draw_mechanism: string | null
  number_count: number
  number_digits: number
  winner_number: string | null
  created_at: string
  updated_at: string
}

export type RaffleConfigInput = Omit<RaffleConfig, 'id' | 'created_at' | 'updated_at' | 'winner_number'>

export interface Payment {
  id: string
  number_id: string
  amount: number
  paid_at: string
  created_at: string
}

export interface RaffleNumberRow {
  id: string
  number: string
  buyer_name: string | null
  buyer_phone: string | null
  total_amount: number
  created_at: string
  updated_at: string
}

export interface RaffleNumber extends RaffleNumberRow {
  payments: Payment[]
  paidAmount: number
  balance: number
  status: NumberStatus
}

export type NumberStatus = 'available' | 'partial' | 'paid'

export interface BuyerSummary {
  key: string
  name: string
  phone: string | null
  numbers: RaffleNumber[]
  totalOwed: number
  totalPaid: number
  totalBalance: number
}
