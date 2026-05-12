import { GridIcon3, GridIcon4 } from "./icons"

export default function ProductsToolbar({ cols, setCols }) {
  return (
    <div className="flex bg-white border border-slate-200/80 rounded-xl overflow-hidden shrink-0 shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
      {[3, 4].map((n) => (
        <button
          key={n}
          onClick={() => setCols(n)}
          className={`flex items-center gap-1.5 px-3 h-9 transition-all duration-150 ${
            n === 4 ? "border-l border-slate-200/80" : ""
          } ${
            cols === n
              ? "bg-orange-500 text-white"
              : "text-slate-400 hover:bg-orange-50/60 hover:text-orange-500"
          }`}
        >
          {n === 3 ? <GridIcon3 /> : <GridIcon4 />}
          <span className="hidden sm:inline text-[12px] font-medium">{n}</span>
        </button>
      ))}
    </div>
  )
}