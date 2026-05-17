import { useState } from "react"
import { CART_KEY } from "./Home"

function loadCart() {
  try { return JSON.parse(localStorage.getItem(CART_KEY) || "[]") }
  catch { return [] }
}

function persistCart(cart) {
  localStorage.setItem(CART_KEY, JSON.stringify(cart))
  window.dispatchEvent(new Event("cart-updated"))
}

/* ─── icons ────────────────────────────────────────────────── */
function ProductIcon({ name = "", size = 96 }) {
  const n = name.toLowerCase()
  const p = {
    xmlns: "http://www.w3.org/2000/svg", width: size, height: size,
    viewBox: "0 0 24 24", fill: "none", stroke: "currentColor",
    strokeWidth: "1", strokeLinecap: "round", strokeLinejoin: "round"
  }
  if (n.includes("bomb"))
    return <svg {...p}><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>
  if (n.includes("escudo"))
    return <svg {...p}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
  if (n.includes("cerradura"))
    return <svg {...p}><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/><circle cx="12" cy="16" r="1.5" fill="currentColor"/></svg>
  return <svg {...p}><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2"/></svg>
}

const ArrowLeft = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"
    fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M19 12H5M12 5l-7 7 7 7"/>
  </svg>
)
const CheckSm = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24"
    fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
)
const CartIco = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24"
    fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="8" cy="21" r="1"/><circle cx="19" cy="21" r="1"/>
    <path d="M2.05 2.05h2l2.66 12.42a2 2 0 002 1.58h9.78a2 2 0 001.95-1.57l1.65-7.43H5.12"/>
  </svg>
)

/* ─── styles ────────────────────────────────────────────────── */
const css = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500&family=Inter:wght@300;400;500;600;700&display=swap');
  .pd * { box-sizing: border-box; margin: 0; padding: 0; }
  .pd {
    font-family: 'Inter', sans-serif; color: #18150f;
    max-width: 1080px; margin: 0 auto; padding: 2rem 1.5rem 4rem;
  }
  .pd-back {
    display: inline-flex; align-items: center; gap: 8px;
    font-size: 11px; font-weight: 500; letter-spacing: 0.04em;
    color: #a89880; background: none; border: none; cursor: pointer;
    margin-bottom: 2.5rem; transition: color .2s, gap .2s;
  }
  .pd-back:hover { color: #bf5c18; gap: 13px; }
  .pd-back svg { transition: transform .2s; }
  .pd-back:hover svg { transform: translateX(-3px); }
  .pd-grid {
    display: grid; grid-template-columns: 400px 1fr;
    gap: 3.5rem; align-items: start;
  }
  @media (max-width: 860px) { .pd-grid { grid-template-columns: 1fr; gap: 2rem; } }

  /* hero */
  .pd-hero {
    border-radius: 24px; background: #fdf4ea; border: 1px solid #f0dfc8;
    aspect-ratio: 1; display: flex; align-items: center; justify-content: center;
    position: relative; overflow: hidden; color: #e8b070;
  }
  .pd-ring {
    position: absolute; border-radius: 50%; border: 1px solid #f0dac0;
    top: 50%; left: 50%; transform: translate(-50%,-50%); pointer-events: none;
  }
  .pd-hero-badges {
    position: absolute; bottom: 14px; left: 14px; right: 14px;
    display: flex; flex-wrap: wrap; gap: 5px; justify-content: flex-end;
  }
  .pd-hero-badge {
    font-family: 'DM Mono', monospace; font-size: 11px; font-weight: 500;
    background: #bf5c18; color: #fff; padding: 3px 9px; border-radius: 7px;
  }

  /* stats — solo 2 ahora */
  .pd-stats { display: grid; grid-template-columns: repeat(2,1fr); gap: 8px; margin-top: 14px; }
  .pd-stat {
    background: #fff; border: 1px solid #ece4d8; border-radius: 14px;
    padding: 13px 8px; display: flex; flex-direction: column; align-items: center; gap: 3px;
  }
  .pd-stat-v { font-size: 20px; font-weight: 700; color: #bf5c18; line-height: 1; }
  .pd-stat-l { font-size: 9px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.1em; color: #c0ab98; }

  /* info card */
  .pd-info {
    background: #fff; border: 1px solid #ede4d8; border-radius: 20px;
    padding: 20px; margin-top: 14px;
  }
  .pd-info-h { font-size: 10px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.12em; color: #bf5c18; margin-bottom: 10px; }
  .pd-info-desc { font-size: 13px; color: #5a4e42; line-height: 1.65; margin-bottom: 14px; }
  .pd-meta { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-bottom: 14px; }
  .pd-chip { border-radius: 12px; padding: 10px 12px; }
  .pd-chip.w { background: #fdf0e4; border: 1px solid #f5ddc4; }
  .pd-chip.c { background: #f5f3f0; border: 1px solid #e8e2da; }
  .pd-chip-l { font-size: 9px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 3px; }
  .pd-chip.w .pd-chip-l { color: #bf7040; }
  .pd-chip.c .pd-chip-l { color: #9c8f83; }
  .pd-chip-v { font-size: 13px; font-weight: 600; color: #1a150e; }
  .pd-attrs-l { font-size: 9px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.1em; color: #b0a090; margin-bottom: 8px; }
  .pd-attrs { display: flex; flex-wrap: wrap; gap: 6px; }
  .pd-attr {
    font-family: 'DM Mono',monospace; font-size: 11px;
    background: #f3ede5; color: #6b5a48; padding: 4px 10px;
    border-radius: 100px; border: 1px solid #e8ddd2;
  }

  /* right col */
  .pd-eye { font-size: 10px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.14em; color: #bf5c18; margin-bottom: 6px; }
  .pd-name { font-size: 32px; font-weight: 700; color: #18150f; line-height: 1.1; margin-bottom: 2rem; }
  .pd-sec { font-size: 9px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.12em; color: #c0ab98; margin-bottom: 10px; }
  .pd-pills { display: flex; flex-wrap: wrap; gap: 7px; margin-bottom: 1.75rem; }
  .pd-pill {
    font-family: 'DM Mono',monospace; font-size: 12px; padding: 7px 17px;
    border-radius: 100px; border: 1.5px solid #ddd6cc; background: #fff; color: #6b5a48;
    cursor: pointer; position: relative; transition: all .18s;
  }
  .pd-pill:hover { border-color: #bf5c18; color: #bf5c18; }
  .pd-pill.on { background: #bf5c18; border-color: #bf5c18; color: #fff; transform: scale(1.06); }
  .pd-dot { position: absolute; top: -3px; right: -3px; width: 9px; height: 9px; border-radius: 50%; background: #22c55e; border: 2px solid #fff; }

  /* price strip */
  .pd-pstrip {
    background: #fdf4ea; border: 1px solid #f0dfc8; border-radius: 20px;
    padding: 18px 22px; display: flex; align-items: center; justify-content: space-between; margin-bottom: 1.5rem;
  }
  .pd-sku-l { font-size: 9px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.12em; color: #bf8040; margin-bottom: 4px; }
  .pd-sku-v { font-family: 'DM Mono',monospace; font-size: 12px; color: #7a5c3a; }
  .pd-price { font-size: 38px; font-weight: 700; color: #bf5c18; line-height: 1; }

  /* actions */
  .pd-actions { display: flex; gap: 10px; align-items: stretch; margin-bottom: 1.75rem; }
  .pd-qty { display: flex; align-items: center; border: 1.5px solid #ddd6cc; border-radius: 14px; background: #fff; overflow: hidden; }
  .pd-qb { width: 42px; height: 52px; background: none; border: none; font-size: 20px; font-weight: 300; color: #a89880; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: background .15s, color .15s; }
  .pd-qb:hover { background: #fdf0e4; color: #bf5c18; }
  .pd-qv { width: 36px; text-align: center; font-size: 15px; font-weight: 600; color: #18150f; user-select: none; }
  .pd-add {
    flex: 1; height: 52px; border: none; border-radius: 14px;
    font-family: 'Inter',sans-serif; font-size: 13px; font-weight: 600;
    cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px;
    transition: all .2s;
  }
  .pd-add.idle { background: #bf5c18; color: #fff; }
  .pd-add.idle:hover { background: #a84e14; }
  .pd-add.idle:active { transform: scale(0.97); }
  .pd-add.done { background: #16a34a; color: #fff; transform: scale(0.97); }

  /* table */
  .pd-tw { border: 1px solid #ede4d8; border-radius: 18px; overflow: hidden; }
  .pd-t { width: 100%; border-collapse: collapse; font-size: 13px; }
  .pd-t thead tr { background: #faf7f2; border-bottom: 1px solid #ede4d8; }
  .pd-t th { padding: 11px 15px; font-size: 9px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.12em; color: #c0ab98; text-align: left; }
  .pd-t th.r { text-align: right; }
  .pd-t tbody tr { border-bottom: 1px solid #f5efe8; cursor: pointer; transition: background .12s; }
  .pd-t tbody tr:last-child { border-bottom: none; }
  .pd-t tbody tr:hover { background: #fdf4ea; }
  .pd-t tbody tr.s { background: #fff5e8; }
  .pd-t td { padding: 13px 15px; }
  .pd-ref { font-family: 'DM Mono',monospace; font-size: 13px; font-weight: 500; }
  .pd-ref.s { color: #bf5c18; }
  .pd-ref.n { color: #5a4e42; }
  .pd-msm { font-family: 'DM Mono',monospace; font-size: 11px; color: #c0ab98; }
  .pd-ptd { text-align: right; font-weight: 600; color: #18150f; }
  .pd-ctd { text-align: right; }
  .pd-cin { display: inline-flex; align-items: center; gap: 4px; background: #dcfce7; color: #15803d; font-size: 11px; font-weight: 700; padding: 3px 8px; border-radius: 7px; }
  .pd-std { text-align: right; color: #bf5c18; }
`

/* ─── component ─────────────────────────────────────────────── */
export default function ProductDetail({ name, variants, onBack }) {
  const [selected, setSelected] = useState(variants[0])
  const [qty, setQty]           = useState(1)
  const [cart, setCart]         = useState(loadCart)
  const [added, setAdded]       = useState(false)

  const cartItem    = cart.find((c) => c.id === selected.id)
  const totalInCart = cart.reduce((sum, c) => sum + c.qty, 0)

  const description  = selected.product?.description || "Descripción no disponible."
  const manufacturer = selected.product?.manufacturer
  const category     = selected.product?.category?.name
  const attributes   = selected.attributes || []

  function handleAdd() {
    setCart((prev) => {
      const existing = prev.find((c) => c.id === selected.id)
      const next = existing
        ? prev.map((c) => c.id === selected.id ? { ...c, qty: c.qty + qty } : c)
        : [...prev, { id: selected.id, sku: selected.sku, product_name: name, price: selected.price, qty }]
      persistCart(next)
      return next
    })
    setAdded(true)
    setTimeout(() => setAdded(false), 1800)
  }

  function pick(v) { setSelected(v); setQty(1) }

  return (
    <div className="pd">
      <style>{css}</style>

      <button className="pd-back" onClick={onBack}>
        <ArrowLeft /> Volver a productos
      </button>

      <div className="pd-grid">
        {/* LEFT */}
        <div>
          <div className="pd-hero">
            <div className="pd-ring" style={{ width: 200, height: 200 }} />
            <div className="pd-ring" style={{ width: 320, height: 320 }} />
            <ProductIcon name={name} size={100} />
            <div className="pd-hero-badges">
              {variants.map((v) => {
                const ci = cart.find((c) => c.id === v.id)
                if (!ci) return null
                return (
                  <span key={v.id} className="pd-hero-badge">
                    {v.sku.split("-").slice(-1)[0]} ×{ci.qty}
                  </span>
                )
              })}
            </div>
          </div>

          {/* Stats: solo variantes y carrito */}
          <div className="pd-stats">
            <div className="pd-stat">
              <span className="pd-stat-v">{variants.length}</span>
              <span className="pd-stat-l">Variantes</span>
            </div>
            <div className="pd-stat">
              <span className="pd-stat-v">{totalInCart}</span>
              <span className="pd-stat-l">En carrito</span>
            </div>
          </div>

          {/* Info card */}
          <div className="pd-info">
            <p className="pd-info-h">Sobre este producto</p>
            <p className="pd-info-desc">{description}</p>
            {(manufacturer || category) && (
              <div className="pd-meta">
                {manufacturer && (
                  <div className="pd-chip w">
                    <p className="pd-chip-l">Fabricante</p>
                    <p className="pd-chip-v">{manufacturer}</p>
                  </div>
                )}
                {category && (
                  <div className="pd-chip c">
                    <p className="pd-chip-l">Categoría</p>
                    <p className="pd-chip-v">{category}</p>
                  </div>
                )}
              </div>
            )}
            {attributes.length > 0 && (
              <>
                <p className="pd-attrs-l">Atributos</p>
                <div className="pd-attrs">
                  {attributes.map((a, i) => (
                    <span key={i} className="pd-attr">{a.type}: {a.value}</span>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        {/* RIGHT */}
        <div>
          <p className="pd-eye">Producto</p>
          <h1 className="pd-name">{name}</h1>

          <p className="pd-sec">Variante</p>
          <div className="pd-pills">
            {variants.map((v) => {
              const ref    = v.sku.split("-").slice(-1)[0]
              const inCart = cart.find((c) => c.id === v.id)
              const on     = selected.id === v.id
              return (
                <button key={v.id} className={`pd-pill${on ? " on" : ""}`} onClick={() => pick(v)}>
                  {ref}
                  {inCart && !on && <span className="pd-dot" />}
                </button>
              )
            })}
          </div>

          <div className="pd-pstrip">
            <div>
              <p className="pd-sku-l">SKU</p>
              <p className="pd-sku-v">{selected.sku}</p>
            </div>
            <div style={{ textAlign: "right" }}>
              <p className="pd-sku-l">Precio unitario</p>
              <div className="pd-price">${parseFloat(selected.price).toFixed(2)}</div>
            </div>
          </div>

          <div className="pd-actions">
            <div className="pd-qty">
              <button className="pd-qb" onClick={() => setQty((q) => Math.max(1, q - 1))}>−</button>
              <span className="pd-qv">{qty}</span>
              <button className="pd-qb" onClick={() => setQty((q) => q + 1)}>+</button>
            </div>
            <button className={`pd-add ${added ? "done" : "idle"}`} onClick={handleAdd}>
              {added
                ? <><CheckSm /> ¡Añadido!</>
                : <>
                    <CartIco />
                    {cartItem
                      ? `Añadir más · ${cartItem.qty} en carrito`
                      : `Añadir · $${(parseFloat(selected.price) * qty).toFixed(2)}`
                    }
                  </>
              }
            </button>
          </div>

          <div style={{ marginTop: "0.25rem" }}>
            <p className="pd-sec" style={{ marginBottom: "10px" }}>Todas las variantes</p>
            <div className="pd-tw">
              <table className="pd-t">
                <thead>
                  <tr>
                    <th>Ref.</th><th>SKU</th>
                    <th className="r">Precio</th><th className="r">Carrito</th><th />
                  </tr>
                </thead>
                <tbody>
                  {variants.map((v) => {
                    const ref    = v.sku.split("-").slice(-1)[0]
                    const inCart = cart.find((c) => c.id === v.id)
                    const isSel  = selected?.id === v.id
                    return (
                      <tr key={v.id} className={isSel ? "s" : ""} onClick={() => pick(v)}>
                        <td><span className={`pd-ref ${isSel ? "s" : "n"}`}>{ref}</span></td>
                        <td><span className="pd-msm">{v.sku}</span></td>
                        <td className="pd-ptd">${parseFloat(v.price).toFixed(2)}</td>
                        <td className="pd-ctd">
                          {inCart
                            ? <span className="pd-cin"><CheckSm /> {inCart.qty}</span>
                            : <span style={{ color: "#ddd", fontSize: "12px" }}>—</span>
                          }
                        </td>
                        <td className="pd-std">{isSel && <CheckSm />}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}