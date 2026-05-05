import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";

function CheckIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 6 9 17l-5-5" />
    </svg>
  );
}

function ClockIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <path d="M12 6v6l4 2" />
    </svg>
  );
}

function SpinnerIcon() {
  return (
    <svg className="animate-spin" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
      <path d="M21 12a9 9 0 1 1-6.219-8.56" />
    </svg>
  );
}

function MetaRow({ label, value }) {
  return (
    <div className="flex justify-between items-center py-2.5 border-b border-slate-100 last:border-0">
      <span className="text-xs text-slate-400 font-medium">{label}</span>
      <span className="text-xs text-slate-600 font-semibold font-mono">{value}</span>
    </div>
  );
}

export default function Success() {
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get("session_id");

  const [loading, setLoading] = useState(true);
  const [status, setStatus]   = useState(null);
  const [error, setError]     = useState(null);

  useEffect(() => {
    if (!sessionId) { setLoading(false); return; }

    const check = async () => {
      try {
        const res = await fetch(
          `http://localhost:8000/api/stripe/session/${sessionId}`,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        const data = await res.json();
        if (!res.ok) throw new Error(data?.message || "Error verificando pago");
        setStatus(data.status);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    check();
  }, [sessionId]);

  const isPaid = status === "paid";

  /* ── Loading ── */
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-white border border-slate-100 shadow-sm flex items-center justify-center text-orange-400">
            <SpinnerIcon />
          </div>
          <p className="text-sm text-slate-400 font-medium">Verificando transacción…</p>
        </div>
      </div>
    );
  }

  /* ── Error ── */
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
        <div className="bg-white rounded-2xl border border-red-100 shadow-sm p-8 max-w-sm w-full text-center">
          <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-4">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round">
              <circle cx="12" cy="12" r="10" />
              <path d="M12 8v4m0 4h.01" />
            </svg>
          </div>
          <h2 className="font-extrabold text-slate-800 text-lg mb-2">Algo salió mal</h2>
          <p className="text-sm text-slate-400 leading-relaxed">{error}</p>
          <a href="/carrito" className="mt-6 inline-flex items-center gap-2 text-sm text-orange-500 font-semibold hover:text-orange-600 transition-colors">
            ← Volver al carrito
          </a>
        </div>
      </div>
    );
  }

  /* ── Success / Pending ── */
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">

        {/* Icon badge */}
        <div className="flex justify-center mb-6">
          <div className={`w-20 h-20 rounded-2xl flex items-center justify-center shadow-sm
            ${isPaid
              ? "bg-emerald-50 text-emerald-500 border border-emerald-100"
              : "bg-amber-50 text-amber-500 border border-amber-100"
            }`}>
            {isPaid ? <CheckIcon /> : <ClockIcon />}
          </div>
        </div>

        {/* Main card */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">

          {/* Header */}
          <div className={`px-8 py-6 border-b border-slate-100 text-center
            ${isPaid ? "bg-emerald-50" : "bg-amber-50"}`}>
            <div className="flex items-center justify-center gap-2 mb-2">
              <span className={`w-2 h-2 rounded-full ${isPaid ? "bg-emerald-400" : "bg-amber-400"}`} />
              <span className={`text-xs font-semibold uppercase tracking-widest
                ${isPaid ? "text-emerald-600" : "text-amber-600"}`}>
                {isPaid ? "Pago confirmado" : "En proceso"}
              </span>
            </div>
            <h1 className="text-2xl font-extrabold text-slate-800 tracking-tight">
              {isPaid ? "¡Pedido recibido!" : "Verificando tu pago"}
            </h1>
            <p className="text-sm text-slate-500 mt-1.5 leading-relaxed">
              {isPaid
                ? "Hemos recibido tu pago. Recibirás un correo de confirmación en breve."
                : "Tu transacción está siendo procesada. Esto puede tardar unos instantes."}
            </p>
          </div>

          {/* Meta info */}
          <div className="px-8 py-5">
            <MetaRow label="Estado" value={isPaid ? "✓ Confirmado" : "⏳ Pendiente"} />
            {sessionId && (
              <MetaRow
                label="Referencia"
                value={`···${sessionId.slice(-10)}`}
              />
            )}
            <MetaRow
              label="Fecha"
              value={new Date().toLocaleDateString("es-ES", { day: "2-digit", month: "short", year: "numeric" })}
            />
          </div>

          {/* CTA */}
          <div className="px-8 pb-7 flex flex-col gap-3">
            {isPaid ? (
              <>
                <a
                  href="/"
                  className="w-full flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 active:scale-95 text-white font-semibold py-3 rounded-xl transition-all text-sm"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                    <polyline points="9 22 9 12 15 12 15 22" />
                  </svg>
                  Ir al inicio
                </a>
                <a
                  href="/soporte"
                  className="w-full flex items-center justify-center gap-2 text-slate-400 hover:text-slate-600 text-xs font-medium transition-colors py-1"
                >
                  ¿Alguna duda? Contactar soporte
                </a>
              </>
            ) : (
              <button
                onClick={() => window.location.reload()}
                className="w-full flex items-center justify-center gap-2 border border-slate-200 hover:bg-slate-50 text-slate-600 font-semibold py-3 rounded-xl transition-all text-sm"
              >
                <SpinnerIcon />
                Verificar de nuevo
              </button>
            )}
          </div>
        </div>

        {/* Footer note */}
        <p className="text-center text-xs text-slate-400 mt-5">
          Pago seguro · SSL cifrado · Powered by Stripe
        </p>

      </div>
    </div>
  );
}