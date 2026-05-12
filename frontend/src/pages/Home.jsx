import { useState, useEffect, useMemo } from "react"
import { Link } from "react-router-dom"
import ProductDetail from "./ProductDetail.jsx"
import { getActiveProducts, getFeaturedProducts } from "../components/home/api"
import { loadCart } from "../components/home/cartUtils"
import FeaturedCarousel from "../components/home/FeaturedCarousel"
import ProductsGrid from "../components/home/ProductsGrid"

export { CART_KEY } from "../components/home/constants"

// ─── constants ───────────────────────────────────────────────
const SIDEBAR_W = 256   // keep in sync with ClientLayout
const NAV_H     = 60

// ─── tiny helpers ────────────────────────────────────────────
function FilterChip({ label, onRemove }) {
  return (
    <span className="inline-flex items-center gap-1.5 text-[12px] font-medium bg-orange-50 text-orange-700 border border-orange-100 px-2.5 py-1 rounded-full">
      {label}
      <button
        onClick={onRemove}
        className="flex items-center justify-center text-orange-400 hover:text-orange-700 transition-colors"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
          <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
        </svg>
      </button>
    </span>
  )
}

// ─── filter sidebar content (stateless) ──────────────────────
function FilterSection({ title, children, defaultOpen = true }) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div className="border-b border-slate-100 last:border-0">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between py-3.5 group text-left"
      >
        <span className="text-[10.5px] font-bold text-slate-400 uppercase tracking-[0.1em] group-hover:text-slate-500 transition-colors">
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
      {open && <div className="pb-4">{children}</div>}
    </div>
  )
}

function FilterPill({ label, value, current, onChange }) {
  const active = current === value
  return (
    <button
      onClick={() => onChange(active ? "" : value)}
      className={`w-full flex items-center justify-between text-left px-3 py-2 rounded-xl text-[13px] transition-all duration-150 group ${
        active
          ? "bg-orange-50 text-orange-600 font-semibold"
          : "text-slate-500 hover:bg-slate-50 hover:text-slate-800 font-medium"
      }`}
    >
      <div className="flex items-center gap-2.5">
        {/* Custom radio dot */}
        <span className={`w-[15px] h-[15px] rounded-full border-2 flex items-center justify-center shrink-0 transition-all ${
          active ? "border-orange-500 bg-orange-500" : "border-slate-200 group-hover:border-slate-300"
        }`}>
          {active && <span className="w-1.5 h-1.5 rounded-full bg-white block" />}
        </span>
        {label}
      </div>
    </button>
  )
}

function SidebarPanel({
  search, setSearch,
  categoryFilter, setCategoryFilter,
  attributeTypeFilter, setAttrFilter,
  categories, attributeTypes,
  hasFilters, clearFilters, entriesCount,
}) {
  return (
    <div className="flex flex-col h-full overflow-hidden">

      {/* Header row */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-100 shrink-0">
        <div>
          <p className="text-[13px] font-bold text-slate-800 leading-none">Filtros</p>
          <p className="text-[11px] text-slate-400 mt-1.5">
            {entriesCount} {entriesCount === 1 ? "producto" : "productos"}
          </p>
        </div>
        {hasFilters && (
          <button
            onClick={clearFilters}
            className="text-[11px] font-semibold text-orange-500 hover:text-orange-700 bg-orange-50 hover:bg-orange-100 px-2.5 py-1.5 rounded-lg transition-all"
          >
            Limpiar
          </button>
        )}
      </div>

      {/* Search */}
      <div className="pt-4 pb-2 shrink-0">
        <div className="relative">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          <input
            type="text"
            placeholder="Buscar…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            onKeyDown={e => e.key === "Escape" && setSearch("")}
            className="w-full h-9 pl-9 pr-8 text-[13px] bg-slate-50 border border-slate-200/80 rounded-xl text-slate-700 placeholder-slate-400 focus:outline-none focus:border-orange-300 focus:ring-2 focus:ring-orange-100/70 focus:bg-white transition-all"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          )}
        </div>
      </div>

      {/* Scrollable filter sections */}
      <div className="flex-1 overflow-y-auto mt-1" style={{ scrollbarWidth: "thin", scrollbarColor: "#e2e8f0 transparent" }}>

        {categories.length > 0 && (
          <FilterSection title="Categoría">
            <div className="space-y-0.5 -mx-1 px-1">
              {categories.map(cat => (
                <FilterPill key={cat} label={cat} value={cat} current={categoryFilter} onChange={setCategoryFilter} />
              ))}
            </div>
          </FilterSection>
        )}

        {attributeTypes.length > 0 && (
          <FilterSection title="Atributo" defaultOpen={false}>
            <div className="space-y-0.5 -mx-1 px-1">
              {attributeTypes.map(attr => (
                <FilterPill key={attr} label={attr} value={attr} current={attributeTypeFilter} onChange={setAttrFilter} />
              ))}
            </div>
          </FilterSection>
        )}

        {categories.length === 0 && attributeTypes.length === 0 && (
          <div className="pt-6 text-center">
            <p className="text-[12px] text-slate-300 font-medium">Sin filtros disponibles</p>
          </div>
        )}
      </div>

      {/* CTA — pinned at bottom of sidebar */}
      <Link
        to="/solicitud"
        className="group shrink-0 mt-4 flex items-start gap-3 rounded-xl border border-slate-100 hover:border-orange-100 bg-slate-50 hover:bg-orange-50/60 px-3.5 py-3.5 transition-all duration-200"
      >
        <div className="w-7 h-7 rounded-lg bg-white border border-slate-200 group-hover:border-orange-200 group-hover:bg-orange-500 flex items-center justify-center shrink-0 transition-all duration-200 mt-0.5">
          <svg className="w-3.5 h-3.5 stroke-slate-400 group-hover:stroke-white transition-colors duration-200" viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
          </svg>
        </div>
        <div>
          <p className="text-[12px] font-semibold text-slate-700 group-hover:text-orange-700 leading-snug transition-colors">¿Necesitas algo especial?</p>
          <p className="text-[11px] text-slate-400 mt-0.5 leading-snug">Solicita un presupuesto</p>
        </div>
      </Link>
    </div>
  )
}

// ─── main component ───────────────────────────────────────────
export default function Home() {
  const [allGrouped,   setAllGrouped]   = useState({})
  const [featured,     setFeatured]     = useState([])
  const [loading,      setLoading]      = useState(true)
  const [cols,         setCols]         = useState(3)
  const [cart,         setCart]         = useState(loadCart)
  const [search,       setSearch]       = useState("")
  const [categoryFilter, setCategoryFilter] = useState("")
  const [attributeTypeFilter, setAttrFilter] = useState("")
  const [detail,       setDetail]       = useState(null)
  const [mobileDrawer, setMobileDrawer] = useState(false)

  useEffect(() => {
    Promise.all([getFeaturedProducts(), getActiveProducts()]).then(([feat, active]) => {
      setFeatured(feat)
      setAllGrouped(active)
      setLoading(false)
    })
  }, [])

  // Close mobile drawer on Escape
  useEffect(() => {
    const handler = e => { if (e.key === "Escape") setMobileDrawer(false) }
    document.addEventListener("keydown", handler)
    return () => document.removeEventListener("keydown", handler)
  }, [])

  // Lock body scroll when mobile drawer open
  useEffect(() => {
    document.body.style.overflow = mobileDrawer ? "hidden" : ""
    return () => { document.body.style.overflow = "" }
  }, [mobileDrawer])

  const categories = useMemo(() => {
    const cats = new Set()
    Object.values(allGrouped).forEach(variants =>
      variants.forEach(v => { if (v.product?.category?.name) cats.add(v.product.category.name) })
    )
    return Array.from(cats).sort()
  }, [allGrouped])

  const attributeTypes = useMemo(() => {
    const types = new Set()
    Object.values(allGrouped).forEach(variants =>
      variants.forEach(v => { (v.attributes || []).forEach(a => { if (a.type) types.add(a.type) }) })
    )
    return Array.from(types).sort()
  }, [allGrouped])

  const entries = useMemo(() => {
    return Object.entries(allGrouped).filter(([name, variants]) => {
      if (search) {
        const q = search.toLowerCase()
        const nameMatch = name.toLowerCase().includes(q)
        const skuMatch  = variants.some(v => (v.sku ?? "").toLowerCase().includes(q))
        if (!nameMatch && !skuMatch) return false
      }
      if (categoryFilter      && !variants.some(v => v.product?.category?.name === categoryFilter)) return false
      if (attributeTypeFilter && !variants.some(v => (v.attributes || []).some(a => a.type === attributeTypeFilter))) return false
      return true
    })
  }, [allGrouped, search, categoryFilter, attributeTypeFilter])

  useEffect(() => { window.scrollTo({ top: 0, behavior: "smooth" }) }, [detail])

  if (detail) {
    return (
      <div className="max-w-[1600px] mx-auto px-6 py-8">
        <ProductDetail name={detail.name} variants={detail.variants} onBack={() => setDetail(null)} />
      </div>
    )
  }

  const hasFilters      = !!(categoryFilter || attributeTypeFilter)
  const activeFilters   = [categoryFilter, attributeTypeFilter].filter(Boolean).length
  function clearFilters() { setCategoryFilter(""); setAttrFilter("") }
  function handleViewDetail(name, variants) { setDetail({ name, variants }) }

  const filterProps = {
    search, setSearch,
    categoryFilter, setCategoryFilter,
    attributeTypeFilter, setAttrFilter,
    categories, attributeTypes,
    hasFilters, clearFilters,
    entriesCount: entries.length,
  }

  return (
    /*
      FULL-BLEED layout shell.
      - The filter sidebar is position:fixed, anchored left at x=0
      - The main column uses paddingLeft = SIDEBAR_W to offset itself
      - On <lg screens the sidebar becomes a slide-in drawer
    */
    <div className="relative min-h-screen">

      {/* ── FIXED FILTER SIDEBAR (desktop only) ── */}
      <aside
        className="hidden lg:flex flex-col fixed left-0 z-30 bg-white border-r border-slate-200/70"
        style={{
          top: NAV_H,
          bottom: 0,
          width: SIDEBAR_W,
          boxShadow: "1px 0 0 rgba(0,0,0,0.03)",
        }}
      >
        <div className="flex-1 px-5 pt-6 pb-4 overflow-hidden flex flex-col">
          <SidebarPanel {...filterProps} />
        </div>
      </aside>

      {/* ── MOBILE DRAWER ── */}
      {mobileDrawer && (
        <>
          <div
            className="lg:hidden fixed inset-0 bg-slate-900/20 backdrop-blur-[2px] z-40"
            onClick={() => setMobileDrawer(false)}
          />
          <aside className="lg:hidden fixed inset-y-0 left-0 z-50 w-[280px] bg-white border-r border-slate-200/70 shadow-[4px_0_32px_rgba(0,0,0,0.08)] flex flex-col"
            style={{ top: NAV_H }}
          >
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 shrink-0">
              <span className="text-[14px] font-bold text-slate-800">Filtros</span>
              <button
                onClick={() => setMobileDrawer(false)}
                className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-all"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-5 py-5">
              <SidebarPanel {...filterProps} />
            </div>
            <div className="px-5 py-4 border-t border-slate-100 shrink-0">
              <button
                onClick={() => setMobileDrawer(false)}
                className="w-full bg-orange-500 hover:bg-orange-600 text-white text-[13px] font-bold py-3 rounded-xl transition-all"
              >
                Ver {entries.length} productos
              </button>
            </div>
          </aside>
        </>
      )}

      {/* ── MAIN CONTENT — offset by sidebar width on desktop ── */}
      <div
        className="lg:pl-0"
        style={{ paddingLeft: 0 }}  /* handled inline below */
      >
        <div
          className="lg:ml-[256px]" /* pushes content right of the fixed sidebar */
        >
          {/* Inner max-width container so content doesn't go ultra-wide */}
          <div className="max-w-[1140px] mx-auto px-6 py-8">

            {/* Featured carousel */}
            {!loading && featured.length > 0 && (
              <FeaturedCarousel
                featured={featured}
                cart={cart}
                setCart={setCart}
                onViewDetail={handleViewDetail}
              />
            )}

            {/* ── CONTENT HEADER ── */}
            <div className="flex items-end justify-between gap-4 mb-6">
              <div>
                <h1 className="text-[24px] font-extrabold text-slate-900 tracking-tight leading-none">
                  Productos
                </h1>
                <p className="text-[13px] text-slate-400 font-medium mt-1.5">
                  {loading ? "Cargando…" : `${entries.length} ${entries.length === 1 ? "resultado" : "resultados"}`}
                </p>
              </div>

              <div className="flex items-center gap-2.5 pb-0.5">
                {/* Mobile filter button */}
                <button
                  onClick={() => setMobileDrawer(true)}
                  className="lg:hidden flex items-center gap-2 h-9 px-3.5 bg-white border border-slate-200 text-slate-600 text-[13px] font-medium rounded-xl hover:border-orange-300 hover:text-orange-500 transition-all shadow-[0_1px_2px_rgba(0,0,0,0.04)]"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="4" y1="6" x2="20" y2="6"/><line x1="8" y1="12" x2="20" y2="12"/><line x1="12" y1="18" x2="20" y2="18"/>
                  </svg>
                  Filtros
                  {activeFilters > 0 && (
                    <span className="w-4 h-4 bg-orange-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                      {activeFilters}
                    </span>
                  )}
                </button>

                {/* Column switcher */}
                <div className="flex items-center bg-white border border-slate-200 rounded-xl overflow-hidden shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
                  {[3, 4].map(n => (
                    <button
                      key={n}
                      onClick={() => setCols(n)}
                      title={`${n} columnas`}
                      className={`flex items-center gap-1.5 px-3 h-9 transition-all duration-150 text-[12px] font-medium ${
                        n === 4 ? "border-l border-slate-200" : ""
                      } ${
                        cols === n
                          ? "bg-orange-500 text-white"
                          : "text-slate-400 hover:bg-orange-50/60 hover:text-orange-500"
                      }`}
                    >
                      {/* Grid icon */}
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        {n === 3
                          ? <><rect x="3"   y="3" width="5" height="18" rx="1"/><rect x="9.5" y="3" width="5" height="18" rx="1"/><rect x="16"  y="3" width="5" height="18" rx="1"/></>
                          : <><rect x="2"    y="3" width="4.5" height="18" rx="1"/><rect x="7.8"  y="3" width="4.5" height="18" rx="1"/><rect x="13.1" y="3" width="4.5" height="18" rx="1"/><rect x="18.4" y="3" width="3.6" height="18" rx="1"/></>
                        }
                      </svg>
                      <span className="hidden sm:inline">{n}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Active filter chips */}
            {hasFilters && (
              <div className="flex flex-wrap items-center gap-2 mb-5">
                {categoryFilter      && <FilterChip label={categoryFilter}      onRemove={() => setCategoryFilter("")} />}
                {attributeTypeFilter && <FilterChip label={attributeTypeFilter} onRemove={() => setAttrFilter("")} />}
                <button onClick={clearFilters} className="text-[12px] text-slate-400 hover:text-slate-600 font-medium transition-colors">
                  Limpiar todo
                </button>
              </div>
            )}

            {/* Product grid */}
            <ProductsGrid
              loading={loading}
              entries={entries}
              cols={cols}
              cart={cart}
              setCart={setCart}
              onViewDetail={handleViewDetail}
              hasFilters={hasFilters}
              clearFilters={clearFilters}
            />
          </div>
        </div>
      </div>
    </div>
  )
}