import { useState, useEffect } from "react"

// ── API base ───────────────────────────────────────────────────────────────────
const API = "http://localhost:8000/api"

async function apiFetch(path, options = {}) {
  const res = await fetch(`${API}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.message || `Error ${res.status}`)
  }
  return res.json()
}

const getVariants    = ()           => apiFetch("/variants")
const getVariant     = (id)         => apiFetch(`/variants/${id}`)
const createVariant  = (body)       => apiFetch("/variants", { method: "POST", body: JSON.stringify(body) })
const updateVariant  = (id, body)   => apiFetch(`/variants/${id}`, { method: "PUT", body: JSON.stringify(body) })
const deleteVariant  = (id)         => apiFetch(`/variants/${id}`, { method: "DELETE" })
const enableVariant  = (id)         => apiFetch(`/variants/${id}/enable`,  { method: "PATCH" })
const disableVariant = (id)         => apiFetch(`/variants/${id}/disable`, { method: "PATCH" })

// ── Icons ──────────────────────────────────────────────────────────────────────
const ic = (d, extra = "") => (
  <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24"
    fill="none" stroke="currentColor" strokeWidth="2.2"
    strokeLinecap="round" strokeLinejoin="round" className={extra}>
    {d}
  </svg>
)

const IconSearch  = () => ic(<><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></>)
const IconPlus    = () => ic(<><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></>)
const IconEdit    = () => ic(<><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></>)
const IconTrash   = () => ic(<><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2"/></>)
const IconToggle  = (on) => on
  ? ic(<><path d="M18 8A6 6 0 006 8v7a2 2 0 002 2h8a2 2 0 002-2V8z"/><circle cx="12" cy="14" r="1.5" fill="currentColor"/></>)
  : ic(<><path d="M18 8A6 6 0 006 8v7a2 2 0 002 2h8a2 2 0 002-2V8z"/></>)
const IconX       = () => ic(<><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></>)
const IconCheck   = () => ic(<><polyline points="20 6 9 17 4 12"/></>)

// ── Toast ──────────────────────────────────────────────────────────────────────
function Toast({ toasts }) {
  return (
    <div className="fixed bottom-5 right-5 flex flex-col gap-2 z-50 pointer-events-none">
      {toasts.map((t) => (
        <div key={t.id}
          className={`flex items-center gap-2 px-4 py-3 rounded-xl shadow-lg text-sm font-medium text-white transition-all animate-bounce-in
            ${t.type === "error" ? "bg-red-500" : "bg-emerald-500"}`}>
          {t.type === "error" ? <IconX /> : <IconCheck />}
          {t.msg}
        </div>
      ))}
    </div>
  )
}

function useToast() {
  const [toasts, setToasts] = useState([])
  function push(msg, type = "ok") {
    const id = Date.now()
    setToasts((p) => [...p, { id, msg, type }])
    setTimeout(() => setToasts((p) => p.filter((t) => t.id !== id)), 3000)
  }
  return { toasts, ok: (m) => push(m, "ok"), err: (m) => push(m, "error") }
}

// ── Badge active/inactive ──────────────────────────────────────────────────────
function Badge({ active }) {
  return (
    <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full
      ${active ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-400"}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${active ? "bg-emerald-500" : "bg-slate-300"}`} />
      {active ? "Activa" : "Inactiva"}
    </span>
  )
}

// ── Modal ──────────────────────────────────────────────────────────────────────
function Modal({ title, onClose, children }) {
  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 z-10">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-base font-extrabold text-slate-800">{title}</h2>
          <button onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors">
            <IconX />
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}

// ── VariantForm ────────────────────────────────────────────────────────────────
function VariantForm({ initial = {}, products = [], onSubmit, loading }) {
  const [form, setForm] = useState({
    product_id: initial.product?.id || initial.product_id || "",
    sku:        initial.sku   || "",
    price:      initial.price || "",
    active:     initial.active !== undefined ? initial.active : true,
  })

  const set = (k) => (e) => {
    const v = e.target.type === "checkbox" ? e.target.checked : e.target.value
    setForm((p) => ({ ...p, [k]: v }))
  }

  function handleSubmit(e) {
    e.preventDefault()
    onSubmit({ ...form, price: parseFloat(form.price) })
  }

  const inputCls = "w-full px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition-all"
  const labelCls = "block text-[11px] font-semibold text-slate-400 uppercase tracking-widest mb-1.5"

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      {/* Producto */}
      <div>
        <label className={labelCls}>Producto</label>
        <select value={form.product_id} onChange={set("product_id")} required className={inputCls}>
          <option value="">Selecciona producto…</option>
          {products.map((p) => (
            <option key={p.id} value={p.id}>{p.name}</option>
          ))}
        </select>
      </div>

      {/* SKU */}
      <div>
        <label className={labelCls}>SKU</label>
        <input
          type="text" placeholder="ej. BOMB-PRO-WHT-M"
          value={form.sku} onChange={set("sku")}
          className={inputCls}
        />
      </div>

      {/* Precio */}
      <div>
        <label className={labelCls}>Precio (€)</label>
        <input
          type="number" step="0.01" min="0" placeholder="0.00" required
          value={form.price} onChange={set("price")}
          className={inputCls}
        />
      </div>

      {/* Activa */}
      <label className="flex items-center gap-3 cursor-pointer select-none">
        <div className="relative">
          <input type="checkbox" className="sr-only" checked={form.active} onChange={set("active")} />
          <div className={`w-10 h-6 rounded-full transition-colors ${form.active ? "bg-orange-500" : "bg-slate-200"}`} />
          <div className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-transform ${form.active ? "translate-x-5" : "translate-x-1"}`} />
        </div>
        <span className="text-sm font-medium text-slate-600">Variante activa</span>
      </label>

      <button
        type="submit" disabled={loading}
        className="mt-1 w-full py-2.5 bg-orange-500 hover:bg-orange-600 active:scale-95 disabled:opacity-60 text-white text-sm font-semibold rounded-xl transition-all"
      >
        {loading ? "Guardando…" : "Guardar variante"}
      </button>
    </form>
  )
}

// ── VariantRow ─────────────────────────────────────────────────────────────────
function VariantRow({ v, onEdit, onDelete, onToggle }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 p-4 flex items-center gap-4">
      {/* Icono producto */}
      <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-orange-50 to-amber-50 flex items-center justify-center text-orange-300 shrink-0">
        <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24"
          fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
          <rect x="2" y="7" width="20" height="14" rx="2"/>
          <path d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2"/>
        </svg>
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-bold text-slate-800 truncate">{v.product?.name ?? "—"}</p>
        <p className="text-[11px] font-mono text-slate-400 truncate">{v.sku || "Sin SKU"}</p>
      </div>

      {/* Precio */}
      <span className="text-base font-extrabold text-orange-500 shrink-0">
        {parseFloat(v.price).toFixed(2)} €
      </span>

      {/* Badge */}
      <Badge active={v.active} />

      {/* Acciones */}
      <div className="flex items-center gap-1 shrink-0">
        <button onClick={() => onToggle(v)}
          title={v.active ? "Deshabilitar" : "Habilitar"}
          className={`p-2 rounded-xl transition-colors text-sm
            ${v.active
              ? "text-slate-400 hover:bg-red-50 hover:text-red-400"
              : "text-slate-400 hover:bg-emerald-50 hover:text-emerald-500"}`}>
          {v.active ? "⏸" : "▶"}
        </button>
        <button onClick={() => onEdit(v)}
          className="p-2 rounded-xl text-slate-400 hover:bg-orange-50 hover:text-orange-500 transition-colors">
          <IconEdit />
        </button>
        <button onClick={() => onDelete(v)}
          className="p-2 rounded-xl text-slate-400 hover:bg-red-50 hover:text-red-400 transition-colors">
          <IconTrash />
        </button>
      </div>
    </div>
  )
}

// ── ConfirmModal ───────────────────────────────────────────────────────────────
function ConfirmModal({ msg, onConfirm, onClose, loading }) {
  return (
    <Modal title="Confirmar acción" onClose={onClose}>
      <p className="text-sm text-slate-600 mb-6">{msg}</p>
      <div className="flex gap-3">
        <button onClick={onClose}
          className="flex-1 py-2.5 border border-slate-200 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors">
          Cancelar
        </button>
        <button onClick={onConfirm} disabled={loading}
          className="flex-1 py-2.5 bg-red-500 hover:bg-red-600 disabled:opacity-60 text-white text-sm font-semibold rounded-xl transition-all active:scale-95">
          {loading ? "Eliminando…" : "Confirmar"}
        </button>
      </div>
    </Modal>
  )
}

// ── Main ───────────────────────────────────────────────────────────────────────
export default function VariantManager() {
  const [variants, setVariants]   = useState([])
  const [products, setProducts]   = useState([])
  const [loading, setLoading]     = useState(true)
  const [search, setSearch]       = useState("")
  const [filterActive, setFilter] = useState("all") // all | active | inactive
  const [modal, setModal]         = useState(null)  // null | "create" | "edit" | "delete"
  const [editing, setEditing]     = useState(null)
  const [deleting, setDeleting]   = useState(null)
  const [saving, setSaving]       = useState(false)
  const toast = useToast()

  // ── Carga inicial ────────────────────────────────────────────────────────────
  async function load() {
    setLoading(true)
    try {
      const data = await getVariants()
      setVariants(data)
      // Extraer productos únicos desde las variantes
      const seen = {}
      data.forEach((v) => {
        if (v.product && !seen[v.product.id]) seen[v.product.id] = v.product
      })
      setProducts(Object.values(seen))
    } catch (e) {
      toast.err(e.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  // ── Filtrado ─────────────────────────────────────────────────────────────────
  const filtered = variants.filter((v) => {
    const q = search.toLowerCase()
    const matchSearch =
      (v.sku || "").toLowerCase().includes(q) ||
      (v.product?.name || "").toLowerCase().includes(q)
    const matchActive =
      filterActive === "all" ||
      (filterActive === "active" && v.active) ||
      (filterActive === "inactive" && !v.active)
    return matchSearch && matchActive
  })

  // ── CRUD handlers ────────────────────────────────────────────────────────────
  async function handleCreate(body) {
    setSaving(true)
    try {
      await createVariant(body)
      toast.ok("Variante creada")
      setModal(null)
      await load()
    } catch (e) { toast.err(e.message) }
    finally { setSaving(false) }
  }

  async function handleUpdate(body) {
    setSaving(true)
    try {
      await updateVariant(editing.id, body)
      toast.ok("Variante actualizada")
      setModal(null)
      setEditing(null)
      await load()
    } catch (e) { toast.err(e.message) }
    finally { setSaving(false) }
  }

  async function handleDelete() {
    setSaving(true)
    try {
      await deleteVariant(deleting.id)
      toast.ok("Variante eliminada")
      setModal(null)
      setDeleting(null)
      await load()
    } catch (e) { toast.err(e.message) }
    finally { setSaving(false) }
  }

  async function handleToggle(v) {
    try {
      if (v.active) {
        await disableVariant(v.id)
        toast.ok(`Variante ${v.sku} deshabilitada`)
      } else {
        await enableVariant(v.id)
        toast.ok(`Variante ${v.sku} activada`)
      }
      await load()
    } catch (e) { toast.err(e.message) }
  }

  // ── Stats ────────────────────────────────────────────────────────────────────
  const totalActive   = variants.filter((v) => v.active).length
  const totalInactive = variants.filter((v) => !v.active).length

  const filterBtns = [
    { key: "all",      label: `Todas (${variants.length})` },
    { key: "active",   label: `Activas (${totalActive})` },
    { key: "inactive", label: `Inactivas (${totalInactive})` },
  ]

  // ── Render ───────────────────────────────────────────────────────────────────
  return (
    <div>
      {/* Cabecera */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-800 tracking-tight">Variantes</h1>
          <p className="text-slate-400 text-sm mt-0.5">{filtered.length} variantes encontradas</p>
        </div>
        <button
          onClick={() => setModal("create")}
          className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 active:scale-95 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-all shadow-sm shadow-orange-200"
        >
          <IconPlus />
          Nueva variante
        </button>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        {/* Búsqueda */}
        <div className="relative flex-1">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
            <IconSearch />
          </span>
          <input
            type="text"
            placeholder="Buscar por SKU o producto…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition-all"
          />
        </div>

        {/* Filtros */}
        <div className="flex bg-white border border-slate-200 rounded-xl overflow-hidden shrink-0">
          {filterBtns.map((btn, i) => (
            <button
              key={btn.key}
              onClick={() => setFilter(btn.key)}
              className={`px-4 py-2.5 text-sm font-medium transition-all
                ${i > 0 ? "border-l border-slate-200" : ""}
                ${filterActive === btn.key
                  ? "bg-orange-500 text-white"
                  : "text-slate-500 hover:bg-orange-50 hover:text-orange-500"}`}
            >
              {btn.label}
            </button>
          ))}
        </div>
      </div>

      {/* Lista */}
      {loading ? (
        <div className="flex flex-col gap-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="bg-white rounded-2xl border border-slate-100 p-4 flex items-center gap-4 animate-pulse">
              <div className="w-11 h-11 bg-slate-100 rounded-xl shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="h-3.5 bg-slate-100 rounded w-1/3" />
                <div className="h-3 bg-slate-100 rounded w-1/4" />
              </div>
              <div className="h-5 w-16 bg-slate-100 rounded-full" />
              <div className="h-5 w-14 bg-slate-100 rounded-full" />
              <div className="flex gap-1">
                {[1,2,3].map((j) => <div key={j} className="w-8 h-8 bg-slate-100 rounded-xl" />)}
              </div>
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 text-slate-400">
          <p className="font-medium">No se encontraron variantes</p>
          <p className="text-sm mt-1">Prueba con otra búsqueda o crea una nueva</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {filtered.map((v) => (
            <VariantRow
              key={v.id}
              v={v}
              onEdit={(v) => { setEditing(v); setModal("edit") }}
              onDelete={(v) => { setDeleting(v); setModal("delete") }}
              onToggle={handleToggle}
            />
          ))}
        </div>
      )}

      {/* Modal crear */}
      {modal === "create" && (
        <Modal title="Nueva variante" onClose={() => setModal(null)}>
          <VariantForm products={products} onSubmit={handleCreate} loading={saving} />
        </Modal>
      )}

      {/* Modal editar */}
      {modal === "edit" && editing && (
        <Modal title={`Editar — ${editing.sku || editing.id}`} onClose={() => { setModal(null); setEditing(null) }}>
          <VariantForm initial={editing} products={products} onSubmit={handleUpdate} loading={saving} />
        </Modal>
      )}

      {/* Modal confirmar borrado */}
      {modal === "delete" && deleting && (
        <ConfirmModal
          msg={`¿Eliminar la variante "${deleting.sku || deleting.id}"? Esta acción no se puede deshacer.`}
          onConfirm={handleDelete}
          onClose={() => { setModal(null); setDeleting(null) }}
          loading={saving}
        />
      )}

      {/* Toasts */}
      <Toast toasts={toast.toasts} />
    </div>
  )
}