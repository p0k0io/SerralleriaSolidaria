import ProductCard from "./ProductCard"
import { EmptyBoxIcon } from "./icons"

function SkeletonCard() {
  return (
    <div className="bg-white rounded-2xl border border-slate-100/80 p-4 animate-pulse shadow-[0_1px_3px_rgba(0,0,0,0.03)]">
      <div className="rounded-xl h-48 mb-4" style={{ background: "linear-gradient(145deg, #f3f4f6, #f9fafb)" }} />
      <div className="bg-slate-100/80 h-3.5 rounded-lg w-2/3 mb-3" />
      <div className="flex gap-1.5 mb-4">
        {[1, 2, 3].map((j) => <div key={j} className="bg-slate-100/80 h-7 w-14 rounded-xl" />)}
      </div>
      <div className="flex justify-between items-center mb-4">
        <div className="bg-slate-100/80 h-3 w-20 rounded" />
        <div className="bg-slate-100/80 h-5 w-16 rounded-lg" />
      </div>
      <div className="bg-slate-100/80 h-9 rounded-xl" />
    </div>
  )
}

export default function ProductsGrid({ loading, entries, cols, cart, setCart, onViewDetail, hasFilters, clearFilters }) {
  const gridClass = cols === 3
    ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
    : "grid-cols-2 sm:grid-cols-3 lg:grid-cols-4"

  if (loading) {
    return (
      <div className={`grid ${gridClass} gap-4`}>
        {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
      </div>
    )
  }

  if (entries.length === 0) {
    return (
      <div className="text-center py-24 text-slate-400">
        <EmptyBoxIcon />
        <p className="font-semibold text-slate-500 mt-1">No se encontraron productos</p>
        <p className="text-sm text-slate-400 mt-1">Prueba ajustando los filtros</p>
        {hasFilters && (
          <button
            onClick={clearFilters}
            className="mt-5 text-xs text-orange-500 hover:text-orange-700 font-semibold transition-colors border border-orange-200 hover:border-orange-400 px-4 py-2 rounded-xl"
          >
            Limpiar filtros
          </button>
        )}
      </div>
    )
  }

  return (
    <div className={`grid ${gridClass} gap-4`}>
      {entries.map(([name, variants]) => (
        <ProductCard
          key={name}
          name={name}
          variants={variants}
          cart={cart}
          setCart={setCart}
          compact={cols === 4}
          onViewDetail={onViewDetail}
        />
      ))}
    </div>
  )
}