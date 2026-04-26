import { STOCK_CONFIG } from "./constants"

export default function StockBadge({ status, tiny = false }) {
  const cfg = STOCK_CONFIG[status] ?? STOCK_CONFIG.available
  if (status === "available") return null
  return (
    <span className={`inline-flex items-center gap-1 border rounded-full font-medium ${tiny ? "text-[9px] px-1.5 py-0.5" : "text-[10px] px-2 py-0.5"} ${cfg.color}`}>
      <span className={`w-1 h-1 rounded-full ${cfg.dot}`} />
      {cfg.label}
    </span>
  )
}