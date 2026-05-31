import type { Invoice } from '@/types'

const MONTH_LABELS = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc']

export function buildMonthlyRevenue(invoices: Invoice[], months = 6) {
  const now = new Date()
  const rows: Array<{ month: string; revenue: number }> = []

  for (let i = months - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const prefix = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
    const revenue = invoices
      .filter(inv => inv.status === 'paid' && inv.date.startsWith(prefix))
      .reduce((sum, inv) => sum + inv.amount, 0)

    rows.push({ month: MONTH_LABELS[d.getMonth()], revenue })
  }

  return rows
}

export function totalPaidRevenue(invoices: Invoice[]) {
  return invoices.filter(i => i.status === 'paid').reduce((sum, i) => sum + i.amount, 0)
}
