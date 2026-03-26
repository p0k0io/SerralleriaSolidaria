export default function Card({ title, children }) {
  return (
    <div className="bg-white rounded-2xl shadow p-5">
      <h2 className="text-center font-semibold mb-4 text-sm">
        {title}
      </h2>
      <div className="space-y-2">{children}</div>
    </div>
  );
}