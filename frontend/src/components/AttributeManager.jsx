import { useState, useEffect } from "react"

// ── API ────────────────────────────────────────────────────────────────────────

async function apiFetchAttributes() {
  const res = await fetch("http://localhost:8000/api/attributes")
  if (!res.ok) throw new Error("Error al obtener atributos")
  return res.json()
}

async function apiCreateAttribute(name) {
  const res = await fetch("http://localhost:8000/api/attributes", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name }),
  })
  if (!res.ok) throw new Error("Error al crear atributo")
  return res.json()
}

async function apiCreateValue(attribute_type_id, value) {
  const res = await fetch("http://localhost:8000/api/attributes/values", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ attribute_type_id, value }),
  })
  if (!res.ok) throw new Error("Error al añadir valor")
  return res.json()
}

// ── Icons ──────────────────────────────────────────────────────────────────────

function PlusIcon({ size = 14 }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24"
      fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
    </svg>
  )
}

function TagIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24"
      fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z"/>
      <line x1="7" y1="7" x2="7.01" y2="7"/>
    </svg>
  )
}

function LayersIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24"
      fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="12 2 2 7 12 12 22 7 12 2"/>
      <polyline points="2 17 12 22 22 17"/>
      <polyline points="2 12 12 17 22 12"/>
    </svg>
  )
}

function ChevronIcon({ open }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24"
      fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
      style={{ transition: "transform 0.2s", transform: open ? "rotate(180deg)" : "rotate(0deg)" }}>
      <polyline points="6 9 12 15 18 9"/>
    </svg>
  )
}

function SpinnerIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24"
      fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
      className="animate-spin">
      <line x1="12" y1="2" x2="12" y2="6"/>
      <line x1="12" y1="18" x2="12" y2="22"/>
      <line x1="4.93" y1="4.93" x2="7.76" y2="7.76"/>
      <line x1="16.24" y1="16.24" x2="19.07" y2="19.07"/>
      <line x1="2" y1="12" x2="6" y2="12"/>
      <line x1="18" y1="12" x2="22" y2="12"/>
      <line x1="4.93" y1="19.07" x2="7.76" y2="16.24"/>
      <line x1="16.24" y1="7.76" x2="19.07" y2="4.93"/>
    </svg>
  )
}

// ── Section Card ───────────────────────────────────────────────────────────────

function SectionCard({ icon, title, subtitle, children }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
      <div className="flex items-center gap-3 px-5 py-4 border-b border-slate-50">
        <div className="w-8 h-8 rounded-xl bg-orange-50 flex items-center justify-center text-orange-400">
          {icon}
        </div>
        <div>
          <p className="font-bold text-slate-800 text-sm leading-tight">{title}</p>
          {subtitle && <p className="text-[11px] text-slate-400 mt-0.5">{subtitle}</p>}
        </div>
      </div>
      <div className="p-5">{children}</div>
    </div>
  )
}

// ── Attribute Row ──────────────────────────────────────────────────────────────

function AttributeRow({ attr }) {
  const [open, setOpen] = useState(false)
  const count = attr.values?.length ?? 0

  return (
    <div className="border border-slate-100 rounded-xl overflow-hidden">
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between px-4 py-3 hover:bg-slate-50 transition-colors text-left"
      >
        <div className="flex items-center gap-3">
          <span className="font-bold text-slate-700 text-sm">{attr.name}</span>
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
            count > 0
              ? "bg-orange-100 text-orange-500"
              : "bg-slate-100 text-slate-400"
          }`}>
            {count} {count === 1 ? "valor" : "valores"}
          </span>
        </div>
        <span className="text-slate-400">
          <ChevronIcon open={open} />
        </span>
      </button>

      {open && (
        <div className="px-4 pb-4 border-t border-slate-50">
          {count === 0 ? (
            <p className="text-xs text-slate-400 italic mt-3">Sin valores aún.</p>
          ) : (
            <div className="flex flex-wrap gap-1.5 mt-3">
              {attr.values.map((val) => (
                <span
                  key={val.id}
                  className="text-xs font-medium bg-slate-50 border border-slate-200 text-slate-600 px-2.5 py-1 rounded-lg font-mono"
                >
                  {val.value}
                </span>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// ── AttributeManager ──────────────────────────────────────────────────────────

export default function AttributeManager() {
  const [attributes, setAttributes] = useState([])
  const [loadingAttrs, setLoadingAttrs] = useState(true)

  const [name, setName] = useState("")
  const [creatingAttr, setCreatingAttr] = useState(false)
  const [attrError, setAttrError] = useState("")

  const [selectedType, setSelectedType] = useState("")
  const [value, setValue] = useState("")
  const [creatingVal, setCreatingVal] = useState(false)
  const [valError, setValError] = useState("")

  const fetchAttributes = async () => {
    try {
      const data = await apiFetchAttributes()
      setAttributes(data)
    } catch {
      // silently fail — data stays as-is
    } finally {
      setLoadingAttrs(false)
    }
  }

  useEffect(() => { fetchAttributes() }, [])

  async function handleCreateAttribute() {
    if (!name.trim()) { setAttrError("El nombre no puede estar vacío."); return }
    setAttrError("")
    setCreatingAttr(true)
    try {
      await apiCreateAttribute(name.trim())
      setName("")
      await fetchAttributes()
    } catch {
      setAttrError("Error al crear el atributo.")
    } finally {
      setCreatingAttr(false)
    }
  }

  async function handleCreateValue() {
    if (!selectedType) { setValError("Selecciona un atributo."); return }
    if (!value.trim()) { setValError("El valor no puede estar vacío."); return }
    setValError("")
    setCreatingVal(true)
    try {
      await apiCreateValue(selectedType, value.trim())
      setValue("")
      await fetchAttributes()
    } catch {
      setValError("Error al añadir el valor.")
    } finally {
      setCreatingVal(false)
    }
  }

  const totalValues = attributes.reduce((sum, a) => sum + (a.values?.length ?? 0), 0)

  return (
    <div>
      {/* Cabecera */}
      <div className="mb-6">
        <h1 className="text-2xl font-extrabold text-slate-800 tracking-tight">Atributos</h1>
        <p className="text-slate-400 text-sm mt-0.5">
          Gestiona los tipos de atributo y sus valores posibles.
        </p>
      </div>

      {/* Stats */}
      <div className="flex gap-3 mb-6 flex-wrap">
        {[
          { label: "Atributos", value: attributes.length },
          { label: "Valores totales", value: totalValues },
        ].map(({ label, value: v }) => (
          <div key={label} className="flex flex-col bg-orange-50 border border-orange-100 rounded-2xl px-5 py-3 min-w-[100px]">
            <span className="text-xl font-extrabold text-orange-500">{v}</span>
            <span className="text-[10px] font-semibold text-orange-300 uppercase tracking-widest mt-0.5">{label}</span>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-5">

        {/* Crear atributo */}
        <SectionCard
          icon={<TagIcon />}
          title="Nuevo atributo"
          subtitle="Define un tipo, p. ej. Color, Talla, Material"
        >
          <div className="flex gap-2">
            <input
              type="text"
              value={name}
              onChange={(e) => { setName(e.target.value); setAttrError("") }}
              onKeyDown={(e) => e.key === "Enter" && handleCreateAttribute()}
              placeholder="Ej: Color"
              className="flex-1 px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition-all"
            />
            <button
              onClick={handleCreateAttribute}
              disabled={creatingAttr}
              className="flex items-center gap-1.5 bg-orange-500 hover:bg-orange-600 disabled:opacity-50 active:scale-95 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-all"
            >
              {creatingAttr ? <SpinnerIcon /> : <PlusIcon />}
              Crear
            </button>
          </div>
          {attrError && (
            <p className="text-xs text-red-400 mt-2">{attrError}</p>
          )}
        </SectionCard>

        {/* Añadir valor */}
        <SectionCard
          icon={<LayersIcon />}
          title="Añadir valor"
          subtitle="Asigna un valor a un atributo existente"
        >
          <div className="flex flex-col gap-2">
            <select
              value={selectedType}
              onChange={(e) => { setSelectedType(e.target.value); setValError("") }}
              className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition-all appearance-none"
            >
              <option value="">Selecciona atributo…</option>
              {attributes.map((attr) => (
                <option key={attr.id} value={attr.id}>{attr.name}</option>
              ))}
            </select>
            <div className="flex gap-2">
              <input
                type="text"
                value={value}
                onChange={(e) => { setValue(e.target.value); setValError("") }}
                onKeyDown={(e) => e.key === "Enter" && handleCreateValue()}
                placeholder="Ej: Rojo"
                className="flex-1 px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition-all"
              />
              <button
                onClick={handleCreateValue}
                disabled={creatingVal}
                className="flex items-center gap-1.5 bg-orange-500 hover:bg-orange-600 disabled:opacity-50 active:scale-95 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-all"
              >
                {creatingVal ? <SpinnerIcon /> : <PlusIcon />}
                Añadir
              </button>
            </div>
          </div>
          {valError && (
            <p className="text-xs text-red-400 mt-2">{valError}</p>
          )}
        </SectionCard>
      </div>

      {/* Lista de atributos */}
      <SectionCard
        icon={<LayersIcon />}
        title="Lista de atributos"
        subtitle="Haz clic en un atributo para ver sus valores"
      >
        {loadingAttrs ? (
          <div className="flex flex-col gap-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-slate-100 rounded-xl h-11 animate-pulse" />
            ))}
          </div>
        ) : attributes.length === 0 ? (
          <div className="text-center py-8 text-slate-400">
            <p className="font-medium text-sm">No hay atributos todavía</p>
            <p className="text-xs mt-1">Crea el primero usando el formulario de arriba.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {attributes.map((attr) => (
              <AttributeRow key={attr.id} attr={attr} />
            ))}
          </div>
        )}
      </SectionCard>
    </div>
  )
}