import { useState, useEffect, useRef, useCallback } from "react";

function SearchInput({ value, onSelect, placeholder, fetchUrl, renderResult, renderSelected }) {
  const [query, setQuery] = useState(value ? renderSelected(value) : "");
  const [results, setResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [open, setOpen] = useState(false);
  const debounceRef = useRef(null);
  const containerRef = useRef(null);

  useEffect(() => {
    function handle(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, []);

  useEffect(() => {
    if (value) setQuery(renderSelected(value));
  }, [value?.id]);

  const search = useCallback((q) => {
    const trimmed = q.trim();
    if (!trimmed) { setResults([]); setOpen(false); return; }
    setSearching(true);
    fetch(`${fetchUrl}?search=${encodeURIComponent(trimmed)}`)
      .then((r) => r.json())
      .then((data) => { setResults(data); setOpen(data.length > 0); })
      .catch(() => setResults([]))
      .finally(() => setSearching(false));
  }, [fetchUrl]);

  function handleChange(e) {
    const q = e.target.value;
    setQuery(q);
    if (value?.id) onSelect(null);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => search(q), 300);
  }

  function handleSelect(item) {
    setQuery(renderSelected(item));
    setOpen(false);
    setResults([]);
    onSelect(item);
  }

  function handleClear() {
    setQuery(""); setResults([]); setOpen(false); onSelect(null);
  }

  const isSelected = !!value?.id;

  return (
    <div ref={containerRef} className="relative w-full">
      <div className={`flex items-center border rounded-xl overflow-hidden transition ${
        isSelected ? "border-orange-400 bg-orange-50" : "border-slate-200 bg-white"
      } focus-within:ring-2 focus-within:ring-orange-500 focus-within:border-orange-500`}>
        <span className={`pl-3 flex-shrink-0 ${isSelected ? "text-orange-500" : "text-slate-300"}`}>
          {isSelected ? (
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
          ) : searching ? (
            <svg className="animate-spin" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
          ) : (
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          )}
        </span>
        <input
          type="text"
          className="flex-1 px-2.5 py-2.5 text-sm outline-none bg-transparent placeholder-slate-400"
          placeholder={placeholder}
          value={query}
          onChange={handleChange}
          onFocus={() => { if (results.length > 0) setOpen(true); }}
        />
        {query && (
          <button type="button" onClick={handleClear} className="pr-3 text-slate-300 hover:text-slate-500 transition flex-shrink-0">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        )}
      </div>

      {open && results.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-100 rounded-xl shadow-lg z-20 overflow-hidden max-h-52 overflow-y-auto">
          {results.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => handleSelect(item)}
              className="w-full text-left hover:bg-orange-50 transition group"
            >
              {renderResult(item)}
            </button>
          ))}
        </div>
      )}

      {open && !searching && query.trim() && results.length === 0 && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-100 rounded-xl shadow-lg z-20 px-4 py-3 text-sm text-slate-400 text-center">
          Sin resultados para "{query}"
        </div>
      )}
    </div>
  );
}

function VariantResult({ v }) {
  return (
    <div className="flex items-center gap-3 px-4 py-2.5">
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-slate-700 truncate group-hover:text-orange-700">
          {v.product?.name || "Producto"}
        </p>
        <p className="text-xs text-slate-400">
          SKU: {v.sku || "N/A"}
          {v.price != null && <span className="ml-2 text-slate-500 font-medium">{v.price} €</span>}
        </p>
      </div>
      <span className={`text-xs px-2 py-0.5 rounded-full flex-shrink-0 ${
        v.active ? "bg-orange-100 text-orange-600" : "bg-slate-100 text-slate-400"
      }`}>
        {v.active ? "Activo" : "Inactivo"}
      </span>
    </div>
  );
}

function CategoryResult({ cat }) {
  return (
    <div className="flex items-center gap-3 px-4 py-2.5">
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-slate-700 truncate group-hover:text-orange-700">
          {cat.name}
        </p>
        {cat.parent && (
          <p className="text-xs text-slate-400">en {cat.parent.name}</p>
        )}
        {cat.description && (
          <p className="text-xs text-slate-400 truncate">{cat.description}</p>
        )}
      </div>
      {cat.children?.length > 0 && (
        <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-400 flex-shrink-0">
          {cat.children.length} sub
        </span>
      )}
    </div>
  );
}

export default function CreatePack() {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [active, setActive] = useState(true);
  const [rows, setRows] = useState([{ variant: null, quantity: 1 }]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  // Categorías como objetos seleccionados desde la API
  const [packCategories, setPackCategories] = useState([]); // [{ id, name, ... }]
  const [catSearch, setCatSearch] = useState(null); // categoría en el buscador temporal

  function addRow() { setRows([...rows, { variant: null, quantity: 1 }]); }
  function removeRow(i) { setRows(rows.filter((_, idx) => idx !== i)); }
  function setRowVariant(i, variant) { const n = [...rows]; n[i].variant = variant; setRows(n); }
  function setRowQty(i, qty) { const n = [...rows]; n[i].quantity = qty; setRows(n); }

  function handleAddCategory(cat) {
    if (!cat) return;
    if (!packCategories.find((c) => c.id === cat.id)) {
      setPackCategories([...packCategories, cat]);
    }
    setCatSearch(null); // limpia el buscador tras añadir
  }

  function removeCategory(id) { setPackCategories(packCategories.filter((c) => c.id !== id)); }

  function resetForm() {
    setName(""); setDescription(""); setActive(true);
    setRows([{ variant: null, quantity: 1 }]);
    setPackCategories([]); setCatSearch(null); setMessage("");
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setMessage("");
    if (!name.trim()) { setMessage("El nombre del pack es obligatorio"); return; }
    const validRows = rows.filter((r) => r.variant?.id);
    if (validRows.length === 0) { setMessage("Debes seleccionar al menos una variante"); return; }
    const ids = validRows.map((r) => r.variant.id);
    if (new Set(ids).size !== ids.length) { setMessage("No puedes repetir la misma variante"); return; }

    setLoading(true);
    try {
      const res = await fetch("http://localhost:8000/api/packs", {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          description: description.trim(),
          active,
          categories: packCategories.map((c) => c.id),
          items: validRows.map((r) => ({
            variant_id: r.variant.id,
            quantity: parseInt(r.quantity) || 1,
          })),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || data.error || "Error al crear el pack");
      setMessage(`✓ Pack "${data.name || name}" creado con éxito`);
      resetForm();
      setTimeout(() => { setOpen(false); setMessage(""); }, 1800);
    } catch (err) {
      console.error(err);
      setMessage(err.message);
    } finally {
      setLoading(false);
    }
  }

  const isSuccess = message.startsWith("✓");

  return (
    <div className={`bg-white rounded-2xl border transition-all duration-200 ${
      open ? "border-orange-200 shadow-md" : "border-slate-100 shadow-sm hover:shadow-md hover:border-slate-200"
    }`}>

      {/* ── Cabecera / toggle ── */}
      <button
        type="button"
        onClick={() => { setOpen((p) => !p); setMessage(""); }}
        className="w-full flex items-center gap-4 p-4 text-left"
      >
        <div className={`w-2 h-10 rounded-full flex-shrink-0 transition-colors ${open ? "bg-orange-500" : "bg-slate-200"}`} />
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-slate-800">Crear nuevo pack</p>
          <p className="text-slate-400 text-sm">Nombre, variantes, categorías y más</p>
        </div>
        <div className={`w-8 h-8 flex items-center justify-center rounded-full transition-colors flex-shrink-0 ${
          open ? "bg-orange-100 text-orange-600" : "bg-slate-100 text-slate-400"
        }`}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
            strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
            className={`transition-transform duration-200 ${open ? "rotate-180" : ""}`}>
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </div>
      </button>

      {/* ── Formulario ── */}
      {open && (
        <div className="border-t border-slate-100 px-6 py-5">

          {message && (
            <div className={`mb-5 flex items-center gap-2.5 px-4 py-3 rounded-xl text-sm font-medium ${
              isSuccess
                ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                : "bg-red-50 text-red-600 border border-red-200"
            }`}>
              {isSuccess
                ? <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                : <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
              }
              {message}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">

            {/* Nombre */}
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">Nombre *</label>
              <input
                type="text"
                className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition"
                placeholder="Ej: Pack de herramientas básico"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            {/* Descripción */}
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">Descripción</label>
              <textarea
                className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition resize-none"
                placeholder="Descripción del pack..."
                rows="3"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            {/* Toggle activo */}
            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
              <div>
                <p className="text-sm font-medium text-slate-700">Pack activo</p>
                <p className="text-xs text-slate-400">Visible en la tienda</p>
              </div>
              <button
                type="button"
                onClick={() => setActive((p) => !p)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${active ? "bg-orange-500" : "bg-slate-200"}`}
              >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${active ? "translate-x-6" : "translate-x-1"}`} />
              </button>
            </div>

            {/* ── Categorías con búsqueda ── */}
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">Categorías</label>
              <p className="text-xs text-slate-400 mb-3">Busca y añade las categorías del pack</p>

              {/* Chips de categorías ya añadidas */}
              {packCategories.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-3">
                  {packCategories.map((cat) => (
                    <span key={cat.id} className="inline-flex items-center gap-1.5 px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-xs font-medium">
                      {cat.name}
                      {cat.parent && <span className="text-orange-400">· {cat.parent.name}</span>}
                      <button type="button" onClick={() => removeCategory(cat.id)} className="hover:text-orange-900 transition ml-0.5">
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                      </button>
                    </span>
                  ))}
                </div>
              )}

              {/* Buscador + botón añadir */}
              <div className="flex gap-2">
                <SearchInput
                  value={catSearch}
                  onSelect={setCatSearch}
                  placeholder="Buscar categoría..."
                  fetchUrl="http://localhost:8000/api/categories"
                  renderResult={(cat) => <CategoryResult cat={cat} />}
                  renderSelected={(cat) => cat.name}
                />
                <button
                  type="button"
                  onClick={() => handleAddCategory(catSearch)}
                  disabled={!catSearch}
                  className="px-4 py-2.5 bg-orange-600 hover:bg-orange-500 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-xl text-sm font-semibold transition flex-shrink-0"
                >
                  +
                </button>
              </div>
            </div>

            {/* ── Variantes con búsqueda ── */}
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">Variantes incluidas</label>
              <p className="text-xs text-slate-400 mb-3">Escribe el nombre del producto o SKU para buscar</p>
              <div className="space-y-2">
                {rows.map((row, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <SearchInput
                      value={row.variant}
                      onSelect={(v) => setRowVariant(idx, v)}
                      placeholder="Buscar por nombre o SKU..."
                      fetchUrl="http://localhost:8000/api/variants"
                      renderResult={(v) => <VariantResult v={v} />}
                      renderSelected={(v) => v.display || `${v.product?.name || "Producto"} — SKU: ${v.sku}`}
                    />
                    <input
                      type="number" min="1"
                      className="w-20 px-3 py-2.5 border border-slate-200 rounded-xl text-sm text-center focus:ring-2 focus:ring-orange-500 outline-none transition"
                      value={row.quantity}
                      onChange={(e) => setRowQty(idx, parseInt(e.target.value) || 1)}
                    />
                    {rows.length > 1 && (
                      <button
                        type="button" onClick={() => removeRow(idx)}
                        className="p-2 rounded-lg hover:bg-red-50 text-slate-300 hover:text-red-400 transition flex-shrink-0"
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                      </button>
                    )}
                  </div>
                ))}
                <button
                  type="button" onClick={addRow}
                  className="flex items-center gap-1.5 text-sm text-orange-600 hover:text-orange-700 font-medium mt-1 transition"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                  Agregar variante
                </button>
              </div>
            </div>

            {/* Footer */}
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => { resetForm(); setOpen(false); }}
                className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 border border-slate-200 rounded-xl transition"
              >
                Cancelar
              </button>
              <button
                type="submit" disabled={loading}
                className="px-5 py-2 text-sm font-semibold bg-orange-600 hover:bg-orange-500 text-white rounded-xl transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Creando…" : "Crear pack"}
              </button>
            </div>

          </form>
        </div>
      )}
    </div>
  );
}