export function FilterSidebar({ filters, onChange, onClear, categories = [], brands = [] }) {
  const set = (key, value) => onChange({ ...filters, [key]: value });

  return (
    <aside className="w-full space-y-6 rounded-2xl border border-[#E5E7EB] bg-white p-5 lg:w-64">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-[#101828]">Filters</h3>
        <button onClick={onClear} className="text-xs font-medium text-[#C81E5C] hover:underline">
          Clear all
        </button>
      </div>

      {categories.length > 0 && (
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">Category</label>
          <select
            value={filters.category || ""}
            onChange={(e) => set("category", e.target.value)}
            className="w-full rounded-lg border border-[#E5E7EB] px-3 py-2 text-sm outline-none focus:border-[#C81E5C]"
          >
            <option value="">All categories</option>
            {categories.map((c) => (
              <option key={c._id} value={c._id}>{c.name}</option>
            ))}
          </select>
        </div>
      )}

      {brands.length > 0 && (
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">Brand</label>
          <select
            value={filters.brand || ""}
            onChange={(e) => set("brand", e.target.value)}
            className="w-full rounded-lg border border-[#E5E7EB] px-3 py-2 text-sm outline-none focus:border-[#C81E5C]"
          >
            <option value="">All brands</option>
            {brands.map((b) => (
              <option key={b._id} value={b._id}>{b.name}</option>
            ))}
          </select>
        </div>
      )}

      <div>
        <label className="mb-2 block text-sm font-medium text-gray-700">Price Range (₹)</label>
        <div className="flex items-center gap-2">
          <input
            type="number"
            placeholder="Min"
            value={filters.minPrice || ""}
            onChange={(e) => set("minPrice", e.target.value)}
            className="w-full rounded-lg border border-[#E5E7EB] px-3 py-2 text-sm outline-none focus:border-[#C81E5C]"
          />
          <span className="text-gray-400">-</span>
          <input
            type="number"
            placeholder="Max"
            value={filters.maxPrice || ""}
            onChange={(e) => set("maxPrice", e.target.value)}
            className="w-full rounded-lg border border-[#E5E7EB] px-3 py-2 text-sm outline-none focus:border-[#C81E5C]"
          />
        </div>
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium text-gray-700">Minimum Rating</label>
        <div className="flex flex-wrap gap-2">
          {[4, 3, 2, 1].map((r) => (
            <button
              key={r}
              onClick={() => set("minRating", filters.minRating === String(r) ? "" : String(r))}
              className={`rounded-lg border px-3 py-1.5 text-sm font-medium transition ${
                filters.minRating === String(r)
                  ? "border-[#101828] bg-[#101828] text-white"
                  : "border-[#E5E7EB] text-gray-600 hover:border-[#101828]"
              }`}
            >
              {r}★ &amp; up
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium text-gray-700">Minimum Discount</label>
        <div className="flex flex-wrap gap-2">
          {[10, 20, 30, 50].map((d) => (
            <button
              key={d}
              onClick={() => set("minDiscount", filters.minDiscount === String(d) ? "" : String(d))}
              className={`rounded-lg border px-3 py-1.5 text-sm font-medium transition ${
                filters.minDiscount === String(d)
                  ? "border-[#101828] bg-[#101828] text-white"
                  : "border-[#E5E7EB] text-gray-600 hover:border-[#101828]"
              }`}
            >
              {d}% off
            </button>
          ))}
        </div>
      </div>

      <label className="flex items-center gap-2 text-sm text-gray-700">
        <input
          type="checkbox"
          checked={filters.inStock === "true"}
          onChange={(e) => set("inStock", e.target.checked ? "true" : "")}
        />
        In stock only
      </label>
    </aside>
  );
}
