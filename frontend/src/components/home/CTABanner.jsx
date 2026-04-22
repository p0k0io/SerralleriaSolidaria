import { Link } from "react-router-dom"
import { LockBgIcon, ChatIcon, ArrowRightIcon } from "./icons"

const TAGS = ["Medidas especiales", "Instalación urgente", "Presupuesto gratis"]

export default function CTABanner() {
  return (
    <div className="relative mb-8 bg-white border border-orange-200 rounded-2xl p-5 flex items-center justify-between gap-4 overflow-hidden">
      <LockBgIcon />
      <div className="flex items-center gap-4 z-10">
        <div className="w-10 h-10 rounded-xl bg-orange-50 border border-orange-100 flex items-center justify-center flex-shrink-0">
          <ChatIcon />
        </div>
        <div>
          <h2 className="text-sm font-extrabold text-slate-800 mb-0.5">¿No encuentras lo que buscas?</h2>
          <p className="text-xs text-slate-500">Pídenos cualquier cerradura, medida o instalación a medida.</p>
          <div className="flex gap-1.5 mt-2 flex-wrap">
            {TAGS.map((tag) => (
              <span key={tag} className="text-xs font-medium px-2 py-0.5 rounded-full bg-orange-50 text-orange-700 border border-orange-100">{tag}</span>
            ))}
          </div>
        </div>
      </div>
      <Link to="/solicitud" className="z-10 flex-shrink-0 flex items-center gap-1.5 bg-orange-500 text-white text-sm font-semibold px-4 py-2.5 rounded-xl hover:bg-orange-600 transition">
        Solicitar
        <ArrowRightIcon />
      </Link>
    </div>
  )
}