import { ChevronDownIcon } from "./icons"

export default function FilterSelect({ value, onChange, options, placeholder }) {
  const hasValue = value !== ""
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`appearance-none h-[42px] pl-3 pr-8 text-sm rounded-xl border transition-all outline-none cursor-pointer
          ${hasValue
            ? "bg-orange-500 border-orange-500 text-white font-semibold"
            : "bg-white border-slate-200 text-slate-600 hover:border-orange-300 focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
          }`}
      >
        <option value="">{placeholder}</option>
        {options.map((o) => (
          <option key={o.value ?? o} value={o.value ?? o}>{o.label ?? o}</option>
        ))}
      </select>
      <div className={`pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 ${hasValue ? "text-white" : "text-slate-400"}`}>
        <ChevronDownIcon />
      </div>
    </div>
  )
}