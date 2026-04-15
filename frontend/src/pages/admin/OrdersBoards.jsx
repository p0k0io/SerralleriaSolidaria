import { useEffect, useMemo, useRef, useState } from "react";

/* =========================
   🇪🇸 ESTADOS (LOGÍSTICA REAL)
========================= */
const STATUS = {
  nuevo: {
    label: "Nuevo",
    color: "#6366f1",
    bg: "#eef2ff",
  },
  en_preparacion: {
    label: "En preparación",
    color: "#f59e0b",
    bg: "#fffbeb",
  },
  empaquetando: {
    label: "Empaquetando",
    color: "#a855f7",
    bg: "#faf5ff",
  },
  listo_envio: {
    label: "Listo para envío",
    color: "#06b6d4",
    bg: "#ecfeff",
  },
  enviado: {
    label: "Enviado",
    color: "#f97316",
    bg: "#fff7ed",
  },
  completado: {
    label: "Completado",
    color: "#10b981",
    bg: "#ecfdf5",
  },
};

const STATUS_ORDER = [
  "nuevo",
  "en_preparacion",
  "empaquetando",
  "listo_envio",
  "enviado",
  "completado",
];

/* =========================
   API LAYER
========================= */
const ordersApi = {
  async getAll() {
    const r = await fetch("/api/admin/orders");
    return r.json();
  },

  async update(id, status) {
    return fetch(`/api/admin/orders/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
  },
};

/* =========================
   FORMATTERS
========================= */
const money = (v) =>
  new Intl.NumberFormat("es-ES", {
    style: "currency",
    currency: "EUR",
  }).format(v);

const date = (d) =>
  new Date(d).toLocaleDateString("es-ES", {
    day: "2-digit",
    month: "short",
  });

/* =========================
   CARD
========================= */
function OrderCard({ order, onDrag, onOpen }) {
  const s = STATUS[order.status];

  return (
    <div
      draggable
      onDragStart={() => onDrag(order.id)}
      onClick={() => onOpen(order)}
      style={{
        background: "#fff",
        border: "1px solid #eef2f7",
        borderRadius: 14,
        padding: 12,
        cursor: "pointer",
        transition: "all .15s ease",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <strong>#{order.id}</strong>
        <span
          style={{
            width: 8,
            height: 8,
            borderRadius: 999,
            background: s.color,
          }}
        />
      </div>

      <div style={{ marginTop: 6, fontWeight: 600, fontSize: 13 }}>
        {order.full_name}
      </div>

      <div style={{ fontSize: 12, color: "#64748b" }}>
        {money(order.total_amount)}
      </div>

      <div style={{ fontSize: 11, color: "#94a3b8" }}>
        {date(order.created_at)}
      </div>
    </div>
  );
}

/* =========================
   COLUMN
========================= */
function Column({ status, orders, onDrop, onDrag, onOpen }) {
  const s = STATUS[status];
  const [over, setOver] = useState(false);

  return (
    <div style={{ minWidth: 300 }}>
      {/* HEADER */}
      <div
        style={{
          background: s.bg,
          border: `1px solid ${s.color}22`,
          borderRadius: 12,
          padding: "10px 12px",
          display: "flex",
          justifyContent: "space-between",
          marginBottom: 10,
        }}
      >
        <span style={{ fontWeight: 700 }}>{s.label}</span>
        <span style={{ fontSize: 12, color: "#64748b" }}>
          {orders.length}
        </span>
      </div>

      {/* DROP ZONE */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setOver(true);
        }}
        onDragLeave={() => setOver(false)}
        onDrop={() => {
          setOver(false);
          onDrop(status);
        }}
        style={{
          minHeight: 120,
          padding: 8,
          borderRadius: 14,
          border: over ? `2px dashed ${s.color}` : "2px dashed transparent",
          background: over ? "#f8fafc" : "transparent",
        }}
      >
        {orders.map((o) => (
          <div key={o.id} style={{ marginBottom: 10 }}>
            <OrderCard order={o} onDrag={onDrag} onOpen={onOpen} />
          </div>
        ))}
      </div>
    </div>
  );
}

/* =========================
   MODAL INSPECTOR
========================= */
function OrderInspector({ order, onClose }) {
  if (!order) return null;

  const s = STATUS[order.status];

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.55)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        padding: 24,
        zIndex: 50,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "100%",
          maxWidth: 1100,
          height: "85vh",
          background: "#fff",
          borderRadius: 18,
          display: "flex",
          overflow: "hidden",
        }}
      >
        {/* LEFT */}
        <div style={{ flex: 2, padding: 26, overflowY: "auto" }}>
          <h2>Pedido #{order.id}</h2>

          <span
            style={{
              background: s.bg,
              color: s.color,
              padding: "4px 10px",
              borderRadius: 999,
              fontSize: 12,
              fontWeight: 600,
            }}
          >
            {s.label}
          </span>

          <div style={{ marginTop: 20, color: "#64748b" }}>
            {order.full_name} · {order.email}
          </div>

          <div style={{ marginTop: 24 }}>
            <h3>Productos</h3>

            {order.items?.map((i) => (
              <div
                key={i.id}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  padding: "12px 0",
                  borderBottom: "1px solid #f1f5f9",
                }}
              >
                <div>
                  <div style={{ fontWeight: 600 }}>
                    {i.product_name}
                  </div>
                  <div style={{ fontSize: 12, color: "#94a3b8" }}>
                    Cantidad: {i.quantity}
                  </div>
                </div>

                <div>{money(i.unit_price)}</div>
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT */}
        <div
          style={{
            flex: 1,
            background: "#f8fafc",
            borderLeft: "1px solid #eef2f7",
            padding: 24,
          }}
        >
          <button onClick={onClose}>Cerrar ✕</button>

          <div style={{ marginTop: 20 }}>
            <h4>Cliente</h4>
            <p>{order.address}</p>
            <p>
              {order.city}, {order.country}
            </p>
          </div>

          <div style={{ marginTop: 20 }}>
            <h4>Total</h4>
            <div style={{ fontSize: 22, fontWeight: 800 }}>
              {money(order.total_amount)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* =========================
   MAIN ENGINE
========================= */
export default function OrdersBoards() {
  const [orders, setOrders] = useState([]);
  const dragId = useRef(null);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    ordersApi.getAll().then(setOrders);
  }, []);

  const updateStatus = async (id, status) => {
    const backup = orders;

    setOrders((prev) =>
      prev.map((o) => (o.id === id ? { ...o, status } : o))
    );

    try {
      await ordersApi.update(id, status);
    } catch (e) {
      setOrders(backup);
    }
  };

  const onDrop = (status) => {
    const id = dragId.current;
    if (!id) return;

    const order = orders.find((o) => o.id === id);

    if (order && order.status !== status) {
      updateStatus(id, status);
    }

    dragId.current = null;
  };

  const grouped = useMemo(() => {
    return STATUS_ORDER.reduce((acc, s) => {
      acc[s] = orders.filter((o) => o.status === s);
      return acc;
    }, {});
  }, [orders]);

  return (
    <div style={{ padding: 20, background: "#f8fafc", minHeight: "100vh" }}>
      {/* HEADER */}
      <div style={{ marginBottom: 20 }}>
        <h1 style={{ fontSize: 22, fontWeight: 900 }}>
          Panel de pedidos
        </h1>
      </div>

      {/* BOARD */}
      <div style={{ display: "flex", gap: 12, overflowX: "auto" }}>
        {STATUS_ORDER.map((s) => (
          <Column
            key={s}
            status={s}
            orders={grouped[s]}
            onDrop={onDrop}
            onDrag={(id) => (dragId.current = id)}
            onOpen={setSelected}
          />
        ))}
      </div>

      {/* MODAL */}
      <OrderInspector
        order={selected}
        onClose={() => setSelected(null)}
      />
    </div>
  );
}