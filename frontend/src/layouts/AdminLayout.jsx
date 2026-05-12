import { Outlet, NavLink, useLocation } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import { AdminToastProvider } from "../context/AdminToastContext";

/* ─────────────────────────────────────────────────────────────
   DESIGN TOKENS  (edit here to retheme the whole panel)
───────────────────────────────────────────────────────────── */
const TOKEN = {
  sidebarW:      248,
  sidebarCollapsed: 64,
  headerH:       56,
  transitionMs:  220,
};

/* ─────────────────────────────────────────────────────────────
   NAV ITEMS
───────────────────────────────────────────────────────────── */
const NAV_SECTIONS = [
  {
    label: "Principal",
    items: [
      { to: "/admin/dashboard",  label: "Dashboard",   icon: <IconDashboard /> },
      { to: "/admin/products",   label: "Productos",   icon: <IconBox /> },
      { to: "/admin/packs",      label: "Packs",       icon: <IconLayers /> },
    ],
  },
  {
    label: "Gestión",
    items: [
      { to: "/admin/categories", label: "Categorías",  icon: <IconTag /> },
      { to: "/admin/attributes", label: "Atributos",   icon: <IconSliders /> },
      { to: "/admin/requests",   label: "Solicitudes", icon: <IconClipboard /> },
      { to: "/admin/orders",     label: "Órdenes",     icon: <IconShoppingBag /> },
    ],
  },
];

/* ─────────────────────────────────────────────────────────────
   ICONS  (clean, consistent 20×20 SVG set)
───────────────────────────────────────────────────────────── */
function Svg({ children, size = 18 }) {
  return (
    <svg
      width={size} height={size} viewBox="0 0 24 24"
      fill="none" stroke="currentColor"
      strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"
    >
      {children}
    </svg>
  );
}
function IconDashboard()    { return <Svg><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></Svg>; }
function IconBox()          { return <Svg><path d="M21 16V8l-9-5-9 5v8l9 5 9-5z"/><path d="m3.27 6.96 8.73 5.05 8.73-5.05M12 22.08V12"/></Svg>; }
function IconLayers()       { return <Svg><path d="M12 2 2 7l10 5 10-5-10-5z"/><path d="m2 17 10 5 10-5M2 12l10 5 10-5"/></Svg>; }
function IconTag()          { return <Svg><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><path d="M7 7h.01"/></Svg>; }
function IconClipboard()    { return <Svg><path d="M9 2H7a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z"/><path d="M9 2v6h6"/><path d="M14 2H7"/><path d="M12 12v4M10 14h4"/></Svg>; }
function IconShoppingBag()  { return <Svg><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></Svg>; }
function IconSliders()      { return <Svg><line x1="4" y1="21" x2="4" y2="14"/><line x1="4" y1="10" x2="4" y2="3"/><line x1="12" y1="21" x2="12" y2="12"/><line x1="12" y1="8" x2="12" y2="3"/><line x1="20" y1="21" x2="20" y2="16"/><line x1="20" y1="12" x2="20" y2="3"/><line x1="1" y1="14" x2="7" y2="14"/><line x1="9" y1="8" x2="15" y2="8"/><line x1="17" y1="16" x2="23" y2="16"/></Svg>; }
function IconBell()         { return <Svg><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></Svg>; }
function IconSettings()     { return <Svg><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></Svg>; }
function IconLogout()       { return <Svg size={16}><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></Svg>; }
function IconChevronLeft()  { return <Svg size={14}><path d="M15 18l-6-6 6-6"/></Svg>; }
function IconChevronRight() { return <Svg size={14}><path d="M9 18l6-6-6-6"/></Svg>; }
function IconSearch()       { return <Svg size={16}><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></Svg>; }
function IconMenu()         { return <Svg size={18}><line x1="3" y1="6"  x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></Svg>; }

/* ─────────────────────────────────────────────────────────────
   BREADCRUMB HOOK
───────────────────────────────────────────────────────────── */
const LABELS = {
  admin: "Admin", dashboard: "Dashboard", products: "Productos",
  packs: "Packs", categories: "Categorías", attributes: "Atributos", requests: "Solicitudes",
  orders: "Órdenes",
};

function useBreadcrumbs() {
  const { pathname } = useLocation();
  return pathname
    .replace(/^\//, "")
    .split("/")
    .filter(Boolean)
    .map(s => LABELS[s] ?? s.charAt(0).toUpperCase() + s.slice(1));
}

/* ─────────────────────────────────────────────────────────────
   TOOLTIP (for collapsed sidebar)
───────────────────────────────────────────────────────────── */
function Tooltip({ label, visible }) {
  if (!visible) return null;
  return (
    <div style={{
      position: "absolute",
      left: "calc(100% + 12px)",
      top: "50%",
      transform: "translateY(-50%)",
      background: "#0f172a",
      color: "#f1f5f9",
      fontSize: 12,
      fontWeight: 500,
      padding: "5px 10px",
      borderRadius: 7,
      whiteSpace: "nowrap",
      pointerEvents: "none",
      zIndex: 9999,
      boxShadow: "0 4px 16px rgba(0,0,0,0.25)",
    }}>
      {label}
      <div style={{
        position: "absolute", right: "100%", top: "50%",
        transform: "translateY(-50%)",
        borderWidth: "5px 6px 5px 0",
        borderStyle: "solid",
        borderColor: "transparent #0f172a transparent transparent",
      }} />
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   NAV LINK ITEM
───────────────────────────────────────────────────────────── */
function NavItem({ to, label, icon, collapsed }) {
  const [hovered, setHovered] = useState(false);

  return (
    <div style={{ position: "relative" }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <NavLink
        to={to}
        style={({ isActive }) => ({
          display: "flex",
          alignItems: "center",
          gap: 10,
          padding: collapsed ? "10px 0" : "9px 12px",
          justifyContent: collapsed ? "center" : "flex-start",
          borderRadius: 9,
          textDecoration: "none",
          color: isActive ? "#6366f1" : "#94a3b8",
          background: isActive
            ? "rgba(99,102,241,0.1)"
            : hovered && !isActive
            ? "rgba(255,255,255,0.04)"
            : "transparent",
          transition: `all ${TOKEN.transitionMs}ms ease`,
          position: "relative",
          overflow: "hidden",
          cursor: "pointer",
          fontFamily: "'DM Sans', system-ui, sans-serif",
        })}
      >
        {({ isActive }) => (
          <>
            {/* Active left bar */}
            {isActive && (
              <span style={{
                position: "absolute", left: 0, top: "20%", bottom: "20%",
                width: 3, borderRadius: "0 3px 3px 0",
                background: "linear-gradient(180deg, #6366f1, #8b5cf6)",
              }} />
            )}

            {/* Icon */}
            <span style={{
              color: isActive ? "#818cf8" : hovered ? "#cbd5e1" : "#64748b",
              flexShrink: 0,
              display: "flex",
              transition: `color ${TOKEN.transitionMs}ms`,
              marginLeft: isActive && !collapsed ? 2 : 0,
            }}>
              {icon}
            </span>

            {/* Label */}
            {!collapsed && (
              <span style={{
                fontSize: 13,
                fontWeight: isActive ? 600 : 500,
                letterSpacing: "-0.01em",
                whiteSpace: "nowrap",
                overflow: "hidden",
                opacity: 1,
              }}>
                {label}
              </span>
            )}
          </>
        )}
      </NavLink>

      {/* Tooltip when collapsed */}
      {collapsed && <Tooltip label={label} visible={hovered} />}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   LOGO MARK
───────────────────────────────────────────────────────────── */
function LogoMark({ size = 32 }) {
  return (
    <div style={{
      width: size, height: size,
      borderRadius: 9,
      background: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)",
      display: "flex", alignItems: "center", justifyContent: "center",
      flexShrink: 0,
      boxShadow: "0 0 0 1px rgba(99,102,241,0.3), 0 4px 12px rgba(99,102,241,0.25)",
    }}>
      <svg width={size * 0.55} height={size * 0.55} viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
      </svg>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   AVATAR
───────────────────────────────────────────────────────────── */
function Avatar({ initials = "AD", size = 32, gradient = false }) {
  return (
    <div style={{
      width: size, height: size,
      borderRadius: gradient ? "50%" : 9,
      background: gradient
        ? "linear-gradient(135deg, #6366f1, #8b5cf6)"
        : "linear-gradient(135deg, #1e2d4a, #1e2a44)",
      border: "1.5px solid rgba(99,102,241,0.35)",
      display: "flex", alignItems: "center", justifyContent: "center",
      fontSize: size * 0.38,
      fontWeight: 700,
      color: gradient ? "white" : "#818cf8",
      flexShrink: 0,
      letterSpacing: "0.02em",
      fontFamily: "'DM Mono', monospace",
      boxShadow: gradient ? "0 0 0 2px rgba(99,102,241,0.25)" : "none",
    }}>
      {initials}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   ICON BUTTON (topbar actions)
───────────────────────────────────────────────────────────── */
function IconButton({ icon, title, badge }) {
  const [hovered, setHovered] = useState(false);
  return (
    <button
      title={title}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        position: "relative",
        width: 34, height: 34,
        borderRadius: 9,
        border: `1px solid ${hovered ? "rgba(255,255,255,0.12)" : "rgba(255,255,255,0.07)"}`,
        background: hovered ? "rgba(255,255,255,0.07)" : "rgba(255,255,255,0.03)",
        display: "flex", alignItems: "center", justifyContent: "center",
        color: hovered ? "#94a3b8" : "#64748b",
        cursor: "pointer",
        transition: `all ${TOKEN.transitionMs}ms ease`,
        outline: "none",
      }}
    >
      {icon}
      {badge && (
        <span style={{
          position: "absolute", top: 6, right: 6,
          width: 7, height: 7,
          borderRadius: "50%",
          background: "#ef4444",
          border: "1.5px solid #0d1117",
        }} />
      )}
    </button>
  );
}

/* ─────────────────────────────────────────────────────────────
   TOGGLE BUTTON  (shared by both sidebar header states)
───────────────────────────────────────────────────────────── */
function ToggleButton({ collapsed, onToggle }) {
  return (
    <button
      onClick={onToggle}
      style={{
        flexShrink: 0,
        width: 28, height: 28,
        borderRadius: 7,
        background: "rgba(255,255,255,0.04)",
        border: "1px solid rgba(255,255,255,0.08)",
        display: "flex", alignItems: "center", justifyContent: "center",
        cursor: "pointer",
        color: "#475569",
        transition: `all ${TOKEN.transitionMs}ms ease`,
        outline: "none",
      }}
      onMouseEnter={e => {
        e.currentTarget.style.background = "rgba(255,255,255,0.09)";
        e.currentTarget.style.color = "#94a3b8";
        e.currentTarget.style.borderColor = "rgba(255,255,255,0.14)";
      }}
      onMouseLeave={e => {
        e.currentTarget.style.background = "rgba(255,255,255,0.04)";
        e.currentTarget.style.color = "#475569";
        e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)";
      }}
      title={collapsed ? "Expandir menú" : "Colapsar menú"}
    >
      {collapsed ? <IconChevronRight /> : <IconChevronLeft />}
    </button>
  );
}

/* ─────────────────────────────────────────────────────────────
   SIDEBAR
───────────────────────────────────────────────────────────── */
function Sidebar({ collapsed, onToggle }) {
  return (
    <aside style={{
      position: "fixed",
      top: 0, left: 0, bottom: 0,
      zIndex: 50,
      width: collapsed ? TOKEN.sidebarCollapsed : TOKEN.sidebarW,
      display: "flex",
      flexDirection: "column",
      background: "#0b0d13",
      borderRight: "1px solid rgba(255,255,255,0.055)",
      transition: `width ${TOKEN.transitionMs}ms cubic-bezier(0.4,0,0.2,1)`,
      overflow: "hidden",
      /* Critical: sidebar must never push into main area */
      willChange: "width",
    }}>

      {/* ── Header: two layouts depending on state ── */}
      {collapsed ? (
        /*
          COLLAPSED STATE
          ───────────────
          Only the expand button, perfectly centered.
          64px wide sidebar has exactly enough room for a 36px button
          with 14px padding on each side. No logo competing for space.
        */
        <div style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          minHeight: TOKEN.headerH,
          borderBottom: "1px solid rgba(255,255,255,0.05)",
          flexShrink: 0,
          padding: "0 14px",
        }}>
          <ToggleButton collapsed={collapsed} onToggle={onToggle} />
        </div>
      ) : (
        /*
          EXPANDED STATE
          ──────────────
          Logo + brand text (flex:1) + collapse button at the right edge.
          248px wide — plenty of room for all three elements.
        */
        <div style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          padding: "0 10px 0 14px",
          minHeight: TOKEN.headerH,
          borderBottom: "1px solid rgba(255,255,255,0.05)",
          flexShrink: 0,
        }}>
          <LogoMark size={34} />
          <div style={{ flex: 1, overflow: "hidden" }}>
            <div style={{
              fontSize: 13, fontWeight: 700,
              color: "#f1f5f9", letterSpacing: "-0.02em",
              whiteSpace: "nowrap",
              fontFamily: "'DM Sans', system-ui, sans-serif",
            }}>
              Admin Panel
            </div>
            <div style={{
              fontSize: 10, fontWeight: 600,
              color: "#334155", letterSpacing: "0.1em",
              textTransform: "uppercase",
              fontFamily: "'DM Mono', monospace",
            }}>
              Gestión · v2.0
            </div>
          </div>
          <ToggleButton collapsed={collapsed} onToggle={onToggle} />
        </div>
      )}

      {/* ── Navigation ── */}
      <nav style={{
        flex: 1,
        overflowY: "auto",
        overflowX: "hidden",
        padding: collapsed ? "12px 8px" : "12px 10px",
        display: "flex",
        flexDirection: "column",
        gap: 2,
        transition: `padding ${TOKEN.transitionMs}ms ease`,
        /* Hide scrollbar visually */
        scrollbarWidth: "none",
        msOverflowStyle: "none",
      }}>
        {NAV_SECTIONS.map((section, si) => (
          <div key={si} style={{ marginBottom: 4 }}>
            {/* Section label */}
            {!collapsed && (
              <div style={{
                fontSize: 9, fontWeight: 700,
                letterSpacing: "0.14em",
                textTransform: "uppercase",
                color: "#2d3c55",
                padding: "8px 12px 4px",
                whiteSpace: "nowrap",
                fontFamily: "'DM Sans', system-ui, sans-serif",
              }}>
                {section.label}
              </div>
            )}
            {collapsed && si > 0 && (
              <div style={{
                height: 1,
                background: "rgba(255,255,255,0.05)",
                margin: "8px 10px",
                borderRadius: 1,
              }} />
            )}
            {section.items.map(item => (
              <NavItem
                key={item.to}
                to={item.to}
                label={item.label}
                icon={item.icon}
                collapsed={collapsed}
              />
            ))}
          </div>
        ))}
      </nav>

      {/* ── User footer ── */}
      <div style={{
        padding: collapsed ? "12px 0" : "12px 12px",
        borderTop: "1px solid rgba(255,255,255,0.055)",
        display: "flex",
        alignItems: "center",
        gap: 10,
        justifyContent: collapsed ? "center" : "flex-start",
        flexShrink: 0,
        transition: `padding ${TOKEN.transitionMs}ms ease`,
      }}>
        <Avatar initials="AD" size={32} />
        {!collapsed && (
          <>
            <div style={{ flex: 1, overflow: "hidden", minWidth: 0 }}>
              <div style={{
                fontSize: 12, fontWeight: 600,
                color: "#cbd5e1",
                overflow: "hidden", textOverflow: "ellipsis",
                whiteSpace: "nowrap",
                fontFamily: "'DM Sans', system-ui, sans-serif",
              }}>
                Admin
              </div>
              <div style={{
                fontSize: 10, color: "#3d5068",
                fontFamily: "'DM Mono', monospace",
                fontWeight: 500,
              }}>
                superadmin
              </div>
            </div>
            <button
              title="Cerrar sesión"
              style={{
                padding: "5px",
                borderRadius: 7,
                background: "transparent",
                border: "none",
                color: "#3d5068",
                cursor: "pointer",
                display: "flex",
                flexShrink: 0,
                transition: `all ${TOKEN.transitionMs}ms ease`,
              }}
              onMouseEnter={e => {
                e.currentTarget.style.color = "#ef4444";
                e.currentTarget.style.background = "rgba(239,68,68,0.1)";
              }}
              onMouseLeave={e => {
                e.currentTarget.style.color = "#3d5068";
                e.currentTarget.style.background = "transparent";
              }}
            >
              <IconLogout />
            </button>
          </>
        )}
      </div>
    </aside>
  );
}

/* ─────────────────────────────────────────────────────────────
   TOPBAR
───────────────────────────────────────────────────────────── */
function Topbar({ breadcrumbs, collapsed, onToggleMobile }) {
  return (
    <header style={{
      position: "sticky",
      top: 0,
      zIndex: 40,
      height: TOKEN.headerH,
      background: "rgba(11,13,19,0.88)",
      backdropFilter: "blur(20px)",
      WebkitBackdropFilter: "blur(20px)",
      borderBottom: "1px solid rgba(255,255,255,0.055)",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      padding: "0 24px",
      flexShrink: 0,
      /* Ensure topbar never bleeds under sidebar */
      width: "100%",
    }}>

      {/* Left: breadcrumb */}
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        {/* Mobile hamburger */}
        <button
          onClick={onToggleMobile}
          style={{
            display: "none",
            width: 32, height: 32,
            border: "none",
            background: "transparent",
            color: "#64748b",
            cursor: "pointer",
            borderRadius: 7,
            alignItems: "center",
            justifyContent: "center",
          }}
          className="mobile-menu-btn"
        >
          <IconMenu />
        </button>

        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb" style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{
            fontSize: 12, color: "#3d5068", fontWeight: 500,
            fontFamily: "'DM Sans', system-ui, sans-serif",
          }}>
            Admin
          </span>
          {breadcrumbs.slice(1).map((crumb, i) => (
            <span key={i} style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#1e2d40" strokeWidth="2" strokeLinecap="round">
                <path d="M9 18l6-6-6-6"/>
              </svg>
              <span style={{
                fontSize: 13, fontWeight: 600, color: "#94a3b8",
                letterSpacing: "-0.01em",
                fontFamily: "'DM Sans', system-ui, sans-serif",
              }}>
                {crumb}
              </span>
            </span>
          ))}
        </nav>
      </div>

      {/* Right: avatar only */}
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        {/* Avatar */}
        <Avatar initials="A" size={34} gradient />
      </div>
    </header>
  );
}

/* ─────────────────────────────────────────────────────────────
   MOBILE OVERLAY
───────────────────────────────────────────────────────────── */
function MobileOverlay({ visible, onClick }) {
  if (!visible) return null;
  return (
    <div
      onClick={onClick}
      style={{
        position: "fixed", inset: 0,
        background: "rgba(0,0,0,0.6)",
        backdropFilter: "blur(4px)",
        zIndex: 45,
        display: "none", /* shown via media query */
      }}
      className="mobile-overlay"
    />
  );
}

/* ─────────────────────────────────────────────────────────────
   GLOBAL STYLES  (minimal — only what Tailwind can't do cleanly)
───────────────────────────────────────────────────────────── */
const GLOBAL_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;1,9..40,400&family=DM+Mono:wght@400;500&display=swap');

  *, *::before, *::after { box-sizing: border-box; }

  body {
    margin: 0;
    background: #f1f5f9;
    color: #1e293b;
    font-family: 'DM Sans', system-ui, sans-serif;
    -webkit-font-smoothing: antialiased;
  }

  /* Scrollbar — sidebar */
  nav::-webkit-scrollbar { width: 0; }

  /* Mobile responsive */
  @media (max-width: 768px) {
    .mobile-menu-btn  { display: flex !important; }
    .mobile-overlay   { display: block !important; }
    .admin-sidebar    { transform: translateX(-100%) !important; }
    .admin-sidebar.mobile-open { transform: translateX(0) !important; }
    .admin-main       { margin-left: 0 !important; }
  }

  /* Page content animation */
  @keyframes fadeSlideIn {
    from { opacity: 0; transform: translateY(6px); }
    to   { opacity: 1; transform: translateY(0); }
  }

  .page-enter {
    animation: fadeSlideIn 0.22s ease forwards;
  }

  /* Global scrollbar */
  ::-webkit-scrollbar        { width: 4px; height: 4px; }
  ::-webkit-scrollbar-track  { background: transparent; }
  ::-webkit-scrollbar-thumb  { background: #cbd5e1; border-radius: 99px; }
  ::-webkit-scrollbar-thumb:hover { background: #94a3b8; }
`;

/* ─────────────────────────────────────────────────────────────
   ROOT LAYOUT
───────────────────────────────────────────────────────────── */
export default function AdminLayout() {
  const [collapsed, setCollapsed]         = useState(false);
  const [mobileOpen, setMobileOpen]       = useState(false);
  const breadcrumbs                        = useBreadcrumbs();
  const { pathname }                       = useLocation();
  const prevPathRef                        = useRef(pathname);
  const [pageKey, setPageKey]              = useState(0);

  /* Re-trigger page animation on route change */
  useEffect(() => {
    if (pathname !== prevPathRef.current) {
      prevPathRef.current = pathname;
      setPageKey(k => k + 1);
      setMobileOpen(false); /* close mobile menu on navigate */
    }
  }, [pathname]);

  /* Close mobile menu on Escape */
  useEffect(() => {
    const handler = (e) => { if (e.key === "Escape") setMobileOpen(false); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  const sidebarWidth = collapsed ? TOKEN.sidebarCollapsed : TOKEN.sidebarW;

  return (
    <>
      <style>{GLOBAL_CSS}</style>

      {/*
        ROOT CONTAINER
        ─────────────
        height: 100vh, overflow: hidden prevents double scrollbar.
        The main area handles its own scroll.
      */}
      <div style={{
        display: "flex",
        height: "100vh",
        overflow: "hidden",
        background: "#f1f5f9",
      }}>

        {/* ── SIDEBAR ── */}
        <Sidebar
          collapsed={collapsed}
          onToggle={() => setCollapsed(c => !c)}
        />

        {/* ── MOBILE OVERLAY ── */}
        <MobileOverlay
          visible={mobileOpen}
          onClick={() => setMobileOpen(false)}
        />

        {/*
          MAIN COLUMN
          ──────────
          margin-left = sidebar width (synced via CSS var and transition)
          flex-direction: column so header + content stack naturally.
          overflow-y: auto makes ONLY this column scroll — not the whole page.

          This is the key fix: the sidebar is `position:fixed`,
          so the main area must manually offset itself with margin-left.
          We transition it in sync with the sidebar width change.
        */}
        <main
          className="admin-main"
          style={{
            marginLeft: sidebarWidth,
            flex: 1,
            display: "flex",
            flexDirection: "column",
            height: "100vh",
            overflow: "hidden",
            transition: `margin-left ${TOKEN.transitionMs}ms cubic-bezier(0.4,0,0.2,1)`,
            /* Prevent content from bleeding under sidebar on fast resize */
            minWidth: 0,
          }}
        >
          {/* ── TOPBAR ── */}
          <Topbar
            breadcrumbs={breadcrumbs}
            collapsed={collapsed}
            onToggleMobile={() => setMobileOpen(o => !o)}
          />

          {/*
            SCROLLABLE CONTENT AREA
            ───────────────────────
            flex: 1 fills remaining height below topbar.
            overflow-y: auto is the ONLY place scrolling happens.
            This guarantees:
              - Topbar stays pinned at top ✓
              - Sidebar stays pinned at left ✓
              - Content scrolls independently ✓
              - No double scrollbars ✓
          */}
          <div
            key={pageKey}
            className="page-enter"
            style={{
              flex: 1,
              overflowY: "auto",
              overflowX: "hidden",
              background: "#f1f5f9",
              padding: 0,
            }}
          >
            <AdminToastProvider>
              <Outlet />
            </AdminToastProvider>
          </div>
        </main>
      </div>
    </>
  );
}