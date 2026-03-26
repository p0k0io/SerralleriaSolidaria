import Card from "./Card";
import Item from "./Item";
import Empty from "./Empty";

export default function TopProducts({ products }) {
  return (
    <Card title="Productos más Comprados esta semana">
      {products.length === 0 ? (
        <Empty text="Sin datos todavía" />
      ) : (
        <div className="grid grid-cols-2 gap-4">
          {products.map((p) => (
            <Item
              key={p.id}
              title={p.name}
              subtitle={`SKU: ${p.sku}`}
              qty={p.stock}
            />
          ))}
        </div>
      )}
    </Card>
  );
}