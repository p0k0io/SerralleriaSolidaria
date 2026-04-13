export default function Information() {
  return (
    <div>
      {/* Hero */}
      <div className="mb-8">
        <div className="flex items-center gap-2.5 mb-3">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#f97316" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/>
          </svg>
          <span className="text-xs font-semibold bg-amber-100 text-amber-700 px-3 py-1 rounded-full">Serralleria Solidaria</span>
        </div>
        <h1 className="text-2xl font-extrabold text-slate-800 tracking-tight">Información de la tienda</h1>
        <p className="text-slate-400 text-sm mt-1 leading-relaxed max-w-xl">
          Especialistas en soluciones de seguridad para puertas, cerraduras y accesos residenciales y comerciales.
        </p>
      </div>

      {/* Grid principal */}
      <div className="grid gap-4 lg:grid-cols-2 mb-4">

        {/* Sobre nosotros */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
          <div className="w-9 h-9 rounded-xl bg-amber-50 flex items-center justify-center mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#92400e" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
            </svg>
          </div>
          <h2 className="text-base font-bold text-slate-800 mb-3">Sobre nosotros</h2>
          <p className="text-sm text-slate-500 leading-relaxed">
            Serralleria Solidaria nació para ofrecer cerraduras y sistemas de seguridad confiables a personas y negocios.
            Nuestro equipo asesora en la elección del mejor producto según tus necesidades, desde bombines y cerraduras
            hasta escudos protectores y cerrojos.
          </p>
          <p className="text-sm text-slate-500 leading-relaxed mt-3">
            Trabajamos con materiales de calidad y marcas reconocidas para garantizar resistencia y durabilidad.
            También ofrecemos instalación y mantenimiento cuando lo necesitas.
          </p>
        </div>

        {/* Propietario */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
          <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#1e40af" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/>
            </svg>
          </div>
          <h2 className="text-base font-bold text-slate-800 mb-4">Propietario</h2>

          {/* Stats */}
          <div className="flex gap-3 mb-4">
            <div className="flex-1 bg-slate-50 rounded-xl p-3">
              <p className="text-xl font-extrabold text-orange-500">15+</p>
              <p className="text-[10px] text-slate-400 mt-0.5 uppercase tracking-wide">años de experiencia</p>
            </div>
            <div className="flex-1 bg-slate-50 rounded-xl p-3">
              <p className="text-xl font-extrabold text-orange-500">1000+</p>
              <p className="text-[10px] text-slate-400 mt-0.5 uppercase tracking-wide">clientes atendidos</p>
            </div>
          </div>

          <div className="space-y-0 divide-y divide-slate-100">
            {[
              { label: "Nombre",  value: "Juan Pérez" },
              { label: "Cargo",   value: "Cerrajero principal y gerente" },
              { label: "Teléfono", value: "+34 600 123 456", accent: true },
              { label: "Correo",   value: "contacto@serralleriasolidaria.com", accent: true, small: true },
            ].map(({ label, value, accent, small }) => (
              <div key={label} className="flex items-baseline gap-3 py-2.5">
                <span className="text-[11px] text-slate-400 w-20 shrink-0">{label}</span>
                <span className={`${small ? "text-xs" : "text-sm"} ${accent ? "text-blue-600" : "text-slate-700"} font-medium`}>
                  {value}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">

        {/* Qué ofrecemos */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
          <div className="w-9 h-9 rounded-xl bg-emerald-50 flex items-center justify-center mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#065f46" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/>
            </svg>
          </div>
          <h2 className="text-base font-bold text-slate-800 mb-4">Qué ofrecemos</h2>
          <ul className="space-y-2.5">
            {[
              "Bombines, cerraduras, escudos protectores y cerraduras de embutir.",
              "Asesoría personalizada para escoger el producto ideal.",
              "Repuestos, accesorios y mantenimiento preventivo.",
              "Instalación profesional y servicio técnico de confianza.",
              "Atención rápida y soporte local.",
            ].map((item) => (
              <li key={item} className="flex items-start gap-2.5">
                <span className="mt-2 w-1.5 h-1.5 rounded-full bg-orange-400 shrink-0" />
                <span className="text-sm text-slate-500 leading-relaxed">{item}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Horario y ubicación */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
          <div className="w-9 h-9 rounded-xl bg-amber-50 flex items-center justify-center mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#92400e" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
            </svg>
          </div>
          <h2 className="text-base font-bold text-slate-800 mb-4">Horario y ubicación</h2>

          <div className="space-y-0 divide-y divide-slate-100 mb-4">
            {[
              { day: "Lun – Vie", time: "09:00 – 19:00", open: true },
              { day: "Sábado",    time: "10:00 – 14:00", open: true },
              { day: "Domingo",   time: "Cerrado",        open: false },
            ].map(({ day, time, open }) => (
              <div key={day} className="flex items-center justify-between py-2.5">
                <span className="text-xs text-slate-400 w-24">{day}</span>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-slate-700 font-medium">{time}</span>
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                    open ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-400"
                  }`}>
                    {open ? "abierto" : "cerrado"}
                  </span>
                </div>
              </div>
            ))}
          </div>

          <div className="pt-4 border-t border-slate-100 flex gap-2.5 items-start">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="text-slate-400 mt-0.5 shrink-0">
              <path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/>
            </svg>
            <div>
              <p className="text-sm text-slate-700 font-medium">Calle de la Seguridad, 23, 28001 Madrid</p>
              <p className="text-xs text-slate-400 mt-1">A 2 minutos caminando de Puerta del Sol · Autobús cercano</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
