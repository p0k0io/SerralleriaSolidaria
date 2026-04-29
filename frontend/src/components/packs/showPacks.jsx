import { useEffect, useState, useRef } from "react";

function ActionMenu({ pack, onEdit, onToggle, onViewVariants, onDelete, isOpen, setOpenPack }) {
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
        className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-100 transition text-slate-500 hover:text-slate-700"
        title="Opciones"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
          <circle cx="5" cy="12" r="2" />
          <circle cx="12" cy="12" r="2" />
          <circle cx="19" cy="12" r="2" />
        </svg>
      </button>

      {show && (
        <div className="absolute right-0 mt-1 w-48 bg-white rounded-xl shadow-lg border border-slate-100 z-30 overflow-hidden py-1">
          <MenuItem
            icon={<EyeIcon />}
            label={isOpen ? "Ocultar variantes" : "Ver variantes"}
            onClick={() => { onViewVariants(); setShow(false); }}
          />
          <MenuItem
            icon={<EditIcon />}
            label="Editar pack"
            onClick={() => { onEdit(); setShow(false); }}
          />
          <div className="my-1 border-t border-slate-100" />
          <MenuItem
            icon={pack.active ? <OffIcon /> : <OnIcon />}
            label={pack.active ? "Desactivar" : "Activar"}
            onClick={() => { onToggle(); setShow(false); }}
            variant={pack.active ? "warning" : "success"}
          />
          <MenuItem
            icon={<TrashIcon />}
            label="Eliminar pack"
            onClick={() => { onDelete(); setShow(false); }}
            variant="danger"
          />
        </div>
      )}
    </div>
  );
}

function MenuItem({ icon, label, onClick, variant }) {
  const color =
    variant === "danger"
      ? "text-red-500 hover:bg-red-50"
      : variant === "success"
      ? "text-emerald-600 hover:bg-emerald-50"
      : variant === "warning"
      ? "text-amber-600 hover:bg-amber-50"
      : "text-slate-700 hover:bg-slate-50";

  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-4 py-2 text-sm font-medium transition ${color}`}
    >
      <span className="w-4 h-4 flex-shrink-0">{icon}</span>
      {label}
    </button>
  );
}

const EyeIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="16" height="16">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);
const EditIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="16" height="16">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
  </svg>
);
const OnIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="16" height="16">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);
const TrashIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="16" height="16">
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
    <path d="M10 11v6M14 11v6" />
    <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
  </svg>
);
const OffIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="16" height="16">
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

const ImagePlaceholder = () => (
  <div className="w-10 h-10 rounded-lg bg-slate-200 flex items-center justify-center flex-shrink-0">
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2">
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <circle cx="8.5" cy="8.5" r="1.5" />
      <polyline points="21 15 16 10 5 21" />
    </svg>
  </div>
);

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
        body: JSON.stringify({ name: pack.name, description: pack.description, active: pack.active, items: newItems.map((i) => ({ variant_id: i.variant_id, quantity: i.quantity })) }),
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

  if (loading)
    return (
      <div className="flex items-center justify-center p-12">
        <div className="flex items-center gap-3 text-slate-400">
          <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12a9 9 0 1 1-6.219-8.56" /></svg>
          <span className="text-sm">Cargando packs…</span>
        </div>
      </div>
    );

  if (error)
    return (
      <div className="m-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
        ⚠ {error}
      </div>
    );

  if (packs.length === 0)
    return <p className="p-6 text-slate-400 text-sm text-center">No hay packs disponibles.</p>;

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-8 sm:px-8">
      {/* Header */}
      <div className="max-w-3xl mx-auto mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Packs</h1>
          <p className="text-sm text-slate-400 mt-0.5">
            {loading ? "Cargando…" : `${packs.length} packs`}
          </p>
        </div>
        <span className="w-2 h-2 rounded-full bg-orange-400 animate-pulse" />
      </div>

      <div className="max-w-3xl mx-auto space-y-3">
        {packs.map((pack) => {
        const totalPrice = pack.items?.reduce((sum, i) => sum + (i.variant?.price || 0) * i.quantity, 0) ?? 0;
        const isOpen = openPack === pack.id;

        return (
          <div
            key={pack.id}
            className={`bg-white rounded-2xl border transition-all duration-200 ${isOpen ? "border-orange-200 shadow-md" : "border-slate-100 shadow-sm hover:shadow-md hover:border-slate-200"}`}
          >
            {/* Cabecera */}
            <div className="flex items-center gap-4 p-4">
              <div className={`w-2 h-10 rounded-full shrink-0 ${pack.active ? "bg-orange-500" : "bg-slate-200"}`} />

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-semibold text-slate-800 truncate">{pack.name}</h3>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${pack.active ? "bg-orange-100 text-orange-700" : "bg-slate-100 text-slate-400"}`}>
                    {pack.active ? "Activo" : "Inactivo"}
                  </span>
                </div>
                {pack.description && (
                  <p className="text-slate-500 text-sm truncate mt-0.5">{pack.description}</p>
                )}
              </div>

              <div className="hidden sm:flex items-center gap-4 text-sm text-slate-500 shrink-0">
                <span className="flex items-center gap-1">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="3" width="20" height="14" rx="2" /><path d="M8 21h8M12 17v4" /></svg>
                  {pack.items?.length || 0} variante{pack.items?.length !== 1 ? "s" : ""}
                </span>
                <span className="font-semibold text-slate-700">{totalPrice.toFixed(2)} €</span>
              </div>

              <ActionMenu
                pack={pack}
                onEdit={() => setEditingPack(pack)}
                onToggle={() => pack.active ? disablePack(pack.id) : enablePack(pack.id)}
                onViewVariants={() => setOpenPack(isOpen ? null : pack.id)}
                onDelete={() => deletePack(pack.id)}
                isOpen={isOpen}
                setOpenPack={setOpenPack}
              />
            </div>

            {/* Stats móvil */}
            <div className="sm:hidden flex items-center gap-4 text-sm text-slate-500 px-4 pb-3">
              <span>{pack.items?.length || 0} variante{pack.items?.length !== 1 ? "s" : ""}</span>
              <span className="font-semibold text-slate-700">{totalPrice.toFixed(2)} €</span>
            </div>

            {/* Variantes desplegables */}
            {isOpen && (
              <div className="border-t border-slate-100 px-4 py-3 space-y-2">
                {pack.items?.length > 0 ? (
                  pack.items.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center gap-3 bg-slate-50 rounded-xl px-3 py-2.5 group"
                    >
                      {/* Imagen de la variante */}
                      {item.variant?.image ? (
                        <img
                          src={item.variant.image}
                          alt={item.variant?.sku}
                          className="w-10 h-10 rounded-lg object-cover shrink-0 border border-slate-200"
                        />
                      ) : (
                        <ImagePlaceholder />
                      )}

                      <div className={`w-1.5 h-5 rounded-full shrink-0 ${item.variant?.active ? "bg-orange-400" : "bg-slate-300"}`} />

                      <div className="flex-1 min-w-0">
                        <p className="text-slate-700 text-sm font-medium truncate">
                          {item.variant?.product?.name || "Producto"}
                          <span className="text-slate-400 font-normal ml-1">— {item.variant?.sku}</span>
                        </p>
                        <p className="text-slate-400 text-xs mt-0.5">
                          Cant. {item.quantity} · {item.variant?.price} € u.
                        </p>
                      </div>

                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium shrink-0 ${item.variant?.active ? "bg-orange-100 text-orange-600" : "bg-slate-100 text-slate-400"}`}>
                        {item.variant?.active ? "Activo" : "Inactivo"}
                      </span>

                      <button
                        onClick={() => removeVariantFromPack(pack.id, item.variant_id)}
                        className="opacity-0 group-hover:opacity-100 transition text-slate-300 hover:text-red-400 shrink-0 p-1 rounded"
                        title="Quitar del pack"
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                      </button>
                    </div>
                  ))
                ) : (
                  <p className="text-slate-400 text-sm text-center py-4">Este pack no tiene variantes</p>
                )}
              </div>
            )}
          </div>
        );
      })}
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

// Modal de edición
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
    onSave({ name: name.trim(), description: description.trim(), active, items: valid.map((i) => ({ variant_id: parseInt(i.variant_id), quantity: parseInt(i.quantity) || 1 })) });
  }

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center px-6 py-4 border-b border-slate-100 sticky top-0 bg-white rounded-t-2xl">
          <div>
            <h2 className="text-lg font-bold text-slate-800">Editar pack</h2>
            <p className="text-slate-400 text-sm">{pack.name}</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-100 transition text-slate-400">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Nombre */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">Nombre *</label>
            <input
              type="text"
              className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition"
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

          {/* Variantes */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">Variantes incluidas</label>
            {loadingVariants ? (
              <p className="text-sm text-slate-400 py-2">Cargando variantes…</p>
            ) : (
              <div className="space-y-2">
                {items.map((item, idx) => {
                  const selectedVariant = variants.find((v) => String(v.id) === String(item.variant_id));
                  return (
                    <div key={idx} className="flex items-center gap-2">
                      {/* Preview imagen */}
                      {selectedVariant?.image ? (
                        <img
                          src={selectedVariant.image}
                          alt={selectedVariant.sku}
                          className="w-10 h-10 rounded-lg object-cover shrink-0 border border-slate-200"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center shrink-0">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2">
                            <rect x="3" y="3" width="18" height="18" rx="2" />
                            <circle cx="8.5" cy="8.5" r="1.5" />
                            <polyline points="21 15 16 10 5 21" />
                          </svg>
                        </div>
                      )}

                      <select
                        className="flex-1 px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition bg-white"
                        value={item.variant_id}
                        onChange={(e) => change(idx, "variant_id", e.target.value)}
                        required
                      >
                        <option value="">Seleccionar variante…</option>
                        {variants.map((v) => (
                          <option key={v.id} value={v.id}>{v.display}</option>
                        ))}
                      </select>

                      <input
                        type="number"
                        min="1"
                        className="w-20 px-3 py-2.5 border border-slate-200 rounded-xl text-sm text-center focus:ring-2 focus:ring-orange-500 outline-none transition"
                        value={item.quantity}
                        onChange={(e) => change(idx, "quantity", parseInt(e.target.value) || 1)}
                      />

                      {items.length > 1 && (
                        <button type="button" onClick={() => removeRow(idx)} className="p-2 rounded-lg hover:bg-red-50 text-slate-300 hover:text-red-400 transition shrink-0">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                        </button>
                      )}
                    </div>
                  );
                })}

                <button
                  type="button"
                  onClick={addRow}
                  className="flex items-center gap-1.5 text-sm text-orange-600 hover:text-orange-700 font-medium mt-1 transition"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
                  Agregar variante
                </button>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 border border-slate-200 rounded-xl transition">
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loadingVariants}
              className="px-5 py-2 text-sm font-semibold bg-orange-600 hover:bg-orange-500 text-white rounded-xl transition disabled:opacity-50"
            >
              Guardar cambios
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}