export default function Item({ title, subtitle, qty }) {
  return (
    <div className="bg-gray-100 rounded-xl px-4 py-3 flex justify-between">
      <div>
        <p className="font-medium text-sm">{title}</p>
        {subtitle && (
          <p className="text-xs text-gray-400">{subtitle}</p>
        )}
      </div>

      {qty !== undefined && (
        <span className={qty < 10 ? "text-red-500" : "text-gray-700"}>
          {qty}
        </span>
      )}
    </div>
  );
}