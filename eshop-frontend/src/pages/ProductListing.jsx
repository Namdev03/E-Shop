import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useSearchParams } from "react-router";
import { SlidersHorizontal, X } from "lucide-react";
import { fetchProducts } from "../redux/slices/productSlice.js";
import { ProductCard } from "../components/ProductCard.jsx";
import { ProductGridSkeleton } from "../components/ProductSkeleton.jsx";
import { EmptyState } from "../components/EmptyState.jsx";
import { Pagination } from "../components/Pagination.jsx";
import { FilterSidebar } from "../components/FilterSidebar.jsx";

const SORT_OPTIONS = [
  { value: "newest", label: "Newest" },
  { value: "price_low_high", label: "Price: Low to High" },
  { value: "price_high_low", label: "Price: High to Low" },
  { value: "rating", label: "Highest Rating" },
  { value: "best_selling", label: "Best Selling" },
  { value: "popularity", label: "Most Popular" },
];

export function ProductListing() {
  const dispatch = useDispatch();
  const [searchParams] = useSearchParams();
  const { list, pagination, loading } = useSelector((state) => state.product);

  const [filters, setFilters] = useState({
    q: searchParams.get("q") || "",
    flashSale: searchParams.get("flashSale") || "",
    featured: searchParams.get("featured") || "",
    trending: searchParams.get("trending") || "",
    newArrivals: searchParams.get("newArrivals") || "",
    bestSellers: searchParams.get("bestSellers") || "",
    sort: "newest",
    page: 1,
  });
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  useEffect(() => {
    dispatch(fetchProducts(filters));
  }, [dispatch, filters]);

  const handleFilterChange = (next) => setFilters({ ...next, page: 1 });
  const handleClearFilters = () => setFilters({ q: filters.q, sort: filters.sort, page: 1 });
  const handlePageChange = (page) => {
    setFilters((f) => ({ ...f, page }));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="mx-auto max-w-7xl px-6 py-8 lg:px-8">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-[#101828] sm:text-2xl">
            {filters.q ? `Results for "${filters.q}"` : "All Products"}
          </h1>
          <p className="mt-1 text-sm text-gray-500">{pagination.total} products found</p>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={filters.sort}
            onChange={(e) => setFilters((f) => ({ ...f, sort: e.target.value, page: 1 }))}
            className="rounded-lg border border-[#E5E7EB] px-3 py-2 text-sm outline-none focus:border-[#C81E5C]"
          >
            {SORT_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>

          <button
            onClick={() => setMobileFiltersOpen(true)}
            className="flex items-center gap-2 rounded-full border border-[#E5E7EB] px-4 py-2 text-sm font-medium text-[#101828] lg:hidden"
          >
            <SlidersHorizontal size={16} /> Filters
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-8 lg:flex-row">
        <div className="hidden lg:block">
          <FilterSidebar filters={filters} onChange={handleFilterChange} onClear={handleClearFilters} />
        </div>

        {mobileFiltersOpen && (
          <div className="fixed inset-0 z-[70] lg:hidden">
            <div className="absolute inset-0 bg-black/40" onClick={() => setMobileFiltersOpen(false)} />
            <div className="absolute right-0 top-0 h-full w-[85%] max-w-sm overflow-y-auto bg-[#FAFAFA] p-5">
              <button onClick={() => setMobileFiltersOpen(false)} className="mb-4 ml-auto flex rounded-full p-2 hover:bg-gray-100">
                <X size={20} />
              </button>
              <FilterSidebar filters={filters} onChange={handleFilterChange} onClear={handleClearFilters} />
            </div>
          </div>
        )}

        <div className="flex-1">
          {loading ? (
            <ProductGridSkeleton count={12} />
          ) : list.length === 0 ? (
            <EmptyState title="No products match your search" message="Try adjusting your filters." />
          ) : (
            <>
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-4">
                {list.map((product) => (
                  <ProductCard key={product._id} product={product} />
                ))}
              </div>
              <Pagination page={pagination.page} totalPages={pagination.totalPages} onPageChange={handlePageChange} />
            </>
          )}
        </div>
      </div>
    </div>
  );
}
