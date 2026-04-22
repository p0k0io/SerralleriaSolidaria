import ProductCard from "./ProductCard"
import { EmptyBoxIcon } from "./icons"

function SkeletonCard() {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-4 animate-pulse">
      <div className="bg-slate-100 rounded-xl h-48 mb-4" />
      <div className="bg-slate-100 h-4 rounded w-3/4 mb-3" />
      <div className="flex gap-1.5 mb-3">
        {[1, 2, 3].map((j) => <div key={j} className="bg-slate-100 h-7 w-12 rounded-xl" />)}
      </div>
      <div className="bg-slate-100 h-9 rounded-xl" />
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
      <div className="text-center py-20 text-slate-400">
        <EmptyBoxIcon />
        <p className="font-medium">No se encontraron productos</p>
        {hasFilters && (
          <button onClick={clearFilters} className="mt-2 text-xs text-orange-400 hover:text-orange-600 font-semibold transition">
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