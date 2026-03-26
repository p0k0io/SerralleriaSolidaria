import Card from "./Card";
import Item from "./Item";
import Empty from "./Empty";

export default function UrgentOrders({ orders }) {
  return (
    <Card title="PEDIDOS URGENTES">
      {orders.length === 0 ? (
        <Empty text="Sin pedidos aún" />
      ) : (
        orders.map((o) => (
          <Item key={o.id} title={`${o.name} - ${o.date}`} />
        ))
      )}
    </Card>
  );
}