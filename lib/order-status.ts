import type { OrderStatus } from "@/lib/orders";

export const orderStatusLabels: Record<OrderStatus, string> = {
  pending: "Pendiente de confirmación",
  in_process: "Pago en proceso",
  approved: "Pago aprobado",
  confirmed: "Pedido confirmado",
  rejected: "Pago rechazado",
  cancelled: "Cancelado",
  refunded: "Reembolsado",
};

export const orderStatusTone: Record<OrderStatus, string> = {
  pending: "bg-ink/5 text-ink/70",
  in_process: "bg-amber-100 text-amber-900",
  approved: "bg-emerald-100 text-emerald-900",
  confirmed: "bg-emerald-100 text-emerald-900",
  rejected: "bg-red-100 text-red-900",
  cancelled: "bg-ink/10 text-ink/60",
  refunded: "bg-ink/10 text-ink/60",
};

export const paymentMethodLabels: Record<"mercado_pago" | "cash_on_delivery", string> = {
  mercado_pago: "Mercado Pago",
  cash_on_delivery: "Contraentrega",
};
