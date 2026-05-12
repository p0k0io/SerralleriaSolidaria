
import { useState, useEffect, useMemo } from "react"
import { Link } from "react-router-dom"
import ProductDetail from "./ProductDetail.jsx"
import { getActiveProducts, getFeaturedProducts } from "../components/home/api"
import { loadCart } from "../components/home/cartUtils"
import FeaturedCarousel from "../components/home/FeaturedCarousel"
import ProductsGrid from "../components/home/ProductsGrid"
 
export { CART_KEY } from "../components/home/constants"
 
// ─── constants ───────────────────────────────────────────────
const SIDEBAR_W = 240
const NAV_H     = 74   // altura real del navbar isla
 
// ─── FilterChip ──────────────────────────────────────────────
function FilterChip({ label, onRemove }) {
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 5,
      fontSize: 11.5, fontWeight: 500,
      background: "rgba(255,237,213,0.8)",
      color: "#c2410c",
      border: "1px solid rgba(253,186,116,0.5)",
      padding: "3px 10px 3px 10px",
      borderRadius: 20,
    }}>
      {label}
      <button
        onClick={onRemove}
        style={{
          display: "flex", alignItems: "center", justifyContent: "center",
          background: "none", border: "none", cursor: "pointer",
          color: "#f97316", padding: 0, lineHeight: 1,
        }}
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24"
          fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
          <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
        </svg>
      </button>
    </span>
  )
}
 
// ─── FilterSection ────────────────────────────────────────────
function FilterSection({ title, children, defaultOpen = true }) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div style={{ borderBottom: "1px solid #f8fafc" }}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          width: "100%", display: "flex", alignItems: "center",
          justifyContent: "space-between",
          padding: "10px 0",
          background: "none", border: "none", cursor: "pointer",
        }}
      >
        <span style={{
          fontSize: 10, fontWeight: 700, color: "#94a3b8",
          textTransform: "uppercase", letterSpacing: "0.10em",
        }}>
          {title}
        </span>
        <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24"
          fill="none" stroke="#cbd5e1" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
          style={{ transition: "transform 0.18s", transform: open ? "rotate(180deg)" : "rotate(0deg)", flexShrink: 0 }}
        >
          <polyline points="6 9 12 15 18 9"/>
        </svg>
      </button>
      {open && <div style={{ paddingBottom: 12 }}>{children}</div>}
    </div>
  )
}
 
// ─── FilterPill ───────────────────────────────────────────────
function FilterPill({ label, value, current, onChange }) {
  const active = current === value
  return (
    <button
      onClick={() => onChange(active ? "" : value)}
      style={{
        width: "100%", display: "flex", alignItems: "center", gap: 9,
        padding: "7px 10px", borderRadius: 10,
        background: active ? "rgba(255,237,213,0.7)" : "transparent",
        border: "none", cursor: "pointer", textAlign: "left",
        transition: "all 0.13s",
      }}
      onMouseEnter={e => { if (!active) e.currentTarget.style.background = "#f8fafc" }}
      onMouseLeave={e => { if (!active) e.currentTarget.style.background = "transparent" }}
    >
      {/* Radio dot */}
      <span style={{
        width: 14, height: 14, borderRadius: "50%", flexShrink: 0,
        border: active ? "2px solid #f97316" : "2px solid #e2e8f0",
        display: "flex", alignItems: "center", justifyContent: "center",
        background: active ? "#f97316" : "transparent",
        transition: "all 0.13s",
      }}>
        {active && <span style={{ width: 5, height: 5, borderRadius: "50%", background: "white", display: "block" }} />}
      </span>
      <span style={{
        fontSize: 12.5,
        fontWeight: active ? 600 : 400,
        color: active ? "#c2410c" : "#64748b",
        transition: "color 0.13s",
      }}>
        {label}
      </span>
    </button>
  )
}
 
// ─── SidebarPanel ─────────────────────────────────────────────
function SidebarPanel({
  search, setSearch,
  categoryFilter, setCategoryFilter,
  attributeTypeFilter, setAttrFilter,
  categories, attributeTypes,
  hasFilters, clearFilters, entriesCount,
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", overflow: "hidden" }}>
 
      {/* Header */}
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        paddingBottom: 12, borderBottom: "1px solid #f1f5f9", flexShrink: 0,
      }}>
        <div>
          <p style={{ fontSize: 13, fontWeight: 700, color: "#0f172a", margin: 0, lineHeight: 1 }}>
            Filtros
          </p>
          <p style={{ fontSize: 11, color: "#94a3b8", margin: "5px 0 0", lineHeight: 1 }}>
            {entriesCount} {entriesCount === 1 ? "producto" : "productos"}
          </p>
        </div>
        {hasFilters && (
          <button
            onClick={clearFilters}
            style={{
              fontSize: 11, fontWeight: 600, color: "#ea580c",
              background: "rgba(255,237,213,0.8)",
              border: "1px solid rgba(253,186,116,0.4)",
              padding: "4px 10px", borderRadius: 8, cursor: "pointer",
              transition: "all 0.13s",
            }}
            onMouseEnter={e => e.currentTarget.style.background = "#fed7aa"}
            onMouseLeave={e => e.currentTarget.style.background = "rgba(255,237,213,0.8)"}
          >
            Limpiar
          </button>
        )}
      </div>
 
      {/* Search */}
      <div style={{ padding: "12px 0 4px", flexShrink: 0 }}>
        <div style={{ position: "relative" }}>
          <svg style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }}
            xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24"
            fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input
            type="text"
            placeholder="Buscar…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            onKeyDown={e => e.key === "Escape" && setSearch("")}
            style={{
              width: "100%", height: 34,
              paddingLeft: 30, paddingRight: search ? 30 : 10,
              fontSize: 12.5,
              background: "#f8fafc",
              border: "1px solid #e2e8f0",
              borderRadius: 10,
              color: "#334155",
              outline: "none",
              boxSizing: "border-box",
              transition: "all 0.13s",
            }}
            onFocus={e => { e.target.style.borderColor = "#fbd38d"; e.target.style.background = "white"; e.target.style.boxShadow = "0 0 0 3px rgba(249,115,22,0.10)" }}
            onBlur={e => { e.target.style.borderColor = "#e2e8f0"; e.target.style.background = "#f8fafc"; e.target.style.boxShadow = "none" }}
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              style={{
                position: "absolute", right: 8, top: "50%", transform: "translateY(-50%)",
                background: "none", border: "none", cursor: "pointer",
                color: "#94a3b8", display: "flex", alignItems: "center",
              }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24"
                fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          )}
        </div>
      </div>
 
      {/* Scrollable sections */}
      <div style={{ flex: 1, overflowY: "auto", marginTop: 4, scrollbarWidth: "thin", scrollbarColor: "#f1f5f9 transparent" }}>
        {categories.length > 0 && (
          <FilterSection title="Categoría">
            <div style={{ display: "flex", flexDirection: "column", gap: 1 }}>
              {categories.map(cat => (
                <FilterPill key={cat} label={cat} value={cat} current={categoryFilter} onChange={setCategoryFilter} />
              ))}
            </div>
          </FilterSection>
        )}
 
        {attributeTypes.length > 0 && (
          <FilterSection title="Atributo" defaultOpen={false}>
            <div style={{ display: "flex", flexDirection: "column", gap: 1 }}>
              {attributeTypes.map(attr => (
                <FilterPill key={attr} label={attr} value={attr} current={attributeTypeFilter} onChange={setAttrFilter} />
              ))}
            </div>
          </FilterSection>
        )}
 
        {categories.length === 0 && attributeTypes.length === 0 && (
          <div style={{ paddingTop: 24, textAlign: "center" }}>
            <p style={{ fontSize: 11.5, color: "#cbd5e1", fontWeight: 500 }}>Sin filtros disponibles</p>
          </div>
        )}
      </div>
 
      {/* CTA presupuesto */}
      <Link
        to="/solicitud"
        style={{ textDecoration: "none", flexShrink: 0, marginTop: 12 }}
      >
        <div style={{
          display: "flex", alignItems: "flex-start", gap: 10,
          padding: "12px 14px",
          borderRadius: 12,
          border: "1px solid rgba(249,115,22,0.13)",
          background: "rgba(255,247,237,0.6)",
          transition: "all 0.15s",
          cursor: "pointer",
        }}
          onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,237,213,0.7)"; e.currentTarget.style.borderColor = "rgba(249,115,22,0.25)" }}
          onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,247,237,0.6)"; e.currentTarget.style.borderColor = "rgba(249,115,22,0.13)" }}
        >
          <div style={{
            width: 28, height: 28, borderRadius: 9, flexShrink: 0,
            background: "white",
            border: "1px solid rgba(249,115,22,0.18)",
            display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: "0 1px 4px rgba(249,115,22,0.10)",
          }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
              stroke="#f97316" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
            </svg>
          </div>
          <div>
            <p style={{ fontSize: 12, fontWeight: 600, color: "#c2410c", margin: 0, lineHeight: 1.3 }}>
              ¿Necesitas algo especial?
            </p>
            <p style={{ fontSize: 11, color: "#94a3b8", margin: "3px 0 0", lineHeight: 1.3 }}>
              Solicita un presupuesto
            </p>
          </div>
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
 
  useEffect(() => {
    const handler = e => { if (e.key === "Escape") setMobileDrawer(false) }
    document.addEventListener("keydown", handler)
    return () => document.removeEventListener("keydown", handler)
  }, [])
 
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
      <div style={{ maxWidth: 1600, margin: "0 auto", padding: "0 24px 40px" }}>
        <ProductDetail name={detail.name} variants={detail.variants} onBack={() => setDetail(null)} />
      </div>
    )
  }
 
  const hasFilters    = !!(categoryFilter || attributeTypeFilter)
  const activeFilters = [categoryFilter, attributeTypeFilter].filter(Boolean).length
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
    <div style={{ position: "relative", minHeight: "100vh" }}>
 
      {/* ── SIDEBAR FIJO (desktop) ── */}
      <aside style={{
        display: "none", /* overridden by media query class below */
        position: "fixed",
        top: NAV_H + 12,  /* 12px de respiro bajo el navbar isla */
        bottom: 0,
        left: 0,
        width: SIDEBAR_W,
        zIndex: 30,
        /* Isla — misma estética que el navbar */
        background: "white",
        borderRight: "none",
        overflow: "hidden",
      }}
        className="home-sidebar"
      >
        {/* Contenedor interior con bordes isla */}
        <div style={{
          margin: "0 12px 12px 12px",
          height: "calc(100% - 12px)",
          background: "white",
          border: "1px solid rgba(249,115,22,0.13)",
          borderRadius: 16,
          boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
          display: "flex", flexDirection: "column",
          overflow: "hidden",
        }}>
          <div style={{ flex: 1, padding: "16px 16px 12px", overflow: "hidden", display: "flex", flexDirection: "column" }}>
            <SidebarPanel {...filterProps} />
          </div>
        </div>
      </aside>
 
      {/* ── MOBILE DRAWER ── */}
      {mobileDrawer && (
        <>
          <div
            style={{
              position: "fixed", inset: 0,
              background: "rgba(15,23,42,0.18)",
              backdropFilter: "blur(2px)",
              zIndex: 40,
            }}
            onClick={() => setMobileDrawer(false)}
          />
          <aside style={{
            position: "fixed",
            top: NAV_H, bottom: 0, left: 0,
            width: 280, zIndex: 50,
            background: "white",
            boxShadow: "4px 0 32px rgba(0,0,0,0.10)",
            display: "flex", flexDirection: "column",
          }}>
            {/* Drawer header */}
            <div style={{
              display: "flex", alignItems: "center", justifyContent: "space-between",
              padding: "14px 20px",
              borderBottom: "1px solid #f1f5f9", flexShrink: 0,
            }}>
              <span style={{ fontSize: 14, fontWeight: 700, color: "#0f172a" }}>Filtros</span>
              <button
                onClick={() => setMobileDrawer(false)}
                style={{
                  width: 30, height: 30,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  borderRadius: 8, background: "none", border: "none", cursor: "pointer", color: "#94a3b8",
                }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24"
                  fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>
            <div style={{ flex: 1, overflowY: "auto", padding: "16px 20px" }}>
              <SidebarPanel {...filterProps} />
            </div>
            {/* Drawer footer */}
            <div style={{ padding: "12px 20px", borderTop: "1px solid #f1f5f9", flexShrink: 0 }}>
              <button
                onClick={() => setMobileDrawer(false)}
                style={{
                  width: "100%",
                  background: "linear-gradient(135deg, #f97316 0%, #ea580c 100%)",
                  color: "white", fontWeight: 700, fontSize: 13,
                  padding: "11px", border: "none", borderRadius: 12, cursor: "pointer",
                  boxShadow: "0 2px 8px rgba(249,115,22,0.28)",
                }}
              >
                Ver {entries.length} productos
              </button>
            </div>
          </aside>
        </>
      )}
 
      {/* ── CONTENIDO PRINCIPAL ── */}
      <div className="home-content" style={{ paddingLeft: 0 }}>
        <div style={{ margin: "0 auto", padding: "0 24px 40px" }}>
 
          {/* Featured carousel */}
          {!loading && featured.length > 0 && (
            <FeaturedCarousel
              featured={featured}
              cart={cart}
              setCart={setCart}
              onViewDetail={handleViewDetail}
            />
          )}
 
          {/* Header de contenido */}
          <div style={{
            display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 16,
            marginBottom: 20,
          }}>
            <div>
              <h1 style={{ fontSize: 22, fontWeight: 800, color: "#0f172a", margin: 0, letterSpacing: "-0.02em", lineHeight: 1 }}>
                Productos
              </h1>
              <p style={{ fontSize: 12.5, color: "#94a3b8", fontWeight: 500, margin: "6px 0 0" }}>
                {loading ? "Cargando…" : `${entries.length} ${entries.length === 1 ? "resultado" : "resultados"}`}
              </p>
            </div>
 
            <div style={{ display: "flex", alignItems: "center", gap: 8, paddingBottom: 2 }}>
              {/* Botón filtros mobile */}
              <button
                onClick={() => setMobileDrawer(true)}
                className="mobile-filter-btn"
                style={{
                  display: "none",
                  alignItems: "center", gap: 6,
                  height: 34, padding: "0 12px",
                  background: "white",
                  border: "1px solid #e2e8f0",
                  borderRadius: 10,
                  fontSize: 12.5, fontWeight: 500, color: "#64748b",
                  cursor: "pointer",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
                  transition: "all 0.13s",
                }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = "#fbd38d"; e.currentTarget.style.color = "#f97316" }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = "#e2e8f0"; e.currentTarget.style.color = "#64748b" }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24"
                  fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="4" y1="6" x2="20" y2="6"/><line x1="8" y1="12" x2="20" y2="12"/><line x1="12" y1="18" x2="20" y2="18"/>
                </svg>
                Filtros
                {activeFilters > 0 && (
                  <span style={{
                    width: 16, height: 16, borderRadius: "50%",
                    background: "#f97316", color: "white",
                    fontSize: 9, fontWeight: 700,
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}>
                    {activeFilters}
                  </span>
                )}
              </button>
 
              {/* Column switcher */}
              <div style={{
                display: "flex", alignItems: "center",
                background: "white",
                border: "1px solid #e2e8f0",
                borderRadius: 10, overflow: "hidden",
                boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
              }}>
                {[3, 4].map(n => (
                  <button
                    key={n}
                    onClick={() => setCols(n)}
                    title={`${n} columnas`}
                    style={{
                      display: "flex", alignItems: "center", gap: 5,
                      padding: "0 10px", height: 34,
                      background: cols === n ? "#f97316" : "transparent",
                      color: cols === n ? "white" : "#94a3b8",
                      border: "none",
                      borderLeft: n === 4 ? "1px solid #e2e8f0" : "none",
                      cursor: "pointer",
                      fontSize: 11.5, fontWeight: 500,
                      transition: "all 0.13s",
                    }}
                    onMouseEnter={e => { if (cols !== n) e.currentTarget.style.background = "#fff7ed"; if (cols !== n) e.currentTarget.style.color = "#f97316" }}
                    onMouseLeave={e => { if (cols !== n) e.currentTarget.style.background = "transparent"; if (cols !== n) e.currentTarget.style.color = "#94a3b8" }}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      {n === 3
                        ? <><rect x="3"    y="3" width="5"   height="18" rx="1"/><rect x="9.5"  y="3" width="5"   height="18" rx="1"/><rect x="16"   y="3" width="5"   height="18" rx="1"/></>
                        : <><rect x="2"    y="3" width="4.5" height="18" rx="1"/><rect x="7.8"  y="3" width="4.5" height="18" rx="1"/><rect x="13.1" y="3" width="4.5" height="18" rx="1"/><rect x="18.4" y="3" width="3.6" height="18" rx="1"/></>
                      }
                    </svg>
                    <span>{n}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
 
          {/* Active filter chips */}
          {hasFilters && (
            <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 8, marginBottom: 16 }}>
              {categoryFilter      && <FilterChip label={categoryFilter}      onRemove={() => setCategoryFilter("")} />}
              {attributeTypeFilter && <FilterChip label={attributeTypeFilter} onRemove={() => setAttrFilter("")} />}
              <button
                onClick={clearFilters}
                style={{ fontSize: 11.5, color: "#94a3b8", background: "none", border: "none", cursor: "pointer", fontWeight: 500 }}
                onMouseEnter={e => e.currentTarget.style.color = "#64748b"}
                onMouseLeave={e => e.currentTarget.style.color = "#94a3b8"}
              >
                Limpiar todo
              </button>
            </div>
          )}
 
          {/* Grid de productos */}
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
 
      {/* Estilos responsivos */}
      <style>{`
        @media (min-width: 1024px) {
          .home-sidebar  { display: block !important; }
          .home-content  { padding-left: ${SIDEBAR_W}px !important; }
          .mobile-filter-btn { display: none !important; }
        }
        @media (max-width: 1023px) {
          .home-sidebar  { display: none !important; }
          .mobile-filter-btn { display: flex !important; }
        }
      `}</style>
    </div>
  )
}
