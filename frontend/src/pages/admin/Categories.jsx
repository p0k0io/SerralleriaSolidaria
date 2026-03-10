import { useState } from "react";
import { ShowCategories } from "../../components/categories/ShowCategories";
import CreateCategory from "../../components/categories/CreateCategory";
import EditCategory from "../../components/categories/EditCategory";
import DeleteCategory from "../../components/categories/DeleteCategory";

export default function Categories() {
  const [createOpen, setCreateOpen] = useState(false);
  const [editCategoryId, setEditCategoryId] = useState(null);
  const [deleteCategoryId, setDeleteCategoryId] = useState(null);
  const [showList, setShowList] = useState(true); // controla si se ve el listado

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Categorías</h1>

      {/* Botón para crear categoría */}
      <button
        onClick={() => setCreateOpen(true)}
        className="mb-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-500"
      >
        Crear categoría
      </button>

      {/* Botón opcional para mostrar/ocultar listado */}
      <button
        onClick={() => setShowList(!showList)}
        className="mb-4 ml-4 bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-500"
      >
        {showList ? "Ocultar listado" : "Mostrar listado"}
      </button>

      {/* Listado de categorías */}
      {showList && (
        <ShowCategories
          onEdit={(id) => setEditCategoryId(id)}
          onDelete={(id) => setDeleteCategoryId(id)}
        />
      )}

      {/* Formularios */}
      {createOpen && <CreateCategory onClose={() => setCreateOpen(false)} />}
      {editCategoryId && (
        <EditCategory
          categoryId={editCategoryId}
          onClose={() => setEditCategoryId(null)}
        />
      )}
      {deleteCategoryId && (
        <DeleteCategory
          categoryId={deleteCategoryId}
          onDelete={() => setDeleteCategoryId(null)}
        />
      )}
    </div>
  );
}