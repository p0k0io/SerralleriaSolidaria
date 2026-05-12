import { Link } from "react-router-dom"
import { LockBgIcon, ChatIcon, ArrowRightIcon } from "./icons"

const TAGS = ["Medidas especiales", "Instalación urgente", "Presupuesto gratis"]

export default function CTABanner() {
  return (
    <div className="relative mb-7 bg-white border border-orange-100 rounded-2xl px-5 py-4 flex items-center justify-between gap-4 overflow-hidden shadow-[0_1px_4px_rgba(0,0,0,0.04)]">
      <LockBgIcon />
      <div className="flex items-center gap-4 z-10 min-w-0">
        <div className="w-9 h-9 rounded-xl bg-orange-50 border border-orange-100 flex items-center justify-center flex-shrink-0">
          <ChatIcon />
        </div>
        <div className="min-w-0">
          <h2 className="text-[13px] font-bold text-slate-800">¿No encuentras lo que buscas?</h2>
          <p className="text-[12px] text-slate-400 mt-0.5">Pídenos cualquier cerradura, medida o instalación a medida.</p>
          <div className="flex gap-1.5 mt-2 flex-wrap">
            {TAGS.map((tag) => (
              <span key={tag} className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-orange-50 text-orange-600 border border-orange-100">
                {tag}
              </span>
            ))}
          </div>
        </div>
      </div>
      <Link
        to="/solicitud"
        className="z-10 flex-shrink-0 flex items-center gap-1.5 bg-orange-500 hover:bg-orange-600 active:scale-[0.98] text-white text-[13px] font-semibold px-4 py-2.5 rounded-xl transition-all duration-150 shadow-sm shadow-orange-200"
      >
        Solicitar
        <ArrowRightIcon />
      </Link>
    </div>
  )
}
