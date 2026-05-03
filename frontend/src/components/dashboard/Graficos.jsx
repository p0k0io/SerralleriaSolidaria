import { useEffect, useRef, useState } from "react";
import { useAuth } from "../../context/AuthContext";

const ORANGE = "#f97316";
const ORANGE_LIGHT = "#fed7aa";
const GRID = "#f1f5f9";
const TEXT = "#94a3b8";
const TEXT_DARK = "#475569";

function formatEur(n) {
  return n >= 1000 ? `${(n / 1000).toFixed(1)}k €` : `${n} €`;
}

// ── Gráfico barras: ventas anuales ────────────────────────────────────────────
function BarChart({ data }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const dpr = window.devicePixelRatio || 1;
    const W = canvas.offsetWidth;
    const H = canvas.offsetHeight;
    canvas.width = W * dpr;
    canvas.height = H * dpr;
    ctx.scale(dpr, dpr);

    const PAD = { top: 24, right: 20, bottom: 40, left: 52 };
    const chartW = W - PAD.left - PAD.right;
    const chartH = H - PAD.top - PAD.bottom;

    const max = Math.max(...data.map((d) => d.total));
    const yMax = Math.ceil(max / 1000) * 1000;
    const TICKS = 5;

    ctx.clearRect(0, 0, W, H);

    ctx.textAlign = "right";
    ctx.textBaseline = "middle";
    ctx.font = `11px Inter, system-ui, sans-serif`;
    for (let i = 0; i <= TICKS; i++) {
      const val = (yMax / TICKS) * i;
      const y = PAD.top + chartH - (chartH * i) / TICKS;
      ctx.strokeStyle = GRID;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(PAD.left, y);
      ctx.lineTo(PAD.left + chartW, y);
      ctx.stroke();
      ctx.fillStyle = TEXT;
      ctx.fillText(formatEur(val), PAD.left - 8, y);
    }

    const barW = (chartW / data.length) * 0.55;
    const gap = chartW / data.length;

    data.forEach((d, i) => {
      const x = PAD.left + gap * i + gap / 2 - barW / 2;
      const barH = (d.total / yMax) * chartH;
      const y = PAD.top + chartH - barH;
      const radius = 6;

      ctx.shadowColor = "rgba(249,115,22,0.18)";
      ctx.shadowBlur = 8;

      const grad = ctx.createLinearGradient(0, y, 0, y + barH);
      grad.addColorStop(0, ORANGE);
      grad.addColorStop(1, ORANGE_LIGHT);
      ctx.fillStyle = grad;

      ctx.beginPath();
      ctx.moveTo(x + radius, y);
      ctx.lineTo(x + barW - radius, y);
      ctx.quadraticCurveTo(x + barW, y, x + barW, y + radius);
      ctx.lineTo(x + barW, y + barH);
      ctx.lineTo(x, y + barH);
      ctx.lineTo(x, y + radius);
      ctx.quadraticCurveTo(x, y, x + radius, y);
      ctx.closePath();
      ctx.fill();
      ctx.shadowBlur = 0;

      ctx.fillStyle = TEXT_DARK;
      ctx.textAlign = "center";
      ctx.textBaseline = "top";
      ctx.font = `11px Inter, system-ui, sans-serif`;
      ctx.fillText(d.month, x + barW / 2, PAD.top + chartH + 8);

      if (barH > 20) {
        ctx.fillStyle = TEXT_DARK;
        ctx.textBaseline = "bottom";
        ctx.font = `bold 10px Inter, system-ui, sans-serif`;
        ctx.fillText(formatEur(d.total), x + barW / 2, y - 4);
      }
    });
  }, [data]);

  return <canvas ref={canvasRef} style={{ width: "100%", height: "100%" }} />;
}

function LineChart({ data }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const dpr = window.devicePixelRatio || 1;
    const W = canvas.offsetWidth;
    const H = canvas.offsetHeight;
    canvas.width = W * dpr;
    canvas.height = H * dpr;
    ctx.scale(dpr, dpr);

    const PAD = { top: 24, right: 20, bottom: 40, left: 52 };
    const chartW = W - PAD.left - PAD.right;
    const chartH = H - PAD.top - PAD.bottom;

    const max = Math.max(...data.map((d) => d.total));
    const yMax = Math.ceil(max / 100) * 100;
    const TICKS = 5;

    ctx.clearRect(0, 0, W, H);

    ctx.textAlign = "right";
    ctx.textBaseline = "middle";
    ctx.font = `11px Inter, system-ui, sans-serif`;
    for (let i = 0; i <= TICKS; i++) {
      const val = (yMax / TICKS) * i;
      const y = PAD.top + chartH - (chartH * i) / TICKS;
      ctx.strokeStyle = GRID;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(PAD.left, y);
      ctx.lineTo(PAD.left + chartW, y);
      ctx.stroke();
      ctx.fillStyle = TEXT;
      ctx.fillText(formatEur(val), PAD.left - 8, y);
    }

    const px = (i) => PAD.left + (i / (data.length - 1)) * chartW;
    const py = (v) => PAD.top + chartH - (v / yMax) * chartH;

    const grad = ctx.createLinearGradient(0, PAD.top, 0, PAD.top + chartH);
    grad.addColorStop(0, "rgba(249,115,22,0.22)");
    grad.addColorStop(1, "rgba(249,115,22,0)");
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.moveTo(px(0), py(data[0].total));
    for (let i = 1; i < data.length; i++) {
      const cpx = (px(i - 1) + px(i)) / 2;
      ctx.bezierCurveTo(cpx, py(data[i - 1].total), cpx, py(data[i].total), px(i), py(data[i].total));
    }
    ctx.lineTo(px(data.length - 1), PAD.top + chartH);
    ctx.lineTo(px(0), PAD.top + chartH);
    ctx.closePath();
    ctx.fill();

    ctx.strokeStyle = ORANGE;
    ctx.lineWidth = 2.5;
    ctx.lineJoin = "round";
    ctx.beginPath();
    ctx.moveTo(px(0), py(data[0].total));
    for (let i = 1; i < data.length; i++) {
      const cpx = (px(i - 1) + px(i)) / 2;
      ctx.bezierCurveTo(cpx, py(data[i - 1].total), cpx, py(data[i].total), px(i), py(data[i].total));
    }
    ctx.stroke();

    data.forEach((d, i) => {
      ctx.beginPath();
      ctx.arc(px(i), py(d.total), 3.5, 0, Math.PI * 2);
      ctx.fillStyle = "#fff";
      ctx.fill();
      ctx.strokeStyle = ORANGE;
      ctx.lineWidth = 2;
      ctx.stroke();

      if ((d.day - 1) % 5 === 0 || d.day === 1) {
        ctx.fillStyle = TEXT_DARK;
        ctx.textAlign = "center";
        ctx.textBaseline = "top";
        ctx.font = `11px Inter, system-ui, sans-serif`;
        ctx.fillText(`${d.day}`, px(i), PAD.top + chartH + 8);
      }
    });
  }, [data]);

  return <canvas ref={canvasRef} style={{ width: "100%", height: "100%" }} />;
}

function Stat({ label, value, sub }) {
  return (
    <div className="flex flex-col">
      <span className="text-xs text-slate-400">{label}</span>
      <span className="text-lg font-bold text-slate-800">{value}</span>
      {sub && <span className="text-xs text-slate-400 font-medium">{sub}</span>}
    </div>
  );
}

function ErrorCard({ message }) {
  return (
    <div className="m-5 p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
       {message}
    </div>
  );
}

function LoadingSpinner({ text }) {
  return (
    <div className="flex items-center justify-center py-12 gap-3 text-slate-400">
      <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M21 12a9 9 0 1 1-6.219-8.56" />
      </svg>
      <span className="text-sm">{text}</span>
    </div>
  );
}

export default function Graficos() {
  const { authFetch } = useAuth();
  const [monthlySales, setMonthlySales] = useState([]);
  const [dailySales, setDailySales] = useState([]);
  const [loadingMonthly, setLoadingMonthly] = useState(true);
  const [loadingDaily, setLoadingDaily] = useState(true);
  const [errorMonthly, setErrorMonthly] = useState(null);
  const [errorDaily, setErrorDaily] = useState(null);

  useEffect(() => {
    authFetch("http://localhost:8000/api/dashboard/monthly-sales")
      .then((r) => { if (!r.ok) throw new Error("Error al obtenir les vendes mensuals"); return r.json(); })
      .then((data) => { setMonthlySales(data); setLoadingMonthly(false); })
      .catch((e) => { setErrorMonthly(e.message); setLoadingMonthly(false); });

    authFetch("http://localhost:8000/api/dashboard/daily-sales")
      .then((r) => { if (!r.ok) throw new Error("Error al obtenir les vendes diàries"); return r.json(); })
      .then((data) => { setDailySales(data); setLoadingDaily(false); })
      .catch((e) => { setErrorDaily(e.message); setLoadingDaily(false); });
  }, [authFetch]);

  // Calculados dinámicamente desde los datos reales
  const totalAnual = monthlySales.reduce((s, m) => s + m.total, 0);
  const totalMes = dailySales.reduce((s, d) => s + d.total, 0);
  const bestMonth = monthlySales.length > 0 ? monthlySales.reduce((a, b) => (a.total > b.total ? a : b)) : null;
  const bestDay = dailySales.length > 0 ? dailySales.reduce((a, b) => (a.total > b.total ? a : b)) : null;

  // Etiquetas de período dinámicas
  const currentYear = new Date().getFullYear();
  const currentMonthLabel = new Date().toLocaleDateString("ca-ES", { month: "long", year: "numeric" });

  return (
    <div className="p-6 space-y-5">

      {/* Ventas anuales */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4 px-6 py-4 border-b border-slate-100">
          <div>
            <h2 className="font-semibold text-slate-800">Vendes anuals</h2>
            <p className="text-xs text-slate-400 mt-0.5">Gener — Desembre {currentYear}</p>
          </div>
          {!loadingMonthly && !errorMonthly && monthlySales.length > 0 && (
            <div className="flex gap-6">
              <Stat label="Total any" value={`${(totalAnual / 1000).toFixed(1)}k €`} />
              <Stat label="Millor mes" value={bestMonth.month} sub={`${(bestMonth.total / 1000).toFixed(1)}k €`} />
            </div>
          )}
        </div>
        {loadingMonthly ? (
          <LoadingSpinner text="Carregant vendes mensuals…" />
        ) : errorMonthly ? (
          <ErrorCard message={errorMonthly} />
        ) : monthlySales.length === 0 ? (
          <div className="flex items-center justify-center py-12 text-slate-400 text-sm">
            No hi ha dades de vendes anuals
          </div>
        ) : (
          <div className="px-4 py-4" style={{ height: 280 }}>
            <BarChart data={monthlySales} />
          </div>
        )}
      </div>

      {/* Ventas del mes */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4 px-6 py-4 border-b border-slate-100">
          <div>
            <h2 className="font-semibold text-slate-800">Vendes del mes</h2>
            <p className="text-xs text-slate-400 mt-0.5 capitalize">{currentMonthLabel} — dia a dia</p>
          </div>
          {!loadingDaily && !errorDaily && dailySales.length > 0 && (
            <div className="flex gap-6">
              <Stat label="Total mes" value={`${totalMes.toLocaleString("ca-ES")} €`} />
              <Stat label="Millor dia" value={`Dia ${bestDay.day}`} sub={`${bestDay.total} €`} />
            </div>
          )}
        </div>
        {loadingDaily ? (
          <LoadingSpinner text="Carregant vendes diàries…" />
        ) : errorDaily ? (
          <ErrorCard message={errorDaily} />
        ) : dailySales.length === 0 ? (
          <div className="flex items-center justify-center py-12 text-slate-400 text-sm">
            No hi ha dades de vendes aquest mes
          </div>
        ) : (
          <div className="px-4 py-4" style={{ height: 260 }}>
            <LineChart data={dailySales} />
          </div>
        )}
      </div>

    </div>
  );
}
