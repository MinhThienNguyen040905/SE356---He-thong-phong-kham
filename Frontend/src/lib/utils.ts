import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number | string | undefined | null): string {
  if (amount === undefined || amount === null) return "0 VND"
  const value = typeof amount === "string" ? parseFloat(amount) : amount
  return new Intl.NumberFormat("vi-VN").format(value) + " VND"
}

export function formatDate(date: string | Date | undefined | null): string {
  if (!date) return ""
  return new Date(date).toLocaleDateString("vi-VN")
}

export function formatDateTime(date: string | Date | undefined | null): string {
  if (!date) return ""
  return new Date(date).toLocaleString("vi-VN")
}
