import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getOrderStatusLabel(status: string) {
  const map: Record<string, string> = {
    'pending': 'Pendiente',
    'paid': 'Pagado',
    'processing': 'En preparación',
    'shipped': 'Enviado',
    'delivered': 'Entregado',
    'cancelled': 'Cancelado',
    'completed': 'Completado'
  }
  return map[status] || status
}
