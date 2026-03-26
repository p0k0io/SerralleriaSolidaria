import Card from "./Card";
import Item from "./Item";
import Empty from "./Empty";

export default function LowStock({ products }) {
  return (
    <Card title="PRODUCTOS CON POCO STOCK">
      {products.length === 0 ? (
        <Empty text="Sin productos con bajo stock" />
      ) : (
        products.map((p) => (
          <Item
            key={p.id}
            title={p.name}
            subtitle={`SKU: ${p.sku}`}
            qty={p.stock}
          />
        ))
      )}
    </Card>
  );
}