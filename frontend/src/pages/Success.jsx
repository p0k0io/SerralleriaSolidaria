import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";

function SpinnerIcon({ size = 18, color = "currentColor" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke={color} strokeWidth="2.5" strokeLinecap="round"
      style={{ animation: "spin 0.8s linear infinite", flexShrink: 0 }}>
      <path d="M21 12a9 9 0 1 1-6.219-8.56" />
    </svg>
  );
}

export default function Success() {
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get("session_id");

  const [loading, setLoading]             = useState(true);
  const [status, setStatus]               = useState(null);
  const [orderTracking, setOrderTracking] = useState(null);
  const [error, setError]                 = useState(null);
  const [copied, setCopied]               = useState(false);

  useEffect(() => {
    const s = document.createElement("style");
    s.textContent = `@keyframes spin{to{transform:rotate(360deg)}}@keyframes fadeUp{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}`;
    document.head.appendChild(s);
    return () => document.head.removeChild(s);
  }, []);

  useEffect(() => {
    if (!sessionId) { setLoading(false); return; }
    const check = async () => {
      try {
        const res = await fetch(`http://localhost:8000/api/stripe/session/${sessionId}`, {
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data?.message || "Error verificando pago");
        setStatus(data.status);
        setOrderTracking(data.order_tracking ?? null);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    check();
  }, [sessionId]);

  function copyTracking() {
    if (!orderTracking) return;
    navigator.clipboard.writeText(orderTracking).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  const isPaid = status === "paid";
  const font = "system-ui, -apple-system, sans-serif";

  /* ── Loading ── */
  if (loading) {
    return (
      <div style={{ minHeight: "100vh", background: "#fff7ed", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: font }}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 14 }}>
          <div style={{ width: 60, height: 60, borderRadius: 18, background: "#f97316", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <SpinnerIcon size={24} color="#fff" />
          </div>
          <p style={{ fontSize: 14, color: "#92400e", fontWeight: 600, margin: 0 }}>Verificando tu pago…</p>
        </div>
      </div>
    );
  }

  /* ── Error ── */
  if (error) {
    return (
      <div style={{ minHeight: "100vh", background: "#fff7ed", display: "flex", alignItems: "center", justifyContent: "center", padding: 24, fontFamily: font }}>
        <div style={{ background: "#fff", borderRadius: 24, border: "1px solid #fecaca", padding: "48px 36px", maxWidth: 400, width: "100%", textAlign: "center" }}>
          <div style={{ width: 56, height: 56, borderRadius: "50%", background: "#fef2f2", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px" }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round">
              <circle cx="12" cy="12" r="10"/><path d="M12 8v4m0 4h.01"/>
            </svg>
          </div>
          <h2 style={{ fontSize: 20, fontWeight: 700, color: "#0f172a", margin: "0 0 8px" }}>Algo salió mal</h2>
          <p style={{ fontSize: 13, color: "#64748b", lineHeight: 1.6, margin: "0 0 28px" }}>{error}</p>
          <a href="/carrito" style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 13, color: "#f97316", fontWeight: 700, textDecoration: "none" }}>
            ← Volver al carrito
          </a>
        </div>
      </div>
    );
  }

  /* ── Success / Pending ── */
  return (
    <div style={{ minHeight: "100vh", background: "#fff7ed", display: "flex", alignItems: "center", justifyContent: "center", padding: "40px 16px", fontFamily: font }}>

      {/* BG decoration */}
      <div style={{ position: "fixed", top: -120, right: -120, width: 400, height: 400, borderRadius: "50%", background: "rgba(249,115,22,0.07)", pointerEvents: "none" }} />
      <div style={{ position: "fixed", bottom: -80, left: -80, width: 280, height: 280, borderRadius: "50%", background: "rgba(249,115,22,0.05)", pointerEvents: "none" }} />

      <div style={{ width: "100%", maxWidth: 480, animation: "fadeUp 0.45s cubic-bezier(0.16,1,0.3,1) both", position: "relative" }}>

        {/* Big icon */}
        <div style={{ display: "flex", justifyContent: "center", marginBottom: 32 }}>
          <div style={{
            width: 100, height: 100, borderRadius: 28,
            background: isPaid ? "#f97316" : "#fbbf24",
            display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: `0 16px 48px ${isPaid ? "rgba(249,115,22,0.35)" : "rgba(251,191,36,0.3)"}`,
          }}>
            {isPaid ? (
              <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 6 9 17l-5-5"/>
              </svg>
            ) : (
              <svg width="42" height="42" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round">
                <circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>
              </svg>
            )}
          </div>
        </div>

        {/* Eyebrow */}
        <p style={{ textAlign: "center", fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.12em", color: "#ea580c", margin: "0 0 8px" }}>
          {isPaid ? "Pago confirmado" : "En proceso"}
        </p>

        {/* Headline */}
        <h1 style={{ textAlign: "center", fontSize: 34, fontWeight: 800, color: "#0f172a", margin: "0 0 12px", letterSpacing: "-0.03em", lineHeight: 1.1 }}>
          {isPaid ? "¡Tu pedido está\nen camino!" : "Verificando\ntu pago"}
        </h1>
        <p style={{ textAlign: "center", fontSize: 14, color: "#78716c", lineHeight: 1.65, margin: "0 0 36px", padding: "0 8px" }}>
          {isPaid
            ? "Hemos recibido tu pago correctamente. Te hemos enviado un correo de confirmación con todos los detalles."
            : "Tu transacción está siendo procesada. En unos instantes tendremos la confirmación."}
        </p>

        {/* Tracking card — destaca si existe */}
        {isPaid && orderTracking && (
          <div style={{
            background: "#f97316", borderRadius: 20,
            padding: "24px 28px", marginBottom: 16,
            display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16,
          }}>
            <div>
              <p style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: "rgba(255,255,255,0.7)", margin: "0 0 6px" }}>
                Nº de seguimiento
              </p>
              <p style={{ fontSize: 22, fontWeight: 800, color: "#fff", margin: 0, letterSpacing: "0.08em", fontFamily: "monospace" }}>
                {orderTracking}
              </p>
              <p style={{ fontSize: 11, color: "rgba(255,255,255,0.65)", margin: "6px 0 0" }}>
                Guárdalo para consultar tu pedido
              </p>
            </div>
            <button
              onClick={copyTracking}
              style={{
                background: "rgba(255,255,255,0.18)", border: "1.5px solid rgba(255,255,255,0.35)",
                borderRadius: 12, padding: "10px 16px",
                fontSize: 12, fontWeight: 700, color: "#fff",
                cursor: "pointer", fontFamily: font, flexShrink: 0,
                transition: "background 0.15s",
                display: "flex", alignItems: "center", gap: 6,
              }}
              onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.28)"}
              onMouseLeave={e => e.currentTarget.style.background = "rgba(255,255,255,0.18)"}
            >
              {copied ? (
                <>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="m9 11 3 3L22 4"/></svg>
                  Copiado
                </>
              ) : (
                <>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
                  </svg>
                  Copiar
                </>
              )}
            </button>
          </div>
        )}

        {/* Info card */}
        <div style={{ background: "#fff", borderRadius: 20, border: "1px solid #fed7aa", overflow: "hidden", marginBottom: 16 }}>

          {/* Info rows */}
          <div style={{ padding: "6px 28px 8px" }}>
            {[
              { label: "Estado del pago", value: isPaid ? "✓ Confirmado" : "⏳ Pendiente", ok: isPaid },
              sessionId && { label: "ID Stripe", value: `···${sessionId.slice(-12)}` },
              { label: "Fecha", value: new Date().toLocaleDateString("es-ES", { day: "2-digit", month: "long", year: "numeric" }) },
            ].filter(Boolean).map((row, i, arr) => (
              <div key={i} style={{
                display: "flex", justifyContent: "space-between", alignItems: "center",
                padding: "13px 0",
                borderBottom: i < arr.length - 1 ? "1px solid #fef3c7" : "none",
              }}>
                <span style={{ fontSize: 13, color: "#92400e", fontWeight: 500 }}>{row.label}</span>
                <span style={{
                  fontSize: 13, fontWeight: 700,
                  color: row.ok ? "#059669" : "#334155",
                  fontFamily: row.value?.includes("···") ? "monospace" : "inherit",
                }}>
                  {row.value}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* CTAs */}
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {isPaid ? (
            <>
              {orderTracking && (
                <a href={`/seguimiento?ref=${orderTracking}`} style={{
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                  background: "#0f172a", color: "#fff",
                  padding: "15px 0", borderRadius: 14,
                  fontSize: 14, fontWeight: 700, textDecoration: "none",
                  transition: "background 0.15s",
                }}
                  onMouseEnter={e => e.currentTarget.style.background = "#1e293b"}
                  onMouseLeave={e => e.currentTarget.style.background = "#0f172a"}
                >
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="1" y="3" width="15" height="13" rx="1"/><path d="M16 8h4l3 3v5h-7V8z"/>
                    <circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/>
                  </svg>
                  Seguir mi pedido
                </a>
              )}
              <a href="/" style={{
                display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                background: "#fff", color: "#f97316",
                padding: "14px 0", borderRadius: 14,
                fontSize: 14, fontWeight: 700, textDecoration: "none",
                border: "2px solid #fed7aa",
                transition: "border-color 0.15s, background 0.15s",
              }}
                onMouseEnter={e => { e.currentTarget.style.background = "#fff7ed"; e.currentTarget.style.borderColor = "#f97316"; }}
                onMouseLeave={e => { e.currentTarget.style.background = "#fff"; e.currentTarget.style.borderColor = "#fed7aa"; }}
              >
                Seguir comprando
              </a>
              <a href="/soporte" style={{ display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, color: "#a8a29e", fontWeight: 500, textDecoration: "none", padding: "6px 0", transition: "color 0.15s" }}
                onMouseEnter={e => e.currentTarget.style.color = "#78716c"}
                onMouseLeave={e => e.currentTarget.style.color = "#a8a29e"}
              >
                ¿Alguna duda? Contactar soporte
              </a>
            </>
          ) : (
            <button onClick={() => window.location.reload()} style={{
              display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
              background: "#f97316", border: "none", color: "#fff",
              padding: "15px 0", borderRadius: 14,
              fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: font,
              transition: "background 0.15s",
            }}
              onMouseEnter={e => e.currentTarget.style.background = "#ea580c"}
              onMouseLeave={e => e.currentTarget.style.background = "#f97316"}
            >
              <SpinnerIcon size={15} color="#fff" />
              Verificar de nuevo
            </button>
          )}
        </div>

        {/* Footer */}
        <p style={{ textAlign: "center", fontSize: 11, color: "#c4b5a5", margin: "24px 0 0", display: "flex", alignItems: "center", justifyContent: "center", gap: 10 }}>
          <span>Pago seguro</span>
          <span style={{ width: 3, height: 3, borderRadius: "50%", background: "#d6d3d1", display: "inline-block" }} />
          <span>SSL cifrado</span>
          <span style={{ width: 3, height: 3, borderRadius: "50%", background: "#d6d3d1", display: "inline-block" }} />
          <span>Powered by Stripe</span>
        </p>

      </div>
    </div>
  );
}
