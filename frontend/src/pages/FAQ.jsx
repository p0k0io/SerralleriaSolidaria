const faqs = [
  {
    q: "¿Qué tipos de cerraduras venden?",
    a: "Ofrecemos bombines, cerraduras de embutir, escudos protectores, cerrojos y accesorios de seguridad. Todos nuestros productos están pensados para puertas residenciales y comerciales.",
  },
  {
    q: "¿Realizan instalaciones a domicilio?",
    a: "Sí. Además de la venta, ofrecemos servicio de instalación y montaje profesional en la zona. Podemos coordinar la visita según tu disponibilidad.",
  },
  {
    q: "¿Tienen garantía los productos?",
    a: "Trabajamos con marcas confiables y brindamos garantía sobre los productos según las condiciones del fabricante. También ofrecemos soporte postventa para cualquier consulta.",
  },
  {
    q: "¿Puedo comprar online y recoger en tienda?",
    a: "Sí, puedes gestionar tu pedido en línea y pasar a recogerlo en nuestra tienda en el horario establecido. También ofrecemos envíos locales en algunos casos.",
  },
  {
    q: "¿Cómo contacto para urgencias?",
    a: (
      <>
        Para emergencias y atención rápida, utiliza nuestro teléfono{" "}
        <span className="text-blue-600 font-medium">+34 600 123 456</span> o escríbenos a{" "}
        <span className="text-blue-600 font-medium">contacto@serralleriasolidaria.com</span>.
      </>
    ),
  },
]

export default function FAQ() {
  return (
    <div>
      {/* Hero */}
      <div className="mb-8">
        <div className="flex items-center gap-2.5 mb-3">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#f97316" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/>
          </svg>
          <span className="text-xs font-semibold bg-amber-100 text-amber-700 px-3 py-1 rounded-full">
            {faqs.length} preguntas frecuentes
          </span>
        </div>
        <h1 className="text-2xl font-extrabold text-slate-800 tracking-tight">Preguntas frecuentes</h1>
        <p className="text-slate-400 text-sm mt-1 leading-relaxed max-w-xl">
          Respuestas rápidas a las dudas más comunes sobre nuestros productos y servicios de cerrajería.
        </p>
      </div>

      {/* Lista de FAQs */}
      <div className="flex flex-col gap-3">
        {faqs.map(({ q, a }, i) => (
          <div
            key={i}
            className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 flex gap-4 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
          >
            {/* Número */}
            <div className="w-7 h-7 rounded-full bg-amber-50 flex items-center justify-center shrink-0 mt-0.5">
              <span className="text-[11px] font-bold text-amber-700">{i + 1}</span>
            </div>

            {/* Contenido */}
            <div className="flex-1">
              <h2 className="text-sm font-bold text-slate-800 mb-2 leading-snug">{q}</h2>
              <p className="text-sm text-slate-500 leading-relaxed">{a}</p>
            </div>
          </div>
        ))}
      </div>

      {/* CTA contacto */}
      <div className="mt-6 bg-orange-50 border border-orange-100 rounded-2xl p-5 flex items-start gap-4">
        <div className="w-9 h-9 rounded-xl bg-orange-100 flex items-center justify-center shrink-0">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#c2410c" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.06 9.18 19.79 19.79 0 0 0 .06 .5a2 2 0 012-2.18h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"/>
          </svg>
        </div>
        <div>
          <p className="text-sm font-bold text-orange-800 mb-0.5">¿No encuentras tu respuesta?</p>
          <p className="text-sm text-orange-700 leading-relaxed">
            Contáctanos directamente en{" "}
            <span className="font-semibold">+34 600 123 456</span> o en{" "}
            <span className="font-semibold">contacto@serralleriasolidaria.com</span>. Estaremos encantados de ayudarte.
          </p>
        </div>
      </div>
    </div>
  )
}
