import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import ProductDetail from "./ProductDetail.jsx";

export const CART_KEY = "tienda_cart";

async function getActiveProducts() {
  try {
    const res = await fetch("http://localhost:8000/api/variants/active", {
      headers: { "Content-Type": "application/json" },
    });
    if (!res.ok) throw new Error("Error al obtener productos");
    const data = await res.json();

    if (Array.isArray(data)) {
      return data.reduce((acc, v) => {
        if (!acc[v.product_name]) acc[v.product_name] = [];
        acc[v.product_name].push(v);
        return acc;
      }, {});
    }
    return data;
  } catch (e) {
    console.error(e.message);
    return {};
  }
}

function loadCart() {
  try {
    return JSON.parse(localStorage.getItem(CART_KEY) || "[]");
  } catch {
    return [];
  }
}

function persistCart(cart) {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
  window.dispatchEvent(new Event("cart-updated"));
}

/* ---------------- ICONOS ---------------- */

function ProductIcon({ name = "", size = 36 }) {
  const n = name.toLowerCase();

  const p = {
    xmlns: "http://www.w3.org/2000/svg",
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "1.4",
    strokeLinecap: "round",
    strokeLinejoin: "round",
  };

  if (n.includes("bomb"))
    return (
      <svg {...p}>
        <rect x="3" y="11" width="18" height="11" rx="2" />
        <path d="M7 11V7a5 5 0 0110 0v4" />
      </svg>
    );

  if (n.includes("escudo"))
    return (
      <svg {...p}>
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      </svg>
    );

  if (n.includes("cerradura"))
    return (
      <svg {...p}>
        <rect x="3" y="11" width="18" height="11" rx="2" />
        <path d="M7 11V7a5 5 0 0110 0v4" />
        <circle cx="12" cy="16" r="1.5" fill="currentColor" />
      </svg>
    );

  return (
    <svg {...p}>
      <rect x="2" y="7" width="20" height="14" rx="2" />
      <path d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2" />
    </svg>
  );
}

function EyeIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="13"
      height="13"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

/* ---------------- PRODUCT CARD ---------------- */

function ProductCard({ name, variants, cart, setCart, compact, onViewDetail }) {
  const [selected, setSelected] = useState(variants[0]);
  const [qty, setQty] = useState(1);

  function handleAdd(e) {
    e.stopPropagation();

    setCart((prev) => {
      const existing = prev.find((c) => c.id === selected.id);

      const next = existing
        ? prev.map((c) =>
            c.id === selected.id ? { ...c, qty: c.qty + qty } : c
          )
        : [
            ...prev,
            {
              id: selected.id,
              sku: selected.sku,
              product_name: name,
              price: selected.price,
              qty,
            },
          ];

      persistCart(next);
      return next;
    });
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 flex flex-col overflow-hidden group">

      <div
        className={`relative bg-gradient-to-br from-orange-50 to-amber-50 flex items-center justify-center text-orange-300 cursor-pointer ${
          compact ? "h-40" : "h-52"
        }`}
        onClick={() => onViewDetail(name, variants)}
      >
        <ProductIcon name={name} size={compact ? 30 : 40} />

        <div className="absolute inset-0 bg-orange-500/0 group-hover:bg-orange-500/10 transition-colors duration-200 flex items-center justify-center">
          <div className="opacity-0 group-hover:opacity-100 transition-all duration-200 translate-y-1 group-hover:translate-y-0">
            <span className="flex items-center gap-1.5 bg-white text-orange-500 text-xs font-bold px-3 py-1.5 rounded-full shadow-md">
              <EyeIcon /> Ver detalle
            </span>
          </div>
        </div>
      </div>

      <div className={`flex flex-col flex-1 ${compact ? "p-3 gap-2.5" : "p-4 gap-3"}`}>
        <h3 className="font-bold text-slate-800">{name}</h3>

        <span className="font-extrabold text-orange-500">
          ${parseFloat(selected.price).toFixed(2)}
        </span>

        <div className="flex-1" />

        <button
          onClick={handleAdd}
          className="bg-orange-500 text-white py-2 rounded-xl"
        >
          Añadir
        </button>
      </div>
    </div>
  );
}

/* ---------------- HOME ---------------- */

export default function Home() {
  const [grouped, setGrouped] = useState({});
  const [loading, setLoading] = useState(true);
  const [cart, setCart] = useState(loadCart);
  const [search, setSearch] = useState("");
  const [detail, setDetail] = useState(null);

  useEffect(() => {
    getActiveProducts().then((data) => {
      setGrouped(data);
      setLoading(false);
    });
  }, []);

  if (detail) {
    return (
      <ProductDetail
        name={detail.name}
        variants={detail.variants}
        onBack={() => setDetail(null)}
      />
    );
  }

  const entries = Object.entries(grouped).filter(([name]) =>
    name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>

      {/* 🔥 CTA PROFESIONAL EN VEZ DE FORMULARIO */}
      <div className="mb-8 bg-white border border-slate-200 rounded-2xl shadow-sm p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">

        <div>
          <h2 className="text-xl font-bold text-slate-800">
            ¿Necesitas algo personalizado?
          </h2>
          <p className="text-sm text-slate-500">
            Cuéntanos tu idea y te ayudamos a hacerlo realidad
          </p>
        </div>

        <Link
          to="/solicitud"
          className="bg-orange-500 text-white px-5 py-2.5 rounded-xl font-semibold hover:bg-orange-600 transition text-center"
        >
          Contacta con nosotros
        </Link>
      </div>

      {/* PRODUCTS */}
      <div className="mb-6">
        <h1 className="text-2xl font-extrabold text-slate-800">
          Productos
        </h1>
        <p className="text-slate-400 text-sm">
          {entries.length} productos disponibles
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {entries.map(([name, variants]) => (
          <ProductCard
            key={name}
            name={name}
            variants={variants}
            cart={cart}
            setCart={setCart}
            compact={false}
            onViewDetail={(n, v) => setDetail({ name: n, variants: v })}
          />
        ))}
      </div>
    </div>
  );
}