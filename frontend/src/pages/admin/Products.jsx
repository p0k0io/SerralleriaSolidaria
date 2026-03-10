import ShowProducts from "../../components/ShowProducts";
import CreateProduct from "../../components/CreateProduct";

export default function Products(){

    return(
        <div className="p-6 space-y-6">
            <h1 className="text-2xl font-semibold text-slate-800">Productos</h1>

            <ShowProducts />
            <CreateProduct />
        </div>
    );
}