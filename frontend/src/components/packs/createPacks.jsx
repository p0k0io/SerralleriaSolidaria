import { useState, useEffect, useRef, useCallback } from "react";
import { useAdminToast } from "../../context/AdminToastContext";

// ── ICONS ─────────────────────────────────────────────────────────────────────
const PlusIcon = ({ size = 13 }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
    strokeLinecap="round" strokeLinejoin="round" width={size} height={size}>
    <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);

const SearchIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
    strokeLinecap="round" strokeLinejoin="round" width="13" height="13">
    <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
);

const CheckIcon = ({ size = 13 }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
    strokeLinecap="round" strokeLinejoin="round" width={size} height={size}>
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

const AlertIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
    strokeLinecap="round" strokeLinejoin="round" width="13" height="13">
    <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
  </svg>
);

const CloseIcon = ({ size = 11 }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
    strokeLinecap="round" strokeLinejoin="round" width={size} height={size}>
    <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

const ChevronIcon = ({ open }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"
    strokeLinecap="round" strokeLinejoin="round" width="13" height="13"
    style={{ transform: open ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.2s cubic-bezier(0.4,0,0.2,1)" }}>
    <polyline points="6 9 12 15 18 9" />
  </svg>
);

const SpinnerIcon = () => (
  <svg className="animate-spin" width="13" height="13" viewBox="0 0 24 24"
    fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
    <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
  </svg>
);

const FolderIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"
    strokeLinecap="round" strokeLinejoin="round" width="11" height="11">
    <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
  </svg>
);

// ── SHARED STYLES ─────────────────────────────────────────────────────────────
const inputBase =
  "w-full px-3 py-2 rounded-lg border text-[13px] text-stone-800 placeholder-stone-300 " +
  "bg-white border-stone-200 transition-all duration-150 ease-out " +
  "focus:outline-none focus:ring-2 focus:ring-amber-400/25 focus:border-amber-400 " +
  "hover:border-stone-300 shadow-[inset_0_1px_2px_rgba(0,0,0,0.04)]";

// ── FIELD ─────────────────────────────────────────────────────────────────────
function Field({ label, hint, children }) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-baseline gap-2">
        <label className="block text-[10px] font-semibold text-stone-400 uppercase tracking-[0.08em]">
          {label}
        </label>
        {hint && <span className="text-[10px] text-stone-300">{hint}</span>}
      </div>
      {children}
    </div>
  );
}

// ── SEARCH INPUT ──────────────────────────────────────────────────────────────
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
      <div className={`
        flex items-center rounded-lg border overflow-hidden
        transition-all duration-150 ease-out
        shadow-[inset_0_1px_2px_rgba(0,0,0,0.04)]
        ${isSelected
          ? "border-amber-400 bg-amber-50/40 ring-2 ring-amber-400/20"
          : "border-stone-200 bg-white hover:border-stone-300 focus-within:ring-2 focus-within:ring-amber-400/25 focus-within:border-amber-400"
        }
      `}>
        <span className={`pl-3 flex-shrink-0 transition-colors duration-150 ${isSelected ? "text-amber-500" : "text-stone-300"}`}>
          {isSelected ? (
            <CheckIcon size={13} />
          ) : searching ? (
            <SpinnerIcon />
          ) : (
            <SearchIcon />
          )}
        </span>

        <input
          type="text"
          className="flex-1 px-2.5 py-2 text-[13px] text-stone-800 placeholder-stone-300 outline-none bg-transparent"
          placeholder={placeholder}
          value={query}
          onChange={handleChange}
          onFocus={() => { if (results.length > 0) setOpen(true); }}
        />

        {query && (
          <button
            type="button"
            onClick={handleClear}
            className="pr-2.5 text-stone-300 hover:text-stone-500 transition-colors duration-150 flex-shrink-0"
          >
            <CloseIcon size={11} />
          </button>
        )}
      </div>

      {/* Dropdown */}
      {open && results.length > 0 && (
        <div
          className="
            absolute top-full left-0 right-0 mt-1
            bg-white border border-stone-100 rounded-xl
            shadow-[0_8px_24px_rgba(0,0,0,0.09),0_2px_6px_rgba(0,0,0,0.05)]
            z-20 overflow-hidden max-h-52 overflow-y-auto
          "
          style={{ animation: "menuIn 0.12s cubic-bezier(0.4,0,0.2,1)" }}
        >
          <style>{`
            @keyframes menuIn {
              from { opacity: 0; transform: translateY(-4px) scale(0.98); }
              to   { opacity: 1; transform: translateY(0) scale(1); }
            }
          `}</style>
          {results.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => handleSelect(item)}
              className="w-full text-left hover:bg-stone-50 transition-colors duration-100 group"
            >
              {renderResult(item)}
            </button>
          ))}
        </div>
      )}

      {open && !searching && query.trim() && results.length === 0 && (
        <div className="
          absolute top-full left-0 right-0 mt-1
          bg-white border border-stone-100 rounded-xl
          shadow-[0_8px_24px_rgba(0,0,0,0.09)]
          z-20 px-4 py-3 text-[12px] text-stone-400 text-center
        ">
          Sin resultados para "{query}"
        </div>
      )}
    </div>
  );
}

// ── RESULT RENDERS ────────────────────────────────────────────────────────────
function VariantResult({ v }) {
  return (
    <div className="flex items-center gap-3 px-3 py-2.5">
      <div className="flex-1 min-w-0">
        <p className="text-[12px] font-medium text-stone-700 truncate group-hover:text-stone-900 transition-colors">
          {v.product?.name || "Producto"}
        </p>
        <p className="text-[11px] text-stone-400 mt-0.5">
          SKU: {v.sku || "N/A"}
          {v.price != null && <span className="ml-2 text-stone-500 font-medium">{v.price} €</span>}
        </p>
      </div>
      <span className={`
        text-[10px] font-semibold px-1.5 py-0.5 rounded-md flex-shrink-0
        ${v.active ? "bg-amber-50 text-amber-600 border border-amber-100" : "bg-stone-100 text-stone-400"}
      `}>
        {v.active ? "Activo" : "Inactivo"}
      </span>
    </div>
  );
}

function CategoryResult({ cat }) {
  return (
    <div className="flex items-center gap-3 px-3 py-2.5">
      <div className="flex-1 min-w-0">
        <p className="text-[12px] font-medium text-stone-700 truncate group-hover:text-stone-900 transition-colors">
          {cat.name}
        </p>
        {(cat.parent || cat.description) && (
          <p className="text-[11px] text-stone-400 mt-0.5 truncate">
            {cat.parent ? `en ${cat.parent.name}` : cat.description}
          </p>
        )}
      </div>
      {cat.children?.length > 0 && (
        <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-md bg-stone-100 text-stone-400 flex-shrink-0">
          {cat.children.length} sub
        </span>
      )}
    </div>
  );
}

// ── MAIN ──────────────────────────────────────────────────────────────────────
export default function CreatePack({ onCreated }) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [active, setActive] = useState(true);
  const [rows, setRows] = useState([{ variant: null, quantity: 1 }]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [packCategories, setPackCategories] = useState([]);
  const [catSearch, setCatSearch] = useState(null);
  const { showToast } = useAdminToast();

  function addRow() { setRows([...rows, { variant: null, quantity: 1 }]); }
  function removeRow(i) { setRows(rows.filter((_, idx) => idx !== i)); }
  function setRowVariant(i, variant) { const n = [...rows]; n[i].variant = variant; setRows(n); }
  function setRowQty(i, qty) { const n = [...rows]; n[i].quantity = qty; setRows(n); }

  function handleAddCategory(cat) {
    if (!cat) return;
    if (!packCategories.find((c) => c.id === cat.id)) {
      setPackCategories([...packCategories, cat]);
    }
    setCatSearch(null);
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
      setMessage(`success:${data.name || name}`);
      showToast(`Pack "${data.name || name}" creado correctamente`);
      resetForm();
      if (onCreated) onCreated();
      setTimeout(() => { setOpen(false); setMessage(""); }, 1800);
    } catch (err) {
      setMessage(`error:${err.message}`);
      showToast(err.message, "error");
    } finally {
      setLoading(false);
    }
  }

  const isSuccess = message.startsWith("success:");
  const isError = message.startsWith("error:");
  const successName = isSuccess ? message.replace("success:", "") : "";
  const errorText = isError ? message.replace("error:", "") : message;

  return (
    <div className={`
      rounded-xl border overflow-hidden
      transition-all duration-200 ease-out
      ${open
        ? "border-stone-200 bg-white shadow-[0_2px_8px_rgba(0,0,0,0.06),0_0_0_1px_rgba(0,0,0,0.03)]"
        : "border-stone-150 bg-white shadow-[0_1px_3px_rgba(0,0,0,0.04)] hover:shadow-[0_2px_6px_rgba(0,0,0,0.07)] hover:border-stone-200"
      }
    `}>

      {/* ── TOGGLE HEADER ── */}
      <button
        type="button"
        onClick={() => { setOpen((p) => !p); setMessage(""); }}
        className="w-full flex items-center gap-3 px-4 py-3.5 text-left group focus:outline-none"
      >
        <div className={`
          w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0
          transition-all duration-200 ease-out
          ${open
            ? "bg-amber-500 text-white shadow-[0_1px_3px_rgba(245,158,11,0.35)]"
            : "bg-stone-100 text-stone-400 group-hover:bg-stone-150 group-hover:text-stone-500"
          }
        `}>
          <div style={{
            transform: open ? "rotate(45deg)" : "rotate(0deg)",
            transition: "transform 0.2s cubic-bezier(0.4,0,0.2,1)"
          }}>
            <PlusIcon size={13} />
          </div>
        </div>

        <div className="flex-1 min-w-0">
          <p className={`text-[13px] font-medium transition-colors duration-150 ${open ? "text-stone-900" : "text-stone-600 group-hover:text-stone-800"}`}>
            Crear nuevo pack
          </p>
          {!open && (
            <p className="text-[11px] text-stone-400 mt-0 leading-tight">
              Nombre, variantes, categorías y más
            </p>
          )}
        </div>

        <span className={`transition-colors duration-150 ${open ? "text-stone-400" : "text-stone-300 group-hover:text-stone-400"}`}>
          <ChevronIcon open={open} />
        </span>
      </button>

      {/* ── FORM ── */}
      {open && (
        <div
          className="border-t border-stone-100 px-4 pb-4 pt-4 space-y-4"
          style={{ animation: "slideDown 0.18s cubic-bezier(0.4,0,0.2,1)" }}
        >
          <style>{`
            @keyframes slideDown {
              from { opacity: 0; transform: translateY(-6px); }
              to   { opacity: 1; transform: translateY(0); }
            }
          `}</style>

          {/* Feedback */}
          {(isSuccess || isError || (!isSuccess && !isError && message)) && (
            <div className={`
              flex items-start gap-2 px-3 py-2.5 rounded-lg text-[12px] font-medium border
              ${isSuccess
                ? "bg-emerald-50 text-emerald-700 border-emerald-100"
                : "bg-red-50 text-red-600 border-red-100"
              }
            `}>
              <span className="mt-0.5 flex-shrink-0 opacity-80">
                {isSuccess ? <CheckIcon /> : <AlertIcon />}
              </span>
              <span className="leading-snug">
                {isSuccess
                  ? <>Pack <strong className="font-semibold">"{successName}"</strong> creado con éxito</>
                  : errorText
                }
              </span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">

            {/* Nombre */}
            <Field label="Nombre *">
              <input
                type="text"
                className={inputBase}
                placeholder="Ej: Pack de herramientas básico"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                autoFocus
              />
            </Field>

            {/* Descripción */}
            <Field label="Descripción">
              <textarea
                className={`${inputBase} resize-none leading-relaxed`}
                placeholder="Descripción del pack…"
                rows="3"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </Field>

            {/* Toggle activo */}
            <div className="flex items-center justify-between px-3 py-2.5 bg-stone-50 border border-stone-100 rounded-lg">
              <div>
                <p className="text-[13px] font-medium text-stone-700">Pack activo</p>
                <p className="text-[11px] text-stone-400 mt-0.5">Visible en la tienda</p>
              </div>
              <button
                type="button"
                onClick={() => setActive((p) => !p)}
                className={`
                  relative inline-flex h-5 w-9 items-center rounded-full
                  transition-colors duration-200 ease-out focus:outline-none
                  ${active ? "bg-amber-500" : "bg-stone-200"}
                `}
              >
                <span className={`
                  inline-block h-3.5 w-3.5 rounded-full bg-white
                  shadow-[0_1px_3px_rgba(0,0,0,0.2)]
                  transition-transform duration-200 ease-out
                  ${active ? "translate-x-4.5" : "translate-x-0.5"}
                `} />
              </button>
            </div>

            {/* Categorías */}
            <Field label="Categorías" hint="Busca y añade">
              {packCategories.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {packCategories.map((cat) => (
                    <span key={cat.id} className="
                      inline-flex items-center gap-1.5 px-2 py-1
                      bg-amber-50 text-amber-700 border border-amber-100
                      rounded-md text-[11px] font-medium
                    ">
                      <FolderIcon />
                      {cat.name}
                      {cat.parent && <span className="text-amber-400">· {cat.parent.name}</span>}
                      <button
                        type="button"
                        onClick={() => removeCategory(cat.id)}
                        className="text-amber-400 hover:text-amber-700 transition-colors duration-100 ml-0.5"
                      >
                        <CloseIcon size={9} />
                      </button>
                    </span>
                  ))}
                </div>
              )}
              <div className="flex gap-2">
                <SearchInput
                  value={catSearch}
                  onSelect={setCatSearch}
                  placeholder="Buscar categoría…"
                  fetchUrl="http://localhost:8000/api/categories"
                  renderResult={(cat) => <CategoryResult cat={cat} />}
                  renderSelected={(cat) => cat.name}
                />
                <button
                  type="button"
                  onClick={() => handleAddCategory(catSearch)}
                  disabled={!catSearch}
                  className="
                    px-3 py-2 rounded-lg border border-stone-200 bg-white
                    text-[12px] font-semibold text-stone-500
                    hover:bg-stone-50 hover:border-stone-300 hover:text-stone-700
                    disabled:opacity-40 disabled:cursor-not-allowed
                    transition-all duration-150 flex-shrink-0
                    flex items-center gap-1
                  "
                >
                  <PlusIcon size={12} />
                  <span>Añadir</span>
                </button>
              </div>
            </Field>

            {/* Variantes */}
            <Field label="Variantes incluidas" hint="Nombre del producto o SKU">
              <div className="space-y-2">
                {rows.map((row, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <SearchInput
                      value={row.variant}
                      onSelect={(v) => setRowVariant(idx, v)}
                      placeholder="Buscar por nombre o SKU…"
                      fetchUrl="http://localhost:8000/api/variants"
                      renderResult={(v) => <VariantResult v={v} />}
                      renderSelected={(v) => v.display || `${v.product?.name || "Producto"} — SKU: ${v.sku}`}
                    />
                    <input
                      type="number"
                      min="1"
                      className={`${inputBase} w-16 text-center flex-shrink-0 px-2`}
                      value={row.quantity}
                      onChange={(e) => setRowQty(idx, parseInt(e.target.value) || 1)}
                    />
                    {rows.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeRow(idx)}
                        className="
                          p-1.5 rounded-md flex-shrink-0
                          text-stone-300 hover:text-red-400 hover:bg-red-50
                          transition-all duration-150
                        "
                      >
                        <CloseIcon size={11} />
                      </button>
                    )}
                  </div>
                ))}

                <button
                  type="button"
                  onClick={addRow}
                  className="
                    flex items-center gap-1.5 mt-1
                    text-[12px] font-medium text-amber-600
                    hover:text-amber-700 transition-colors duration-150
                  "
                >
                  <PlusIcon size={12} />
                  Agregar variante
                </button>
              </div>
            </Field>

            {/* Actions */}
            <div className="flex items-center gap-2 pt-0.5">
              <button
                type="button"
                onClick={() => { resetForm(); setOpen(false); }}
                className="
                  px-3.5 py-2 rounded-lg border border-stone-200 bg-white
                  text-[12px] font-medium text-stone-500
                  hover:bg-stone-50 hover:border-stone-300 hover:text-stone-700
                  active:bg-stone-100 active:scale-[0.98]
                  transition-all duration-150
                "
              >
                Cancelar
              </button>

              <button
                type="submit"
                disabled={loading}
                className="
                  flex-1 flex items-center justify-center gap-1.5
                  py-2 rounded-lg
                  text-[12px] font-semibold text-white
                  bg-amber-500 hover:bg-amber-500/90
                  active:bg-amber-600 active:scale-[0.99]
                  disabled:opacity-50 disabled:cursor-not-allowed
                  shadow-[0_1px_3px_rgba(245,158,11,0.3),inset_0_1px_0_rgba(255,255,255,0.15)]
                  transition-all duration-150
                "
              >
                {loading ? (
                  <><SpinnerIcon /><span>Creando…</span></>
                ) : (
                  <><PlusIcon size={12} /><span>Crear pack</span></>
                )}
              </button>
            </div>

          </form>
        </div>
      )}
    </div>
  );
}