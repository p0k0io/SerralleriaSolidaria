import { useState } from "react";
import { ShowCategories } from "../../components/categories/ShowCategories";
import CreateCategory from "../../components/categories/CreateCategory";

export default function Categories() {
  const [refreshCategories, setRefreshCategories] = useState(false);

  return (
    <div className="p-6 space-y-3">
      <h1 className="text-2xl font-bold text-slate-800 mb-2">Categorías</h1>
      <CreateCategory onCreated={() => setRefreshCategories((prev) => !prev)} />
      <ShowCategories refreshSignal={refreshCategories} />
    </div>
  );
}