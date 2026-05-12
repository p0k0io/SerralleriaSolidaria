import { useRef } from "react"
import { ChevronIcon } from "./icons"
import FeaturedCard from "./FeaturedCard"

export default function FeaturedCarousel({ featured, cart, setCart, onViewDetail }) {
  const scrollRef = useRef(null)
  if (featured.length === 0) return null

  function scroll(dir) {
    if (!scrollRef.current) return
    scrollRef.current.scrollBy({ left: dir === "left" ? -300 : 300, behavior: "smooth" })
  }

  return (
    <div className="mb-12">
      <div className="flex items-end justify-between mb-6">
        <div>
          <p className="text-[10px] font-bold text-orange-500 uppercase tracking-[0.14em] mb-2">Selección</p>
          <h2 className="text-[22px] font-extrabold text-slate-800 tracking-tight leading-none">Destacados</h2>
        </div>
        <div className="flex gap-1.5 pb-0.5">
          <button
            onClick={() => scroll("left")}
            className="w-8 h-8 flex items-center justify-center rounded-xl border border-slate-200/80 bg-white text-slate-400 hover:border-orange-200 hover:text-orange-500 hover:bg-orange-50/60 transition-all duration-150 shadow-[0_1px_2px_rgba(0,0,0,0.04)]"
          >
            <ChevronIcon direction="left" />
          </button>
          <button
            onClick={() => scroll("right")}
            className="w-8 h-8 flex items-center justify-center rounded-xl border border-slate-200/80 bg-white text-slate-400 hover:border-orange-200 hover:text-orange-500 hover:bg-orange-50/60 transition-all duration-150 shadow-[0_1px_2px_rgba(0,0,0,0.04)]"
          >
            <ChevronIcon direction="right" />
          </button>
        </div>
      </div>

      <div
        ref={scrollRef}
        className="flex gap-4 overflow-x-auto pb-3 -mx-1 px-1 scroll-smooth"
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

      <div className="mt-10 border-t border-slate-100/80" />
    </div>
  )
}