export default function MetaPills({ product, tiny = false }) {
  if (!product) return null
  const shipping     = parseFloat(product.shipping_price) > 0
  const installation = parseFloat(product.installation_price) > 0
  const keys         = product.has_extra_keys
  if (!shipping && !installation && !keys) return null

  const cls = tiny
    ? "inline-flex items-center gap-0.5 text-[9px] font-medium px-1.5 py-0.5 rounded-full border"
    : "inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full border"

  return (
    <div className="flex flex-wrap gap-1 mt-1.5">
      {shipping && (
        <span className={`${cls} bg-blue-50 text-blue-500 border-blue-100`}>
          🚚 {tiny ? "" : "Envío "}{parseFloat(product.shipping_price).toFixed(0)}€
        </span>
      )}
      {installation && (
        <span className={`${cls} bg-violet-50 text-violet-500 border-violet-100`}>
          🔧 {tiny ? "" : "Inst. "}{parseFloat(product.installation_price).toFixed(0)}€
        </span>
      )}
      {keys && (
        <span className={`${cls} bg-amber-50 text-amber-600 border-amber-200`}>
          🗝 {tiny ? "" : "Llaves "}{product.extra_key_price ? `${parseFloat(product.extra_key_price).toFixed(0)}€/ud` : "extra"}
        </span>
      )}
    </div>
  )
}