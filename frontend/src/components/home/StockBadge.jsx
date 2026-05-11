import { GridIcon3, GridIcon4 } from "./icons"

export default function ProductsToolbar({ cols, setCols }) {
  return (
    <div style={{
      display: "flex",
      background: "white",
      border: "1px solid rgba(0,0,0,0.09)",
      borderRadius: 9,
      overflow: "hidden",
      boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
    }}>
      {[3, 4].map((n, i) => (
        <button
          key={n}
          onClick={() => setCols(n)}
          style={{
            display: "flex", alignItems: "center", gap: 5,
            padding: "0 11px",
            height: 34,
            background: cols === n ? "#f97316" : "transparent",
            color: cols === n ? "white" : "#94a3b8",
            border: "none",
            borderLeft: i > 0 ? "1px solid rgba(0,0,0,0.08)" : "none",
            cursor: "pointer",
            transition: "all 0.14s ease",
            fontSize: 12, fontWeight: 600,
          }}
          onMouseEnter={e => { if (cols !== n) { e.currentTarget.style.background = "rgba(249,115,22,0.06)"; e.currentTarget.style.color = "#f97316" } }}
          onMouseLeave={e => { if (cols !== n) { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#94a3b8" } }}
        >
          {n === 3 ? <GridIcon3 /> : <GridIcon4 />}
          <span style={{ display: "none" }} className="cl-cols-label">{n}</span>
        </button>
      ))}

      <style>{`
        @media (min-width: 640px) {
          .cl-cols-label { display: inline !important; }
        }
      `}</style>
    </div>
  )
}