import { useState, useEffect, useMemo } from "react"
import ProductDetail from "./ProductDetail.jsx"
import { getActiveProducts, getFeaturedProducts } from "../components/home/api"
import { loadCart } from "../components/home/cartUtils"
import FeaturedCarousel from "../components/home/FeaturedCarousel"
import ProductsToolbar from "../components/home/ProductsToolbar"
import CTABanner from "../components/home/CTABanner"
import ProductsGrid from "../components/home/ProductsGrid"

export { CART_KEY } from "../components/home/constants"

export default function Home() {
  const [allGrouped, setAllGrouped]           = useState({})
  const [featured, setFeatured]               = useState([])
  const [loading, setLoading]                 = useState(true)
  const [cols, setCols]                       = useState(3)
  const [cart, setCart]                       = useState(loadCart)
  const [search, setSearch]                   = useState("")
  const [categoryFilter, setCategoryFilter]   = useState("")
  const [stockFilter, setStockFilter]         = useState("")
  const [attributeTypeFilter, setAttrFilter]  = useState("")
  const [detail, setDetail]                   = useState(null)

  useEffect(() => {
    Promise.all([getFeaturedProducts(), getActiveProducts()]).then(([feat, active]) => {
      setFeatured(feat)
      setAllGrouped(active)
      setLoading(false)
    })
  }, [])

  // Categorías únicas
  const categories = useMemo(() => {
    const cats = new Set()
    Object.values(allGrouped).forEach((variants) => {
      variants.forEach((v) => { if (v.product?.category?.name) cats.add(v.product.category.name) })
    })
    return Array.from(cats).sort()
  }, [allGrouped])

  // Tipos de atributo únicos
  const attributeTypes = useMemo(() => {
    const types = new Set()
    Object.values(allGrouped).forEach((variants) => {
      variants.forEach((v) => { (v.attributes || []).forEach((a) => { if (a.type) types.add(a.type) }) })
    })
    return Array.from(types).sort()
  }, [allGrouped])

  // Filtrado local
  const entries = useMemo(() => {
    return Object.entries(allGrouped).filter(([name, variants]) => {
      if (search && !name.toLowerCase().includes(search.toLowerCase())) {
        const skuMatch = variants.some((v) => (v.sku ?? "").toLowerCase().includes(search.toLowerCase()))
        if (!skuMatch) return false
      }
      if (categoryFilter && !variants.some((v) => v.product?.category?.name === categoryFilter)) return false
      if (attributeTypeFilter && !variants.some((v) => (v.attributes || []).some((a) => a.type === attributeTypeFilter))) return false
      if (stockFilter && !variants.some((v) => v.stock_status === stockFilter)) return false
      return true
    })
  }, [allGrouped, search, categoryFilter, attributeTypeFilter, stockFilter])

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" })
  }, [detail])

  if (detail) {
    return <ProductDetail name={detail.name} variants={detail.variants} onBack={() => setDetail(null)} />
  }

  const hasFilters = !!(categoryFilter || attributeTypeFilter || stockFilter)
  function clearFilters() { setCategoryFilter(""); setAttrFilter(""); setStockFilter("") }
  function handleViewDetail(name, variants) { setDetail({ name, variants }) }

  return (
    <div>
      {!loading && (
        <FeaturedCarousel
          featured={featured}
          cart={cart}
          setCart={setCart}
          onViewDetail={handleViewDetail}
        />
      )}

      <div className="mb-5">
        <h1 className="text-2xl font-extrabold text-slate-800 tracking-tight">Productos</h1>
        <p className="text-slate-400 text-sm mt-0.5">{entries.length} productos disponibles</p>
      </div>

      <ProductsToolbar
        search={search}                       setSearch={setSearch}
        stockFilter={stockFilter}             setStockFilter={setStockFilter}
        categoryFilter={categoryFilter}       setCategoryFilter={setCategoryFilter}
        attributeTypeFilter={attributeTypeFilter} setAttrFilter={setAttrFilter}
        categories={categories}
        attributeTypes={attributeTypes}
        cols={cols}                           setCols={setCols}
        hasFilters={hasFilters}
        clearFilters={clearFilters}
      />

      <CTABanner />

      <ProductsGrid
        loading={loading}
        entries={entries}
        cols={cols}
        cart={cart}
        setCart={setCart}
        onViewDetail={handleViewDetail}
        hasFilters={hasFilters}
        clearFilters={clearFilters}
      />
    </div>
  )
}