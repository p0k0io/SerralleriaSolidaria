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

// Els 12 mesos fixes en ordre — el backend pot enviar qualsevol ordre o faltar mesos
const MONTH_NAMES = ["Gen","Feb","Mar","Abr","Mai","Jun","Jul","Ago","Set","Oct","Nov","Des"];

function normalizeMonths(data) {
  // Accepta { month: "Gen", total: 123 } o { month: 1, total: 123 }
  const map = {};
  data.forEach((d) => {
    const key = typeof d.month === "number"
      ? MONTH_NAMES[d.month - 1]          // índex numèric → nom
      : String(d.month).trim().slice(0,3); // nom → normalitzar
    // Acumula per si el backend envia duplicats
    map[key] = (map[key] || 0) + (d.total || 0);
  });
  return MONTH_NAMES.map((name) => ({ month: name, total: map[name] || 0 }));
}

// ── Gràfic de barres: vendes anuals ──────────────────────────────────────────
function BarChart({ data }) {
  // Sempre 12 barres, una per mes, en ordre
  data = normalizeMonths(data);
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

    const PAD = { top: 20, right: 12, bottom: 32, left: 48 };
    const chartW = W - PAD.left - PAD.right;
    const chartH = H - PAD.top - PAD.bottom;

    const max = Math.max(...data.map((d) => d.total));
    const yMax = max === 0 ? 1000 : Math.ceil(max / 1000) * 1000;
    const TICKS = 4;

    ctx.clearRect(0, 0, W, H);

    // Grid lines + Y labels
    ctx.textAlign = "right";
    ctx.textBaseline = "middle";
    ctx.font = `10px 'DM Sans', system-ui, sans-serif`;
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
      ctx.fillText(formatEur(val), PAD.left - 6, y);
    }

    const gap = chartW / data.length;
    const barW = gap * 0.52;

    data.forEach((d, i) => {
      const x = PAD.left + gap * i + gap / 2 - barW / 2;
      const barH = (d.total / yMax) * chartH;
      const y = PAD.top + chartH - barH;
      const radius = 4;

      if (d.total > 0) {
        ctx.shadowColor = "rgba(249,115,22,0.15)";
        ctx.shadowBlur = 6;
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
      } else {
        // Barra buida
        ctx.fillStyle = "#f1f5f9";
        ctx.beginPath();
        ctx.roundRect(x, PAD.top + chartH - 3, barW, 3, 2);
        ctx.fill();
      }

      // Etiqueta mes
      ctx.fillStyle = TEXT;
      ctx.textAlign = "center";
      ctx.textBaseline = "top";
      ctx.font = `10px 'DM Sans', system-ui, sans-serif`;
      ctx.fillText(d.month, x + barW / 2, PAD.top + chartH + 6);

      // Valor sobre la barra
      if (barH > 16 && d.total > 0) {
        ctx.fillStyle = TEXT_DARK;
        ctx.textBaseline = "bottom";
        ctx.font = `bold 9px 'DM Sans', system-ui, sans-serif`;
        ctx.fillText(formatEur(d.total), x + barW / 2, y - 3);
      }
    });
  }, [data]);

  return <canvas ref={canvasRef} style={{ width: "100%", height: "100%" }} />;
}

// ── Gràfic de línia: vendes anuals mes a mes ─────────────────────────────────
function MonthLineChart({ data }) {
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

    const PAD = { top: 20, right: 16, bottom: 32, left: 48 };
    const chartW = W - PAD.left - PAD.right;
    const chartH = H - PAD.top - PAD.bottom;

    const max = Math.max(...data.map((d) => d.total));
    const yMax = max === 0 ? 1000 : Math.ceil(max / 1000) * 1000;
    const TICKS = 4;

    ctx.clearRect(0, 0, W, H);

    // Grid + Y labels
    ctx.textAlign = "right";
    ctx.textBaseline = "middle";
    ctx.font = `10px 'DM Sans', system-ui, sans-serif`;
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
      ctx.fillText(formatEur(val), PAD.left - 6, y);
    }

    const px = (i) => PAD.left + (i / (data.length - 1)) * chartW;
    const py = (v) => PAD.top + chartH - (v / yMax) * chartH;

    // Area fill
    const grad = ctx.createLinearGradient(0, PAD.top, 0, PAD.top + chartH);
    grad.addColorStop(0, "rgba(249,115,22,0.18)");
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

    // Line
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

    // Dots + month labels
    data.forEach((d, i) => {
      // Dot
      ctx.beginPath();
      ctx.arc(px(i), py(d.total), 3, 0, Math.PI * 2);
      ctx.fillStyle = d.total > 0 ? "#fff" : "#f1f5f9";
      ctx.fill();
      ctx.strokeStyle = d.total > 0 ? ORANGE : "#e2e8f0";
      ctx.lineWidth = 2;
      ctx.stroke();

      // Month label
      ctx.fillStyle = TEXT;
      ctx.textAlign = "center";
      ctx.textBaseline = "top";
      ctx.font = `10px 'DM Sans', system-ui, sans-serif`;
      ctx.fillText(d.month, px(i), PAD.top + chartH + 6);
    });
  }, [data]);

  return <canvas ref={canvasRef} style={{ width: "100%", height: "100%" }} />;
}

// ── Gràfic de línia: vendes mensuals dia a dia ────────────────────────────────
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
    const yMax = max === 0 ? 100 : Math.ceil(max / 100) * 100;
    const TICKS = 5;

    ctx.clearRect(0, 0, W, H);

    ctx.textAlign = "right";
    ctx.textBaseline = "middle";
    ctx.font = `11px 'DM Sans', system-ui, sans-serif`;
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
    grad.addColorStop(0, "rgba(249,115,22,0.18)");
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
        ctx.font = `11px 'DM Sans', system-ui, sans-serif`;
        ctx.fillText(`${d.day}`, px(i), PAD.top + chartH + 8);
      }
    });
  }, [data]);

  return <canvas ref={canvasRef} style={{ width: "100%", height: "100%" }} />;
}

// ── Gràfic de barres horari: vendes del dia ───────────────────────────────────
function HourlyBarChart({ data }) {
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

    const PAD = { top: 20, right: 12, bottom: 32, left: 52 };
    const chartW = W - PAD.left - PAD.right;
    const chartH = H - PAD.top - PAD.bottom;

    const max = Math.max(...data.map((d) => d.total));
    const yMax = max === 0 ? 100 : Math.ceil(max / 50) * 50;
    const TICKS = 4;

    ctx.clearRect(0, 0, W, H);

    ctx.textAlign = "right";
    ctx.textBaseline = "middle";
    ctx.font = `10px 'DM Sans', system-ui, sans-serif`;
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
      ctx.fillText(formatEur(val), PAD.left - 6, y);
    }

    const gap = chartW / data.length;
    const barW = gap * 0.6;
    const now = new Date().getHours();

    data.forEach((d, i) => {
      const x = PAD.left + gap * i + gap / 2 - barW / 2;
      const barH = (d.total / yMax) * chartH;
      const y = PAD.top + chartH - barH;
      const isNow = d.hour === now;
      const isFuture = d.hour > now;
      const radius = 4;

      if (d.total > 0) {
        ctx.shadowColor = isNow ? "rgba(249,115,22,0.3)" : "rgba(249,115,22,0.1)";
        ctx.shadowBlur = isNow ? 10 : 4;

        const grad = ctx.createLinearGradient(0, y, 0, y + barH);
        if (isNow) {
          grad.addColorStop(0, "#ea580c");
          grad.addColorStop(1, ORANGE);
        } else {
          grad.addColorStop(0, ORANGE);
          grad.addColorStop(1, ORANGE_LIGHT);
        }
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
      } else if (!isFuture) {
        ctx.fillStyle = "#f1f5f9";
        ctx.beginPath();
        ctx.roundRect(x, PAD.top + chartH - 3, barW, 3, 2);
        ctx.fill();
      }

      // Etiqueta hora (cada 3h)
      if (d.hour % 3 === 0) {
        ctx.fillStyle = isNow ? ORANGE : TEXT;
        ctx.textAlign = "center";
        ctx.textBaseline = "top";
        ctx.font = isNow
          ? `bold 10px 'DM Sans', system-ui, sans-serif`
          : `10px 'DM Sans', system-ui, sans-serif`;
        ctx.fillText(`${String(d.hour).padStart(2, "0")}h`, x + barW / 2, PAD.top + chartH + 6);
      }

      // Punt "ara"
      if (isNow) {
        ctx.fillStyle = ORANGE;
        ctx.beginPath();
        ctx.arc(x + barW / 2, PAD.top + chartH + 22, 3, 0, Math.PI * 2);
        ctx.fill();
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
      ⚠ {message}
    </div>
  );
}

function LoadingSpinner({ text }) {
  return (
    <div className="flex items-center justify-center py-8 gap-3 text-slate-400">
      <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
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
  const [hourlySales, setHourlySales] = useState([]);
  const [loadingMonthly, setLoadingMonthly] = useState(true);
  const [loadingDaily, setLoadingDaily] = useState(true);
  const [loadingHourly, setLoadingHourly] = useState(true);
  const [errorMonthly, setErrorMonthly] = useState(null);
  const [errorDaily, setErrorDaily] = useState(null);
  const [errorHourly, setErrorHourly] = useState(null);

  useEffect(() => {
    authFetch("http://localhost:8000/api/dashboard/monthly-sales")
      .then((r) => { if (!r.ok) throw new Error("Error al obtenir les vendes mensuals"); return r.json(); })
      .then((data) => { setMonthlySales(data); setLoadingMonthly(false); })
      .catch((e) => { setErrorMonthly(e.message); setLoadingMonthly(false); });

    authFetch("http://localhost:8000/api/dashboard/daily-sales")
      .then((r) => { if (!r.ok) throw new Error("Error al obtenir les vendes diàries"); return r.json(); })
      .then((data) => { setDailySales(data); setLoadingDaily(false); })
      .catch((e) => { setErrorDaily(e.message); setLoadingDaily(false); });

    authFetch("http://localhost:8000/api/dashboard/hourly-sales")
      .then((r) => { if (!r.ok) throw new Error("Error al obtenir les vendes del dia"); return r.json(); })
      .then((data) => { setHourlySales(data); setLoadingHourly(false); })
      .catch((e) => { setErrorHourly(e.message); setLoadingHourly(false); });
  }, [authFetch]);

  const normalizedMonthly = normalizeMonths(monthlySales);
  const totalAnual = normalizedMonthly.reduce((s, m) => s + m.total, 0);
  const totalMes = dailySales.reduce((s, d) => s + d.total, 0);
  const totalDia = hourlySales.reduce((s, h) => s + h.total, 0);
  const bestMonth = normalizedMonthly.length > 0 ? normalizedMonthly.reduce((a, b) => (a.total > b.total ? a : b)) : null;
  const bestDay = dailySales.length > 0 ? dailySales.reduce((a, b) => (a.total > b.total ? a : b)) : null;
  const bestHour = hourlySales.length > 0 ? hourlySales.reduce((a, b) => (a.total > b.total ? a : b)) : null;
  const peakOrders = hourlySales.length > 0 ? Math.max(...hourlySales.map((h) => h.orders || 0)) : 0;
  const peakHour = hourlySales.find((h) => h.orders === peakOrders);

  const currentYear = new Date().getFullYear();
  const currentMonthLabel = new Date().toLocaleDateString("ca-ES", { month: "long", year: "numeric" });
  const todayLabel = new Date().toLocaleDateString("ca-ES", { weekday: "long", day: "numeric", month: "long" });

  return (
    <div className="p-6 space-y-4">

      {/* Fila superior: Vendes anuals (esq) + Vendes del mes (dreta) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

        {/* Vendes del mes */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm flex flex-col min-w-0">
          <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-3 border-b border-slate-100">
            <div>
              <h2 className="font-semibold text-slate-800 text-sm">Vendes del mes</h2>
              <p className="text-xs text-slate-400 mt-0.5 capitalize">{currentMonthLabel} — dia a dia</p>
            </div>
            {!loadingDaily && !errorDaily && dailySales.length > 0 && (
              <div className="flex gap-4">
                <Stat label="Total mes" value={`${totalMes.toLocaleString("ca-ES")} €`} />
                {bestDay && bestDay.total > 0 && (
                  <Stat label="Millor dia" value={`Dia ${bestDay.day}`} sub={`${bestDay.total} €`} />
                )}
              </div>
            )}
          </div>
          {loadingDaily ? (
            <LoadingSpinner text="Carregant vendes diàries…" />
          ) : errorDaily ? (
            <ErrorCard message={errorDaily} />
          ) : dailySales.length === 0 ? (
            <div className="flex items-center justify-center py-8 text-slate-400 text-sm">
              No hi ha dades de vendes aquest mes
            </div>
          ) : (
            <div className="px-3 py-3" style={{ height: 210 }}>
              <LineChart data={dailySales} />
            </div>
          )}
        </div>

        {/* Vendes anuals */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm flex flex-col min-w-0">
          <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-3 border-b border-slate-100">
            <div>
              <h2 className="font-semibold text-slate-800 text-sm">Vendes anuals</h2>
              <p className="text-xs text-slate-400 mt-0.5">Gen — Des {currentYear}</p>
            </div>
            {!loadingMonthly && !errorMonthly && monthlySales.length > 0 && (
              <div className="flex gap-4">
                <Stat label="Total any" value={`${(totalAnual / 1000).toFixed(1)}k €`} />
                {bestMonth && bestMonth.total > 0 && (
                  <Stat label="Millor mes" value={bestMonth.month} sub={`${(bestMonth.total / 1000).toFixed(1)}k €`} />
                )}
              </div>
            )}
          </div>
          {loadingMonthly ? (
            <LoadingSpinner text="Carregant vendes mensuals…" />
          ) : errorMonthly ? (
            <ErrorCard message={errorMonthly} />
          ) : monthlySales.length === 0 ? (
            <div className="flex items-center justify-center py-8 text-slate-400 text-sm">
              No hi ha dades de vendes anuals
            </div>
          ) : (
            <div className="px-3 py-3" style={{ height: 210 }}>
              <MonthLineChart data={normalizedMonthly} />
            </div>
          )}
        </div>
      </div>

      {/* Vendes d'avui — per hora (amplada completa) */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4 px-5 py-3 border-b border-slate-100">
          <div>
            <h2 className="font-semibold text-slate-800 text-sm">Vendes d'avui</h2>
            <p className="text-xs text-slate-400 mt-0.5 capitalize">{todayLabel} — hora a hora</p>
          </div>
          {!loadingHourly && !errorHourly && hourlySales.length > 0 && (
            <div className="flex gap-5">
              <Stat label="Total avui" value={`${totalDia.toLocaleString("ca-ES")} €`} />
              {bestHour && bestHour.total > 0 && (
                <Stat
                  label="Hora punta"
                  value={`${String(bestHour.hour).padStart(2, "0")}:00h`}
                  sub={`${bestHour.total} €`}
                />
              )}
              {peakHour && peakOrders > 0 && (
                <Stat
                  label="Més comandes"
                  value={`${String(peakHour.hour).padStart(2, "0")}:00h`}
                  sub={`${peakOrders} comandes`}
                />
              )}
            </div>
          )}
        </div>
        {loadingHourly ? (
          <LoadingSpinner text="Carregant vendes del dia…" />
        ) : errorHourly ? (
          <ErrorCard message={errorHourly} />
        ) : hourlySales.length === 0 ? (
          <div className="flex items-center justify-center py-8 text-slate-400 text-sm">
            No hi ha dades de vendes avui
          </div>
        ) : (
          <div className="px-3 py-3" style={{ height: 200 }}>
            <HourlyBarChart data={hourlySales} />
          </div>
        )}
      </div>

    </div>
  );
}