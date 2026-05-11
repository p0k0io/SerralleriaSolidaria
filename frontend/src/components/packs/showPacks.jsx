import { useEffect, useState, useRef } from "react";

// ── ICONS ─────────────────────────────────────────────────────────────────────
const DotsIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
    <circle cx="5" cy="12" r="2" /><circle cx="12" cy="12" r="2" /><circle cx="19" cy="12" r="2" />
  </svg>
);

const EyeIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"
    strokeLinecap="round" strokeLinejoin="round" width="13" height="13">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

const EditIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"
    strokeLinecap="round" strokeLinejoin="round" width="13" height="13">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
  </svg>
);

const CheckIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
    strokeLinecap="round" strokeLinejoin="round" width="13" height="13">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

const CloseIcon = ({ size = 13 }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
    strokeLinecap="round" strokeLinejoin="round" width={size} height={size}>
    <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

const TrashIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"
    strokeLinecap="round" strokeLinejoin="round" width="13" height="13">
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
    <path d="M10 11v6M14 11v6" />
    <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
  </svg>
);

const PlusIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
    strokeLinecap="round" strokeLinejoin="round" width="13" height="13">
    <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);

const ChevronIcon = ({ open }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"
    strokeLinecap="round" strokeLinejoin="round" width="12" height="12"
    style={{ transform: open ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.2s cubic-bezier(0.4,0,0.2,1)" }}>
    <polyline points="6 9 12 15 18 9" />
  </svg>
);

const ImagePlaceholder = () => (
  <div className="w-8 h-8 rounded-lg bg-stone-100 border border-stone-100 flex items-center justify-center flex-shrink-0">
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#d1d5db" strokeWidth="2">
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <circle cx="8.5" cy="8.5" r="1.5" />
      <polyline points="21 15 16 10 5 21" />
    </svg>
  </div>
);

// ── ACTION MENU ───────────────────────────────────────────────────────────────
function ActionMenu({ pack, onEdit, onToggle, onViewVariants, onDelete, isOpen }) {
  const [show, setShow] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    function handleClick(e) {
      if (ref.current && !ref.current.contains(e.target)) setShow(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setShow((p) => !p)}
        className={`
          w-7 h-7 flex items-center justify-center rounded-md
          transition-all duration-150 ease-out
          ${show ? "bg-stone-100 text-stone-700" : "text-stone-300 hover:text-stone-600 hover:bg-stone-100"}
        `}
      >
        <DotsIcon />
      </button>

      {show && (
        <div
          className="
            absolute right-0 mt-1 w-44 bg-white
            rounded-xl border border-stone-100
            shadow-[0_8px_24px_rgba(0,0,0,0.09),0_2px_6px_rgba(0,0,0,0.05)]
            z-30 p-1 overflow-hidden
          "
          style={{ animation: "menuIn 0.12s cubic-bezier(0.4,0,0.2,1)" }}
        >
          <style>{`
            @keyframes menuIn {
              from { opacity: 0; transform: translateY(-4px) scale(0.97); }
              to   { opacity: 1; transform: translateY(0) scale(1); }
            }
          `}</style>

          <MenuBtn icon={<EyeIcon />} label={isOpen ? "Ocultar variantes" : "Ver variantes"}
            onClick={() => { onViewVariants(); setShow(false); }} />
          <MenuBtn icon={<EditIcon />} label="Editar pack"
            onClick={() => { onEdit(); setShow(false); }} />

          <div className="my-1 mx-1 border-t border-stone-100" />

          <MenuBtn
            icon={pack.active ? <CloseIcon size={12} /> : <CheckIcon />}
            label={pack.active ? "Desactivar" : "Activar"}
            onClick={() => { onToggle(); setShow(false); }}
            variant={pack.active ? "warning" : "success"}
          />
          <MenuBtn icon={<TrashIcon />} label="Eliminar pack"
            onClick={() => { onDelete(); setShow(false); }} variant="danger" />
        </div>
      )}
    </div>
  );
}

function MenuBtn({ icon, label, onClick, variant }) {
  const color =
    variant === "danger"   ? "text-red-500 hover:bg-red-50/60 hover:text-red-600" :
    variant === "success"  ? "text-emerald-600 hover:bg-emerald-50/60" :
    variant === "warning"  ? "text-amber-600 hover:bg-amber-50/60" :
    "text-stone-600 hover:bg-stone-50 hover:text-stone-900";

  return (
    <button onClick={onClick}
      className={`w-full flex items-center gap-2 px-2.5 py-1.5 text-[12px] font-medium rounded-lg transition-colors duration-100 ${color}`}>
      <span className="opacity-80">{icon}</span>
      {label}
    </button>
  );
}

// ── SKELETON ──────────────────────────────────────────────────────────────────
function SkeletonCard() {
  return (
    <div className="bg-white rounded-xl border border-stone-100 px-3.5 py-3 flex items-center gap-3 animate-pulse"
      style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
      <div className="w-8 h-8 rounded-lg bg-stone-100 flex-shrink-0" />
      <div className="flex-1 space-y-1.5">
        <div className="h-3 bg-stone-100 rounded-full w-1/3" />
        <div className="h-2 bg-stone-50 rounded-full w-1/2" />
      </div>
      <div className="h-3 bg-stone-100 rounded-full w-12" />
    </div>
  );
}

// ── PACK CARD ─────────────────────────────────────────────────────────────────
function PackCard({ pack, isOpen, onToggleOpen, onEdit, onToggle, onDelete, onRemoveVariant }) {
  const totalPrice = pack.items?.reduce((sum, i) => sum + (i.variant?.price || 0) * i.quantity, 0) ?? 0;
  const initial = pack.name.charAt(0).toUpperCase();

  return (
    <div className={`
      bg-white rounded-xl border overflow-hidden
      transition-all duration-200 ease-out
      ${isOpen
        ? "border-stone-200 shadow-[0_2px_8px_rgba(0,0,0,0.06),0_0_0_1px_rgba(0,0,0,0.03)]"
        : "border-stone-100 shadow-[0_1px_3px_rgba(0,0,0,0.04)] hover:border-stone-200 hover:shadow-[0_2px_8px_rgba(0,0,0,0.06)] hover:-translate-y-px"
      }
    `}>
      {/* Header */}
      <div className="flex items-center gap-3 px-3.5 py-3">
        {/* Avatar */}
        <div className={`
          w-8 h-8 rounded-lg flex-shrink-0 flex items-center justify-center
          ${pack.active
            ? "bg-gradient-to-br from-amber-50 to-orange-100 border border-amber-100/60"
            : "bg-stone-100 border border-stone-100"
          }
        `}>
          <span className={`text-[12px] font-semibold leading-none ${pack.active ? "text-amber-700" : "text-stone-400"}`}>
            {initial}
          </span>
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="font-medium text-[13px] text-stone-800 truncate">{pack.name}</p>
            <span className={`
              text-[10px] font-semibold px-1.5 py-0.5 rounded-md
              ${pack.active
                ? "bg-amber-50 text-amber-600 border border-amber-100"
                : "bg-stone-100 text-stone-400"
              }
            `}>
              {pack.active ? "Activo" : "Inactivo"}
            </span>
          </div>
          {pack.description && (
            <p className="text-[11px] text-stone-400 truncate mt-0.5">{pack.description}</p>
          )}
        </div>

        {/* Stats */}
        <div className="hidden sm:flex items-center gap-3 flex-shrink-0">
          <div className="text-right">
            <p className="text-[11px] text-stone-400">{pack.items?.length || 0} variante{pack.items?.length !== 1 ? "s" : ""}</p>
            <p className="text-[12px] font-semibold text-stone-700">{totalPrice.toFixed(2)} €</p>
          </div>

          {/* Expand button */}
          <button
            onClick={onToggleOpen}
            className={`
              flex items-center gap-1 px-2 py-1 rounded-md
              text-[11px] font-medium
              transition-all duration-150
              ${isOpen
                ? "bg-stone-100 text-stone-600"
                : "text-stone-400 hover:bg-stone-100 hover:text-stone-600"
              }
            `}
          >
            <ChevronIcon open={isOpen} />
          </button>
        </div>

        <ActionMenu
          pack={pack}
          onEdit={onEdit}
          onToggle={onToggle}
          onViewVariants={onToggleOpen}
          onDelete={onDelete}
          isOpen={isOpen}
        />
      </div>

      {/* Mobile stats */}
      <div className="sm:hidden flex items-center gap-3 text-[11px] px-3.5 pb-2.5">
        <span className="text-stone-400">{pack.items?.length || 0} variante{pack.items?.length !== 1 ? "s" : ""}</span>
        <span className="text-stone-200">·</span>
        <span className="font-semibold text-stone-600">{totalPrice.toFixed(2)} €</span>
      </div>

      {/* Variants panel */}
      {isOpen && (
        <div
          className="border-t border-stone-100 px-3.5 py-3 space-y-1.5"
          style={{ animation: "slideDown 0.15s cubic-bezier(0.4,0,0.2,1)" }}
        >
          <style>{`
            @keyframes slideDown {
              from { opacity: 0; transform: translateY(-4px); }
              to   { opacity: 1; transform: translateY(0); }
            }
          `}</style>

          {pack.items?.length > 0 ? (
            pack.items.map((item) => (
              <div
                key={item.id}
                className="group flex items-center gap-2.5 bg-stone-50 rounded-lg px-3 py-2 border border-stone-100 hover:border-stone-200 transition-all duration-150"
              >
                {item.variant?.image ? (
                  <img
                    src={item.variant.image}
                    alt={item.variant?.sku}
                    className="w-8 h-8 rounded-lg object-cover flex-shrink-0 border border-stone-200"
                  />
                ) : (
                  <ImagePlaceholder />
                )}

                <div className="flex-1 min-w-0">
                  <p className="text-[12px] font-medium text-stone-700 truncate">
                    {item.variant?.product?.name || "Producto"}
                    <span className="text-stone-400 font-normal ml-1">— {item.variant?.sku}</span>
                  </p>
                  <p className="text-[11px] text-stone-400 mt-0.5">
                    Cant. {item.quantity} · {item.variant?.price} € u.
                  </p>
                </div>

                <span className={`
                  text-[10px] font-semibold px-1.5 py-0.5 rounded-md flex-shrink-0
                  ${item.variant?.active
                    ? "bg-amber-50 text-amber-600 border border-amber-100"
                    : "bg-stone-100 text-stone-400"
                  }
                `}>
                  {item.variant?.active ? "Activo" : "Inactivo"}
                </span>

                <button
                  onClick={() => onRemoveVariant(pack.id, item.variant_id)}
                  className="opacity-0 group-hover:opacity-100 p-1 rounded-md text-stone-300 hover:text-red-400 hover:bg-red-50 transition-all duration-150 flex-shrink-0"
                  title="Quitar del pack"
                >
                  <CloseIcon size={11} />
                </button>
              </div>
            ))
          ) : (
            <p className="text-[12px] text-stone-400 text-center py-4">Este pack no tiene variantes</p>
          )}
        </div>
      )}
    </div>
  );
}

// ── MAIN ──────────────────────────────────────────────────────────────────────
export default function ShowPacks({ refreshSignal }) {
  const [packs, setPacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openPack, setOpenPack] = useState(null);
  const [refresh, setRefresh] = useState(false);
  const [editingPack, setEditingPack] = useState(null);

  async function getPacks() {
    try {
      const res = await fetch("http://localhost:8000/api/packs");
      if (!res.ok) throw new Error("Error al obtener packs");
      const data = await res.json();
      setPacks(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { getPacks(); }, [refresh, refreshSignal]);

  async function deletePack(id) {
    if (!confirm("¿Seguro que quieres eliminar este pack? Esta acción no se puede deshacer.")) return;
    try {
      const res = await fetch(`http://localhost:8000/api/packs/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Error al eliminar el pack");
      setRefresh((p) => !p);
    } catch (e) { console.error(e.message); }
  }

  async function enablePack(id) {
    try {
      const res = await fetch(`http://localhost:8000/api/packs/enable/${id}`, { method: "POST", headers: { "Content-Type": "application/json" } });
      if (!res.ok) throw new Error("Error al activar el pack");
      setRefresh((p) => !p);
    } catch (e) { console.error(e.message); }
  }

  async function disablePack(id) {
    try {
      const res = await fetch(`http://localhost:8000/api/packs/disable/${id}`, { method: "POST", headers: { "Content-Type": "application/json" } });
      if (!res.ok) throw new Error("Error al desactivar el pack");
      setRefresh((p) => !p);
    } catch (e) { console.error(e.message); }
  }

  async function removeVariantFromPack(packId, variantId) {
    const pack = packs.find((p) => p.id === packId);
    if (!pack) return;
    const newItems = pack.items.filter((item) => item.variant_id !== variantId);
    if (newItems.length === 0) { alert("El pack debe tener al menos una variante"); return; }
    try {
      const res = await fetch(`http://localhost:8000/api/packs/${packId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: pack.name, description: pack.description, active: pack.active,
          items: newItems.map((i) => ({ variant_id: i.variant_id, quantity: i.quantity }))
        }),
      });
      if (!res.ok) throw new Error("Error al quitar variante");
      setRefresh((p) => !p);
    } catch (e) { console.error(e.message); }
  }

  async function handleUpdatePack(updatedData) {
    try {
      const res = await fetch(`http://localhost:8000/api/packs/${editingPack.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedData),
      });
      if (!res.ok) throw new Error("Error al actualizar el pack");
      setRefresh((p) => !p);
      setEditingPack(null);
    } catch (e) { console.error(e.message); }
  }

  return (
    <div className="min-h-screen bg-stone-50/60 font-sans">
      {/* Header */}
      <div className="px-5 pt-7 pb-5">
        <h1 className="text-[15px] font-semibold text-stone-900 tracking-tight">Packs</h1>
        {!loading && !error && (
          <p className="text-[11px] text-stone-400 mt-0.5 font-medium">
            {packs.length} {packs.length === 1 ? "pack" : "packs"}
          </p>
        )}
      </div>

      <div className="max-w-2xl mx-auto px-5 pb-10 space-y-2">
        {loading ? (
          <>
            <SkeletonCard /><SkeletonCard /><SkeletonCard />
          </>
        ) : error ? (
          <div className="flex items-start gap-2.5 px-3.5 py-3 bg-red-50 border border-red-100 text-red-500 rounded-xl text-[12px] font-medium">
            <span className="text-[15px] leading-none mt-px">⚠️</span>
            <span>{error}</span>
          </div>
        ) : packs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-12 h-12 rounded-xl bg-stone-50 border border-stone-100 flex items-center justify-center mb-3">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#d1d5db" strokeWidth="1.8">
                <rect x="2" y="3" width="20" height="14" rx="2" /><path d="M8 21h8M12 17v4" />
              </svg>
            </div>
            <p className="text-stone-600 font-medium text-[13px]">Sin packs</p>
            <p className="text-stone-400 text-[12px] mt-0.5">Crea tu primer pack para empezar</p>
          </div>
        ) : (
          packs.map((pack) => (
            <PackCard
              key={pack.id}
              pack={pack}
              isOpen={openPack === pack.id}
              onToggleOpen={() => setOpenPack(openPack === pack.id ? null : pack.id)}
              onEdit={() => setEditingPack(pack)}
              onToggle={() => pack.active ? disablePack(pack.id) : enablePack(pack.id)}
              onDelete={() => deletePack(pack.id)}
              onRemoveVariant={removeVariantFromPack}
            />
          ))
        )}
      </div>

      {editingPack && (
        <EditPackModal
          pack={editingPack}
          onClose={() => setEditingPack(null)}
          onSave={handleUpdatePack}
        />
      )}
    </div>
  );
}

// ── EDIT MODAL ────────────────────────────────────────────────────────────────
const inputBase =
  "w-full px-3 py-2 rounded-lg border text-[13px] text-stone-800 placeholder-stone-300 " +
  "bg-white border-stone-200 transition-all duration-150 ease-out " +
  "focus:outline-none focus:ring-2 focus:ring-amber-400/25 focus:border-amber-400 " +
  "hover:border-stone-300 shadow-[inset_0_1px_2px_rgba(0,0,0,0.04)]";

function Field({ label, children }) {
  return (
    <div className="space-y-1.5">
      <label className="block text-[10px] font-semibold text-stone-400 uppercase tracking-[0.08em]">{label}</label>
      {children}
    </div>
  );
}

function EditPackModal({ pack, onClose, onSave }) {
  const [name, setName] = useState(pack.name);
  const [description, setDescription] = useState(pack.description || "");
  const [active, setActive] = useState(pack.active);
  const [items, setItems] = useState(pack.items.map((i) => ({ variant_id: i.variant_id, quantity: i.quantity })));
  const [variants, setVariants] = useState([]);
  const [loadingVariants, setLoadingVariants] = useState(true);

  useEffect(() => {
    fetch("http://localhost:8000/api/variants")
      .then((r) => r.json())
      .then((data) => {
        setVariants(data.map((v) => ({ ...v, display: `${v.product?.name || "Producto"} — SKU: ${v.sku}` })));
        setLoadingVariants(false);
      })
      .catch(() => setLoadingVariants(false));
  }, []);

  function addRow() { setItems([...items, { variant_id: "", quantity: 1 }]); }
  function removeRow(i) { setItems(items.filter((_, idx) => idx !== i)); }
  function change(i, field, val) { const n = [...items]; n[i][field] = val; setItems(n); }

  function handleSubmit(e) {
    e.preventDefault();
    if (!name.trim()) { alert("El nombre es obligatorio"); return; }
    const valid = items.filter((i) => i.variant_id !== "");
    if (valid.length === 0) { alert("Debes incluir al menos una variante"); return; }
    const ids = valid.map((i) => i.variant_id);
    if (new Set(ids).size !== ids.length) { alert("No puedes repetir la misma variante"); return; }
    onSave({
      name: name.trim(), description: description.trim(), active,
      items: valid.map((i) => ({ variant_id: parseInt(i.variant_id), quantity: parseInt(i.quantity) || 1 }))
    });
  }

  return (
    <div
      className="fixed inset-0 flex items-end sm:items-center justify-center p-4 z-50"
      style={{
        backgroundColor: "rgba(0,0,0,0.3)",
        backdropFilter: "blur(6px)",
        WebkitBackdropFilter: "blur(6px)",
        animation: "fadeIn 0.15s ease-out"
      }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <style>{`
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(12px) scale(0.98); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>

      <div
        className="bg-white w-full max-w-lg rounded-2xl overflow-hidden max-h-[90vh] flex flex-col"
        style={{
          boxShadow: "0 24px 64px rgba(0,0,0,0.15), 0 4px 16px rgba(0,0,0,0.06), 0 0 0 1px rgba(0,0,0,0.04)",
          animation: "slideUp 0.18s cubic-bezier(0.4,0,0.2,1)"
        }}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-stone-100 flex-shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-6 h-6 rounded-md bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600">
              <EditIcon />
            </div>
            <div>
              <p className="font-semibold text-stone-900 text-[13px]">Editar pack</p>
              <p className="text-[11px] text-stone-400 mt-0">{pack.name}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 flex items-center justify-center rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-all duration-150"
          >
            <CloseIcon size={14} />
          </button>
        </div>

        {/* Scrollable Form */}
        <div className="overflow-y-auto flex-1">
          <form onSubmit={handleSubmit} className="px-5 py-4 space-y-4">

            <Field label="Nombre">
              <input type="text" className={inputBase} value={name}
                onChange={(e) => setName(e.target.value)} required autoFocus />
            </Field>

            <Field label="Descripción">
              <textarea className={`${inputBase} resize-none leading-relaxed`}
                rows="3" value={description} onChange={(e) => setDescription(e.target.value)} />
            </Field>

            {/* Toggle */}
            <div className="flex items-center justify-between px-3 py-2.5 bg-stone-50 border border-stone-100 rounded-lg">
              <div>
                <p className="text-[13px] font-medium text-stone-700">Pack activo</p>
                <p className="text-[11px] text-stone-400 mt-0.5">Visible en la tienda</p>
              </div>
              <button
                type="button"
                onClick={() => setActive((p) => !p)}
                className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors duration-200 focus:outline-none ${active ? "bg-amber-500" : "bg-stone-200"}`}
              >
                <span className={`inline-block h-3.5 w-3.5 rounded-full bg-white shadow-[0_1px_3px_rgba(0,0,0,0.2)] transition-transform duration-200 ${active ? "translate-x-4.5" : "translate-x-0.5"}`} />
              </button>
            </div>

            {/* Variantes */}
            <Field label="Variantes incluidas">
              {loadingVariants ? (
                <p className="text-[12px] text-stone-400 py-2">Cargando variantes…</p>
              ) : (
                <div className="space-y-2">
                  {items.map((item, idx) => {
                    const selectedVariant = variants.find((v) => String(v.id) === String(item.variant_id));
                    return (
                      <div key={idx} className="flex items-center gap-2">
                        {selectedVariant?.image ? (
                          <img src={selectedVariant.image} alt={selectedVariant.sku}
                            className="w-8 h-8 rounded-lg object-cover flex-shrink-0 border border-stone-200" />
                        ) : (
                          <div className="w-8 h-8 rounded-lg bg-stone-100 border border-stone-100 flex items-center justify-center flex-shrink-0">
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#d1d5db" strokeWidth="2">
                              <rect x="3" y="3" width="18" height="18" rx="2" />
                              <circle cx="8.5" cy="8.5" r="1.5" />
                              <polyline points="21 15 16 10 5 21" />
                            </svg>
                          </div>
                        )}

                        <div className="relative flex-1">
                          <select
                            className={`${inputBase} appearance-none pr-7 cursor-pointer`}
                            value={item.variant_id}
                            onChange={(e) => change(idx, "variant_id", e.target.value)}
                            required
                          >
                            <option value="">Seleccionar variante…</option>
                            {variants.map((v) => (
                              <option key={v.id} value={v.id}>{v.display}</option>
                            ))}
                          </select>
                          <div className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-300">
                            <ChevronIcon open={false} />
                          </div>
                        </div>

                        <input
                          type="number" min="1"
                          className={`${inputBase} w-14 text-center flex-shrink-0 px-2`}
                          value={item.quantity}
                          onChange={(e) => change(idx, "quantity", parseInt(e.target.value) || 1)}
                        />

                        {items.length > 1 && (
                          <button
                            type="button" onClick={() => removeRow(idx)}
                            className="p-1.5 rounded-md text-stone-300 hover:text-red-400 hover:bg-red-50 transition-all duration-150 flex-shrink-0"
                          >
                            <CloseIcon size={11} />
                          </button>
                        )}
                      </div>
                    );
                  })}

                  <button
                    type="button" onClick={addRow}
                    className="flex items-center gap-1.5 text-[12px] font-medium text-amber-600 hover:text-amber-700 transition-colors duration-150 mt-1"
                  >
                    <PlusIcon />
                    Agregar variante
                  </button>
                </div>
              )}
            </Field>

            {/* Actions */}
            <div className="flex gap-2 pt-0.5 pb-1">
              <button
                type="button" onClick={onClose}
                className="flex-1 py-2 rounded-lg border border-stone-200 bg-white text-[12px] font-medium text-stone-500 hover:bg-stone-50 hover:border-stone-300 hover:text-stone-700 active:scale-[0.99] transition-all duration-150"
              >
                Cancelar
              </button>
              <button
                type="submit" disabled={loadingVariants}
                className="flex-1 py-2 rounded-lg text-[12px] font-semibold text-white bg-amber-500 hover:bg-amber-500/90 active:bg-amber-600 active:scale-[0.99] disabled:opacity-50 shadow-[0_1px_3px_rgba(245,158,11,0.3),inset_0_1px_0_rgba(255,255,255,0.15)] transition-all duration-150"
              >
                Guardar cambios
              </button>
            </div>

          </form>
        </div>
      </div>
    </div>
  );
}