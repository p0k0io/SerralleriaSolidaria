import { Outlet, NavLink } from "react-router-dom";
import { useState } from "react";

/* ── Icons (igual que los tuyos) ── */
function Dashboard({ size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <rect x="3" y="3" width="7" height="7" rx="1.5" />
      <rect x="14" y="3" width="7" height="7" rx="1.5" />
      <rect x="3" y="14" width="7" height="7" rx="1.5" />
      <rect x="14" y="14" width="7" height="7" rx="1.5" />
    </svg>
  );
}
function Package({ size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M21 16V8l-9-5-9 5v8l9 5 9-5z" />
    </svg>
  );
}
function BookStack({ size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
    </svg>
  );
}
function Tag({ size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M20 13l-7 7-9-9V2h9l7 11z" />
    </svg>
  );
}
function MenuIcon({ collapsed }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
      <line x1="4" y1="6" x2="20" y2="6" />
      <line x1={collapsed ? "4" : "8"} y1="12" x2="20" y2="12" />
      <line x1={collapsed ? "4" : "12"} y1="18" x2="20" y2="18" />
    </svg>
  );
}

/* ── Nav config ── */
const navItems = [
  { to: "/admin/dashboard", label: "Dashboard", icon: Dashboard },
  { to: "/admin/products", label: "Productos", icon: Package },
  { to: "/admin/packs", label: "Packs", icon: BookStack },
  { to: "/admin/categories", label: "Categorías", icon: Tag },
  { to: "/admin/requests", label: "Solicitudes", icon: BookStack },
  { to: "/admin/atributos", label: "Atributos", icon: Tag },
];

/* ── Layout ── */
export default function AdminLayout() {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <>
      <style>{`
        body { margin: 0; }

        .root {
          display: flex;
          min-height: 100vh;
          font-family: Inter, system-ui, sans-serif;
          background: #f6f8fb;
        }

        /* SIDEBAR */
        .sidebar {
          width: ${collapsed ? "70px" : "250px"};
          background: rgba(15, 23, 42, 0.9);
          backdrop-filter: blur(12px);
          color: white;
          transition: all .25s ease;
          display: flex;
          flex-direction: column;
          border-right: 1px solid rgba(255,255,255,0.05);
        }

        .header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 18px;
        }{ to: "/admin/cart", label: "Carrito", icon: Package }, 
];

        .logo {
          font-weight: 700;
          font-size: 14px;
          opacity: ${collapsed ? 0 : 1};
          transition: .2s;
        }

        .toggle {
          cursor: pointer;
          opacity: .7;
        }

        .nav {
          padding: 10px;
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .link {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 10px;
          border-radius: 10px;
          color: rgba(255,255,255,.6);
          text-decoration: none;
          transition: all .2s ease;
          position: relative;
        }

        .link:hover {
          background: rgba(255,255,255,.06);
          color: white;
          transform: translateX(2px);
        }

        .link.active {
          background: rgba(99,102,241,.15);
          color: white;
        }

        .link.active::before {
          content: "";
          position: absolute;
          left: 0;
          width: 3px;
          height: 60%;
          background: #6366f1;
          border-radius: 4px;
        }

        .label {
          display: ${collapsed ? "none" : "inline"};
        }

        /* MAIN */
        .main {
          flex: 1;
          display: flex;
          flex-direction: column;
        }

        .topbar {
          height: 60px;
          background: rgba(255,255,255,0.7);
          backdrop-filter: blur(10px);
          border-bottom: 1px solid #eee;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 20px;
        }

        .title {
          font-weight: 600;
        }

        .avatar {
          width: 36px;
          height: 36px;
          border-radius: 10px;
          background: linear-gradient(135deg,#6366f1,#8b5cf6);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: bold;
        }

        .content {
          padding: 24px;
        }
      `}</style>

      <div className="root">
        <aside className="sidebar">

          <div className="header">
            <div className="logo">Admin Panel</div>
            <div className="toggle" onClick={() => setCollapsed(!collapsed)}>
              <MenuIcon collapsed={collapsed} />
            </div>
          </div>

          <nav className="nav">
            {navItems.map(({ to, label, icon: Icon }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) => `link ${isActive ? "active" : ""}`}
              >
                <Icon />
                <span className="label">{label}</span>
              </NavLink>
            ))}
          </nav>

        </aside>

        <div className="main">
          <div className="topbar">
            <div className="title">Panel de Administración</div>
            <div className="avatar">A</div>
          </div>

          <div className="content">
            <Outlet />
          </div>
        </div>
      </div>
    </>
  );
}