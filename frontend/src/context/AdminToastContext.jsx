import { createContext, useContext, useCallback, useState } from "react"

const AdminToastContext = createContext(null)

export function AdminToastProvider({ children }) {
  const [toasts, setToasts] = useState([])

  const showToast = useCallback((msg, type = "success") => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2)}`
    setToasts((prev) => [...prev, { id, msg, type }])
    window.setTimeout(() => setToasts((prev) => prev.filter((toast) => toast.id !== id)), 3200)
  }, [])

  return (
    <AdminToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed top-4 right-4 z-50 flex flex-col gap-3 max-w-sm">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`rounded-2xl border px-4 py-3 shadow-lg shadow-slate-200/70 transition-all ${
              toast.type === "error"
                ? "bg-red-50 border-red-200 text-red-700"
                : "bg-emerald-50 border-emerald-200 text-emerald-700"
            }`}
          >
            <p className="text-sm leading-snug">{toast.msg}</p>
          </div>
        ))}
      </div>
    </AdminToastContext.Provider>
  )
}

export function useAdminToast() {
  const ctx = useContext(AdminToastContext)
  if (!ctx) throw new Error("useAdminToast debe usarse dentro de <AdminToastProvider>")
  return ctx
}
