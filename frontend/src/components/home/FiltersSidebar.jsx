import { useState, useEffect } from "react"
import { SearchIcon, XIcon } from "./icons"

function SidebarSection({ title, children, defaultOpen = true }) {
  const [open, setOpen] = useState(defaultOpen)

  return (
    <div className="border-b border-slate-100/80 last:border-0 py-1">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between py-3 group"
      >
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.12em] group-hover:text-slate-500 transition-colors">
          {title}
        </span>
        <svg
          xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24"
          fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
          className={`text-slate-300 transition-transform duration-200 shrink-0 ${open ? "rotate-180" : ""}`}
        >
          <polyline points="6 9 12 15 18 9"/>
        </svg>
      </button>
      {open && (
        <div className="pb-2">
          {children}
        </div>
      )}
    </div>
  )
}

function RadioOption({ label, value, current, onChange }) {
  const isActive = current === value
  return (
    <button
      onClick={() => onChange(isActive ? "" : value)}
      className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-[13px] transition-all duration-150 ${
        isActive
          ? "bg-orange-50 text-orange-600 font-semibold"
          : "text-slate-500 hover:bg-slate-50/80 hover:text-slate-700 font-medium"
      }`}
    >
      <span className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 transition-all duration-150 ${
        isActive
          ? "border-orange-500 bg-orange-500"
          : "border-slate-200 bg-white"
      }`}>
        {isActive && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
      </span>
      {label}
    </button>
  )
}

function SidebarContent({
  search, setSearch,
  categoryFilter, setCategoryFilter,
  attributeTypeFilter, setAttrFilter,
  categories, attributeTypes,
  hasFilters, clearFilters,
  entriesCount,
}) {
  return (
    <div className="flex flex-col h-full">

      {/* Header */}
      <div className="flex items-center justify-between pb-5 mb-1 border-b border-slate-100/80">
        <div>
          <h2 className="text-[13px] font-bold text-slate-800 leading-none tracking-tight">Filtros</h2>
          <p className="text-[11px] text-slate-400 mt-1.5 font-medium">
            {entriesCount} {entriesCount === 1 ? "producto" : "productos"}
          </p>
        </div>
        {hasFilters && (
          <button
            onClick={clearFilters}
            className="flex items-center gap-1 text-[11px] font-semibold text-orange-500 hover:text-orange-700 transition-colors bg-orange-50 hover:bg-orange-100 px-2.5 py-1.5 rounded-lg"
          >
            Limpiar
          </button>
        )}
      </div>

      {/* Buscador */}
      <div className="py-4 border-b border-slate-100/80">
        <div className="relative">
          <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar producto…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === "Escape" && setSearch("")}
            className="w-full h-10 pl-9 pr-8 bg-slate-50/80 border border-slate-200/80 rounded-xl text-[13px] text-slate-700 placeholder-slate-400 focus:outline-none focus:border-orange-300 focus:ring-2 focus:ring-orange-100/60 focus:bg-white transition-all"
          />
          {search && (
            <button
              type="button"
              onClick={() => setSearch("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition"
            >
              <XIcon size={11} />
            </button>
          )}
        </div>
      </div>

      {/* Secciones */}
      <div className="flex-1 overflow-y-auto mt-1">

        {categories.length > 0 && (
          <SidebarSection title="Categoría" defaultOpen>
            <div className="space-y-0.5">
              {categories.map((cat) => (
                <RadioOption key={cat} label={cat} value={cat} current={categoryFilter} onChange={setCategoryFilter} />
              ))}
            </div>
          </SidebarSection>
        )}

        {attributeTypes.length > 0 && (
          <SidebarSection title="Atributo" defaultOpen={false}>
            <div className="space-y-0.5">
              {attributeTypes.map((attr) => (
                <RadioOption key={attr} label={attr} value={attr} current={attributeTypeFilter} onChange={setAttrFilter} />
              ))}
            </div>
          </SidebarSection>
        )}

        {categories.length === 0 && attributeTypes.length === 0 && (
          <div className="py-8 text-center">
            <p className="text-[12px] text-slate-300 font-medium">Sin filtros disponibles</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default function FiltersSidebar(props) {
  const { sidebarOpen, setSidebarOpen, desktopOnly, mobileOnly } = props

  useEffect(() => {
    function onKey(e) { if (e.key === "Escape") setSidebarOpen(false) }
    document.addEventListener("keydown", onKey)
    return () => document.removeEventListener("keydown", onKey)
  }, [setSidebarOpen])

  useEffect(() => {
    if (sidebarOpen) document.body.style.overflow = "hidden"
    else document.body.style.overflow = ""
    return () => { document.body.style.overflow = "" }
  }, [sidebarOpen])

  // Desktop-only: render inline SidebarContent (parent handles the panel wrapper)
  if (desktopOnly) {
    return <SidebarContent {...props} />
  }

  // Mobile-only: only render the drawer
  if (mobileOnly) {
    if (!sidebarOpen) return null
    return (
      <>
        <div
          className="fixed inset-0 bg-slate-900/20 backdrop-blur-[2px] z-40"
          onClick={() => setSidebarOpen(false)}
        />
        <div className="fixed inset-y-0 left-0 w-[280px] bg-white z-50 shadow-[4px_0_32px_rgba(0,0,0,0.08)] flex flex-col">
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 shrink-0">
            <span className="text-[15px] font-bold text-slate-800">Filtros</span>
            <button
              onClick={() => setSidebarOpen(false)}
              className="w-8 h-8 flex items-center justify-center rounded-xl text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-all"
            >
              <XIcon size={14} />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto px-5 py-5">
            <SidebarContent {...props} />
          </div>
          <div className="px-5 py-4 border-t border-slate-100 shrink-0">
            <button
              onClick={() => setSidebarOpen(false)}
              className="w-full bg-orange-500 hover:bg-orange-600 active:bg-orange-700 text-white text-[13px] font-bold py-3 rounded-xl transition-all"
            >
              Ver {props.entriesCount} productos
            </button>
          </div>
        </div>
      </>
    )
  }

  // Default fallback: full sidebar (desktop panel + mobile drawer)
  return (
    <>
      <aside className="hidden lg:flex flex-col w-60 shrink-0 sticky top-[68px] self-start">
        <div
          className="bg-white border border-slate-200/60 shadow-[0_1px_4px_rgba(0,0,0,0.04)] rounded-2xl px-5 pt-5 pb-4 overflow-hidden flex flex-col"
          style={{ maxHeight: "calc(100vh - 84px)" }}
        >
          <SidebarContent {...props} />
        </div>
      </aside>

      {sidebarOpen && (
        <>
          <div
            className="lg:hidden fixed inset-0 bg-slate-900/20 backdrop-blur-[2px] z-40"
            onClick={() => setSidebarOpen(false)}
          />
          <div className="lg:hidden fixed inset-y-0 left-0 w-[280px] bg-white z-50 shadow-[4px_0_32px_rgba(0,0,0,0.08)] flex flex-col">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 shrink-0">
              <span className="text-[15px] font-bold text-slate-800">Filtros</span>
              <button
                onClick={() => setSidebarOpen(false)}
                className="w-8 h-8 flex items-center justify-center rounded-xl text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-all"
              >
                <XIcon size={14} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-5 py-5">
              <SidebarContent {...props} />
            </div>
            <div className="px-5 py-4 border-t border-slate-100 shrink-0">
              <button
                onClick={() => setSidebarOpen(false)}
                className="w-full bg-orange-500 hover:bg-orange-600 active:bg-orange-700 text-white text-[13px] font-bold py-3 rounded-xl transition-all"
              >
                Ver {props.entriesCount} productos
              </button>
            </div>
          </div>
        </>
      )}
    </>
  )
}