import { useEffect, useState, useRef } from "react";
import { useSearchParams } from "react-router-dom";

// ─── Animated Checkmark SVG ──────────────────────────────────────────────────
function CheckmarkCircle() {
  return (
    <svg
      className="success-check"
      viewBox="0 0 80 80"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle
        cx="40"
        cy="40"
        r="36"
        stroke="url(#successGrad)"
        strokeWidth="2"
        className="check-ring"
      />
      <polyline
        points="24,41 35,52 56,30"
        stroke="url(#checkGrad)"
        strokeWidth="3.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="check-mark"
      />
      <defs>
        <linearGradient id="successGrad" x1="0" y1="0" x2="80" y2="80" gradientUnits="userSpaceOnUse">
          <stop stopColor="#34d399" />
          <stop offset="1" stopColor="#059669" />
        </linearGradient>
        <linearGradient id="checkGrad" x1="24" y1="41" x2="56" y2="30" gradientUnits="userSpaceOnUse">
          <stop stopColor="#6ee7b7" />
          <stop offset="1" stopColor="#10b981" />
        </linearGradient>
      </defs>
    </svg>
  );
}

function PendingIcon() {
  return (
    <svg
      className="pending-icon"
      viewBox="0 0 80 80"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle cx="40" cy="40" r="36" stroke="url(#pendingGrad)" strokeWidth="2" className="pending-ring" />
      <circle cx="40" cy="40" r="4" fill="url(#pendingGrad)" />
      <circle cx="25" cy="40" r="3" fill="url(#pendingGrad)" opacity="0.5" />
      <circle cx="55" cy="40" r="3" fill="url(#pendingGrad)" opacity="0.5" />
      <defs>
        <linearGradient id="pendingGrad" x1="0" y1="0" x2="80" y2="80" gradientUnits="userSpaceOnUse">
          <stop stopColor="#fbbf24" />
          <stop offset="1" stopColor="#d97706" />
        </linearGradient>
      </defs>
    </svg>
  );
}

// ─── Particle burst ───────────────────────────────────────────────────────────
function Particles() {
  return (
    <div className="particles" aria-hidden="true">
      {[...Array(18)].map((_, i) => (
        <div key={i} className={`particle particle-${i}`} />
      ))}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function Success() {
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get("session_id");

  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState(null);
  const [error, setError] = useState(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const checkPayment = async () => {
      try {
        setLoading(true);
        const res = await fetch(
          `http://localhost:8000/api/stripe/session/${sessionId}`,
          {
            method: "GET",
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
        setTimeout(() => setVisible(true), 50);
      }
    };

    if (sessionId) {
      checkPayment();
    }
  }, [sessionId]);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Geist:wght@300;400;500;600&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        :root {
          --bg:        #0a0c0f;
          --surface:   #111318;
          --border:    rgba(255,255,255,0.07);
          --text:      #f0f0ef;
          --muted:     #6b7280;
          --green:     #34d399;
          --green-dim: rgba(52,211,153,0.12);
          --amber:     #fbbf24;
          --amber-dim: rgba(251,191,36,0.10);
          --red:       #f87171;
          --red-dim:   rgba(248,113,113,0.10);
          --serif:     'Instrument Serif', Georgia, serif;
          --sans:      'Geist', system-ui, sans-serif;
        }

        body { background: var(--bg); font-family: var(--sans); }

        /* ── Page shell ─────────────────────────── */
        .page {
          min-height: 100vh;
          display: grid;
          place-items: center;
          padding: 24px;
          background: var(--bg);
          position: relative;
          overflow: hidden;
        }

        /* Subtle radial glow behind card */
        .page::before {
          content: '';
          position: absolute;
          inset: 0;
          background:
            radial-gradient(ellipse 600px 400px at 50% 50%, rgba(52,211,153,0.04) 0%, transparent 70%);
          pointer-events: none;
        }

        /* Grid texture */
        .page::after {
          content: '';
          position: absolute;
          inset: 0;
          background-image:
            linear-gradient(rgba(255,255,255,0.015) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.015) 1px, transparent 1px);
          background-size: 48px 48px;
          pointer-events: none;
        }

        /* ── Card ───────────────────────────────── */
        .card {
          position: relative;
          width: 100%;
          max-width: 480px;
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: 20px;
          padding: 56px 48px 48px;
          text-align: center;
          z-index: 1;
          opacity: 0;
          transform: translateY(20px) scale(0.98);
          transition: opacity 0.55s cubic-bezier(0.16,1,0.3,1),
                      transform 0.55s cubic-bezier(0.16,1,0.3,1);
        }
        .card.visible { opacity: 1; transform: translateY(0) scale(1); }

        /* Inner glow ring */
        .card::before {
          content: '';
          position: absolute;
          inset: -1px;
          border-radius: 21px;
          background: linear-gradient(135deg, rgba(52,211,153,0.15), transparent 40%, transparent 60%, rgba(52,211,153,0.06));
          pointer-events: none;
        }

        /* Soft top line accent */
        .card-accent {
          position: absolute;
          top: 0; left: 50%;
          transform: translateX(-50%);
          width: 160px; height: 1px;
          background: linear-gradient(90deg, transparent, var(--green), transparent);
          border-radius: 0 0 4px 4px;
        }

        /* ── Icon area ──────────────────────────── */
        .icon-wrap {
          width: 80px; height: 80px;
          margin: 0 auto 28px;
          position: relative;
        }

        /* Glow halo */
        .icon-halo {
          position: absolute;
          inset: -12px;
          border-radius: 50%;
          opacity: 0;
          transition: opacity 0.4s ease 0.4s;
        }
        .card.visible .icon-halo { opacity: 1; }

        .icon-halo.green { background: radial-gradient(circle, rgba(52,211,153,0.15) 0%, transparent 70%); }
        .icon-halo.amber { background: radial-gradient(circle, rgba(251,191,36,0.15) 0%, transparent 70%); }
        .icon-halo.red   { background: radial-gradient(circle, rgba(248,113,113,0.15) 0%, transparent 70%); }

        /* Check animation */
        .success-check { width: 80px; height: 80px; }

        .check-ring {
          stroke-dasharray: 226;
          stroke-dashoffset: 226;
          animation: drawRing 0.6s cubic-bezier(0.16,1,0.3,1) 0.2s forwards;
        }
        .check-mark {
          stroke-dasharray: 50;
          stroke-dashoffset: 50;
          animation: drawCheck 0.35s cubic-bezier(0.16,1,0.3,1) 0.75s forwards;
        }

        @keyframes drawRing  { to { stroke-dashoffset: 0; } }
        @keyframes drawCheck { to { stroke-dashoffset: 0; } }

        /* Pending ring spin */
        .pending-icon { width: 80px; height: 80px; }
        .pending-ring {
          stroke-dasharray: 100 126;
          stroke-dashoffset: 0;
          animation: spinRing 1.4s linear infinite;
          transform-origin: 40px 40px;
        }
        @keyframes spinRing { to { transform: rotate(360deg); } }

        /* ── Typography ─────────────────────────── */
        .eyebrow {
          font-family: var(--sans);
          font-size: 11px;
          font-weight: 500;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          margin-bottom: 10px;
          opacity: 0;
          transform: translateY(8px);
          transition: opacity 0.4s ease 0.5s, transform 0.4s ease 0.5s;
        }
        .card.visible .eyebrow { opacity: 1; transform: translateY(0); }
        .eyebrow.green { color: var(--green); }
        .eyebrow.amber { color: var(--amber); }
        .eyebrow.red   { color: var(--red); }

        .headline {
          font-family: var(--serif);
          font-size: 36px;
          font-weight: 400;
          line-height: 1.1;
          color: var(--text);
          margin-bottom: 14px;
          opacity: 0;
          transform: translateY(10px);
          transition: opacity 0.4s ease 0.6s, transform 0.4s ease 0.6s;
        }
        .card.visible .headline { opacity: 1; transform: translateY(0); }
        .headline em { font-style: italic; color: var(--green); }

        .body-text {
          font-size: 14px;
          color: var(--muted);
          line-height: 1.65;
          margin-bottom: 36px;
          opacity: 0;
          transform: translateY(8px);
          transition: opacity 0.4s ease 0.7s, transform 0.4s ease 0.7s;
        }
        .card.visible .body-text { opacity: 1; transform: translateY(0); }

        /* ── Divider ────────────────────────────── */
        .divider {
          height: 1px;
          background: var(--border);
          margin-bottom: 28px;
          opacity: 0;
          transition: opacity 0.4s ease 0.75s;
        }
        .card.visible .divider { opacity: 1; }

        /* ── Info row ───────────────────────────── */
        .info-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 10px 0;
          opacity: 0;
          transform: translateY(6px);
          transition: opacity 0.35s ease, transform 0.35s ease;
        }
        .card.visible .info-row:nth-child(1) { opacity:1; transform:translateY(0); transition-delay: 0.82s; }
        .card.visible .info-row:nth-child(2) { opacity:1; transform:translateY(0); transition-delay: 0.88s; }
        .card.visible .info-row:nth-child(3) { opacity:1; transform:translateY(0); transition-delay: 0.94s; }

        .info-label { font-size: 12px; color: var(--muted); }
        .info-value { font-size: 12px; font-weight: 500; color: var(--text); font-variant-numeric: tabular-nums; }

        .badge {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          padding: 3px 10px;
          border-radius: 100px;
          font-size: 11px;
          font-weight: 500;
        }
        .badge.green { background: var(--green-dim); color: var(--green); }
        .badge.amber { background: var(--amber-dim); color: var(--amber); }

        .badge-dot {
          width: 5px; height: 5px;
          border-radius: 50%;
          background: currentColor;
        }
        .badge.amber .badge-dot {
          animation: pulse 1.2s ease-in-out infinite;
        }
        @keyframes pulse {
          0%,100% { opacity: 1; } 50% { opacity: 0.3; }
        }

        /* ── CTA Button ─────────────────────────── */
        .cta-wrap {
          margin-top: 32px;
          opacity: 0;
          transform: translateY(8px);
          transition: opacity 0.4s ease 1s, transform 0.4s ease 1s;
        }
        .card.visible .cta-wrap { opacity: 1; transform: translateY(0); }

        .cta-btn {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 13px 28px;
          border-radius: 10px;
          border: none;
          background: var(--green);
          color: #0a0c0f;
          font-family: var(--sans);
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          text-decoration: none;
          transition: transform 0.15s ease, box-shadow 0.15s ease, background 0.15s ease;
          box-shadow: 0 0 0 0 rgba(52,211,153,0);
        }
        .cta-btn:hover {
          transform: translateY(-1px);
          box-shadow: 0 8px 24px rgba(52,211,153,0.25);
          background: #3ee5a5;
        }
        .cta-btn:active { transform: translateY(0); }

        .cta-btn svg { width: 14px; height: 14px; }

        .cta-secondary {
          margin-top: 14px;
          font-size: 12px;
          color: var(--muted);
        }
        .cta-secondary a {
          color: var(--muted);
          text-decoration: underline;
          text-underline-offset: 3px;
          transition: color 0.15s;
        }
        .cta-secondary a:hover { color: var(--text); }

        /* ── Particles ──────────────────────────── */
        .particles {
          position: absolute;
          inset: 0;
          pointer-events: none;
          overflow: hidden;
          border-radius: 20px;
        }

        .particle {
          position: absolute;
          width: 4px; height: 4px;
          border-radius: 50%;
          background: var(--green);
          opacity: 0;
          top: 50%; left: 50%;
        }

        ${[...Array(18)].map((_, i) => {
          const angle = (i / 18) * 360;
          const dist = 80 + Math.random() * 80;
          const x = Math.cos((angle * Math.PI) / 180) * dist;
          const y = Math.sin((angle * Math.PI) / 180) * dist;
          const delay = 0.7 + (i % 6) * 0.04;
          const size = i % 3 === 0 ? 6 : i % 3 === 1 ? 4 : 3;
          const colors = ['#34d399','#6ee7b7','#a7f3d0','#10b981'];
          const color = colors[i % 4];
          return `.particle-${i} {
            width: ${size}px; height: ${size}px;
            background: ${color};
            animation: burst${i} 0.8s cubic-bezier(0.2,0,0.8,1) ${delay}s forwards;
          }
          @keyframes burst${i} {
            0%   { opacity: 1; transform: translate(-50%,-50%) scale(1); }
            100% { opacity: 0; transform: translate(calc(-50% + ${x}px), calc(-50% + ${y}px)) scale(0); }
          }`;
        }).join('')}

        /* ── Loading skeleton ───────────────────── */
        .loading-page {
          min-height: 100vh;
          display: grid;
          place-items: center;
          background: var(--bg);
        }
        .loading-inner { display: flex; flex-direction: column; align-items: center; gap: 16px; }
        .spinner {
          width: 36px; height: 36px;
          border: 2px solid rgba(255,255,255,0.06);
          border-top-color: var(--green);
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }
        @keyframes spin { to { transform: rotate(360deg); } }
        .loading-label {
          font-family: var(--sans);
          font-size: 13px;
          color: var(--muted);
          letter-spacing: 0.04em;
        }

        /* ── Error state ────────────────────────── */
        .error-page {
          min-height: 100vh;
          display: grid;
          place-items: center;
          background: var(--bg);
          padding: 24px;
        }
        .error-card {
          max-width: 400px;
          width: 100%;
          background: var(--surface);
          border: 1px solid rgba(248,113,113,0.15);
          border-radius: 16px;
          padding: 40px 36px;
          text-align: center;
        }
        .error-icon {
          width: 48px; height: 48px;
          background: var(--red-dim);
          border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          margin: 0 auto 20px;
          font-size: 22px;
        }
        .error-title { font-family: var(--serif); font-size: 24px; color: var(--text); margin-bottom: 8px; }
        .error-msg { font-size: 13px; color: var(--muted); line-height: 1.6; }

        /* ── Responsive ─────────────────────────── */
        @media (max-width: 540px) {
          .card { padding: 44px 28px 36px; }
          .headline { font-size: 30px; }
        }
      `}</style>

      {/* ── Loading ── */}
      {loading && (
        <div className="loading-page">
          <div className="loading-inner">
            <div className="spinner" />
            <span className="loading-label">Verificando transacción…</span>
          </div>
        </div>
      )}

      {/* ── Error ── */}
      {!loading && error && (
        <div className="error-page">
          <div className="error-card">
            <div className="error-icon">⚠</div>
            <h2 className="error-title">Algo salió mal</h2>
            <p className="error-msg">{error}</p>
          </div>
        </div>
      )}

      {/* ── Success / Pending ── */}
      {!loading && !error && (
        <div className="page">
          <div className={`card ${visible ? "visible" : ""}`}>
            <div className="card-accent" />

            {status === "paid" && <Particles />}

            {/* Icon */}
            <div className="icon-wrap">
              <div className={`icon-halo ${status === "paid" ? "green" : "amber"}`} />
              {status === "paid" ? <CheckmarkCircle /> : <PendingIcon />}
            </div>

            {/* Eyebrow */}
            <div className={`eyebrow ${status === "paid" ? "green" : "amber"}`}>
              {status === "paid" ? "Transacción completada" : "En proceso"}
            </div>

            {/* Headline */}
            <h1 className="headline">
              {status === "paid" ? (
                <><em>Listo.</em> Tu pedido<br />está confirmado</>
              ) : (
                <>Verificando<br />tu <em>pago</em></>
              )}
            </h1>

            {/* Body */}
            <p className="body-text">
              {status === "paid"
                ? "Hemos recibido tu pago correctamente. Recibirás un correo de confirmación en breve con todos los detalles de tu pedido."
                : "Tu transacción está siendo procesada. Esto puede tardar unos instantes. Te notificaremos en cuanto tengamos confirmación."}
            </p>

            {/* Info rows */}
            <div className="divider" />
            <div className="info-row">
              <span className="info-label">Estado del pago</span>
              <span className="badge green" style={status !== "paid" ? {background: 'var(--amber-dim)', color: 'var(--amber)'} : {}}>
                <span className="badge-dot" />
                {status === "paid" ? "Confirmado" : "Pendiente"}
              </span>
            </div>
            <div className="info-row">
              <span className="info-label">Referencia</span>
              <span className="info-value" style={{fontFamily:'monospace', fontSize:'11px', color:'#9ca3af'}}>
                {sessionId ? `…${sessionId.slice(-12)}` : "—"}
              </span>
            </div>
            <div className="info-row">
              <span className="info-label">Fecha</span>
              <span className="info-value">
                {new Date().toLocaleDateString("es-ES", { day:"2-digit", month:"short", year:"numeric" })}
              </span>
            </div>

            {/* CTA */}
            {status === "paid" && (
              <div className="cta-wrap">
                <a href="/" className="cta-btn">
                  <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                    <path d="M2 8h12M9 3l5 5-5 5" />
                  </svg>
                  Ir a mis pedidos
                </a>
                <p className="cta-secondary">
                  ¿Alguna duda? <a href="/soporte">Contactar soporte</a>
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
