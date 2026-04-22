import { useRef } from "react"
import { ChevronIcon } from "./icons"
import FeaturedCard from "./FeaturedCard"

export default function FeaturedCarousel({ featured, cart, setCart, onViewDetail }) {
  const scrollRef = useRef(null)
  if (featured.length === 0) return null

  function scroll(dir) {
    if (!scrollRef.current) return
    scrollRef.current.scrollBy({ left: dir === "left" ? -320 : 320, behavior: "smooth" })
  }

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg font-extrabold text-slate-800 tracking-tight">Productos Destacados</h2>
          <p className="text-slate-400 text-xs mt-0.5">{featured.length} variantes seleccionadas</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => scroll("left")} className="w-8 h-8 flex items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 hover:border-orange-400 hover:text-orange-500 transition-all">
            <ChevronIcon direction="left" />
          </button>
          <button onClick={() => scroll("right")} className="w-8 h-8 flex items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 hover:border-orange-400 hover:text-orange-500 transition-all">
            <ChevronIcon direction="right" />
          </button>
        </div>
      </div>
      <div
        ref={scrollRef}
        className="flex gap-4 overflow-x-auto pb-2 scroll-smooth"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {featured.map((variant) => (
          <FeaturedCard
            key={variant.id}
            variant={variant}
            cart={cart}
            setCart={setCart}
            onViewDetail={onViewDetail}
          />
        ))}
      </div>
      <div className="mt-6 border-t border-slate-100" />
    </div>
  )
}