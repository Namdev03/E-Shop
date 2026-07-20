import { useEffect, useRef, useState } from "react";
import { useNavigate, Link } from "react-router";
import { useDispatch, useSelector } from "react-redux";
import { Search } from "lucide-react";
import { useDebounce } from "../hooks/useDebounce.js";
import { fetchSearchSuggestions, clearSearchSuggestions } from "../redux/slices/productSlice.js";

export function SearchBar({ className = "" }) {
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const debouncedQuery = useDebounce(query, 350);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const containerRef = useRef(null);

  const suggestions = useSelector((state) => state.product.searchSuggestions);

  useEffect(() => {
    if (debouncedQuery.trim().length >= 2) {
      dispatch(fetchSearchSuggestions(debouncedQuery));
      setIsOpen(true);
    } else {
      dispatch(clearSearchSuggestions());
      setIsOpen(false);
    }
  }, [debouncedQuery, dispatch]);

  useEffect(() => {
    const onClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  const goToSearch = () => {
    if (!query.trim()) return;
    setIsOpen(false);
    navigate(`/products?q=${encodeURIComponent(query.trim())}`);
  };

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && goToSearch()}
          onFocus={() => suggestions.length > 0 && setIsOpen(true)}
          placeholder="Search products, brands, categories..."
          className="w-full rounded-full border border-[#E5E7EB] bg-white py-2.5 pl-4 pr-11 text-sm outline-none transition focus:border-[#C81E5C] focus:ring-2 focus:ring-[#C81E5C]/15"
        />
        <button
          onClick={goToSearch}
          aria-label="Search"
          className="absolute right-1 top-1/2 -translate-y-1/2 rounded-full bg-[#101828] p-2 text-white transition hover:bg-[#C81E5C]"
        >
          <Search size={16} />
        </button>
      </div>

      {isOpen && suggestions.length > 0 && (
        <div className="absolute z-40 mt-2 w-full overflow-hidden rounded-xl border border-[#E5E7EB] bg-white shadow-lg">
          {suggestions.map((s) => (
            <Link
              key={s._id}
              to={`/products/${s.slug}`}
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-3 px-4 py-2.5 text-sm transition hover:bg-gray-50"
            >
              <img
                src={s.images?.[0]?.url}
                alt={s.title}
                className="h-9 w-9 rounded-lg object-cover"
              />
              <div className="flex-1">
                <p className="line-clamp-1 text-[#101828]">{s.title}</p>
                <p className="text-xs text-gray-500">₹{s.price?.toLocaleString("en-IN")}</p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
