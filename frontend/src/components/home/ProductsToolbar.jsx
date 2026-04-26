import FilterSelect from "./FilterSelect"
import { SearchIcon, XIcon, GridIcon3, GridIcon4 } from "./icons"

export default function ProductsToolbar({
  search, setSearch,
  stockFilter, setStockFilter,
  categoryFilter, setCategoryFilter,
  attributeTypeFilter, setAttrFilter,
  categories, attributeTypes,
  cols, setCols,
  hasFilters, clearFilters,
}) {
  return (
    <>
      <div className="flex flex-wrap items-center gap-2 mb-4">
        {/* Búsqueda */}
        <div className="relative flex-1 min-w-[160px]">
          <SearchIcon />
          <input
            type="text"
            placeholder="Buscar producto o SKU…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-[42px] pl-9 pr-4 bg-white border border-slate-200 rounded-xl text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition-all"
          />
        </div>

        <div className="h-6 w-px bg-slate-200 hidden sm:block" />

        <FilterSelect
          value={stockFilter}
          onChange={setStockFilter}
          placeholder="Stock"
          options={[
            { value: "available",    label: "Disponible" },
            { value: "out_of_stock", label: "Sin stock" },
            { value: "next_batch",   label: "Lote próximo" },
          ]}
        />

        {categories.length > 0 && (
          <FilterSelect value={categoryFilter} onChange={setCategoryFilter} options={categories} placeholder="Categoría" />
        )}

        {attributeTypes.length > 0 && (
          <FilterSelect value={attributeTypeFilter} onChange={setAttrFilter} options={attributeTypes} placeholder="Atributo" />
        )}

        {hasFilters && (
          <button
            onClick={clearFilters}
            className="h-[42px] px-3.5 flex items-center gap-1.5 text-sm font-semibold text-slate-500 bg-white border border-slate-200 rounded-xl hover:border-orange-300 hover:text-orange-500 transition-all"
          >
            <XIcon size={13} />
            Limpiar
          </button>
        )}

        <div className="h-6 w-px bg-slate-200 hidden sm:block" />

        {/* Columnas */}
        <div className="flex bg-white border border-slate-200 rounded-xl overflow-hidden shrink-0">
          {[3, 4].map((n) => (
            <button
              key={n}
              onClick={() => setCols(n)}
              className={`flex items-center gap-1.5 px-3.5 h-[42px] text-sm font-medium transition-all ${n === 4 ? "border-l border-slate-200" : ""} ${cols === n ? "bg-orange-500 text-white" : "text-slate-500 hover:bg-orange-50 hover:text-orange-500"}`}
            >
              {n === 3 ? <GridIcon3 /> : <GridIcon4 />}
              <span className="hidden sm:inline">{n}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Chips de filtros activos */}
      {hasFilters && (
        <div className="flex flex-wrap gap-2 mb-5">
          {stockFilter && (
            <FilterChip label={({ available: "Disponible", out_of_stock: "Sin stock", next_batch: "Lote próximo" })[stockFilter]} onRemove={() => setStockFilter("")} />
          )}
          {categoryFilter && (
            <FilterChip label={categoryFilter} onRemove={() => setCategoryFilter("")} />
          )}
          {attributeTypeFilter && (
            <FilterChip label={attributeTypeFilter} onRemove={() => setAttrFilter("")} />
          )}
        </div>
      )}
    </>
  )
}

function FilterChip({ label, onRemove }) {
  return (
    <span className="flex items-center gap-1.5 text-xs font-semibold bg-orange-100 text-orange-700 px-3 py-1.5 rounded-full">
      {label}
      <button onClick={onRemove} className="hover:text-orange-900">
        <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
          <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
        </svg>
      </button>
    </span>
  )
}