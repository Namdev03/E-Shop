import { ChevronLeft, ChevronRight } from "lucide-react";

export function Pagination({ page, totalPages, onPageChange }) {
  if (totalPages <= 1) return null;

  const pages = [];
  const start = Math.max(1, page - 2);
  const end = Math.min(totalPages, start + 4);
  for (let i = start; i <= end; i++) pages.push(i);

  return (
    <div className="flex items-center justify-center gap-2 py-8">
      <button
        onClick={() => onPageChange(page - 1)}
        disabled={page === 1}
        aria-label="Previous page"
        className="rounded-full p-2 text-gray-600 transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-30"
      >
        <ChevronLeft size={18} />
      </button>

      {start > 1 && (
        <>
          <PageButton n={1} active={page === 1} onClick={onPageChange} />
          {start > 2 && <span className="px-1 text-gray-400">…</span>}
        </>
      )}

      {pages.map((n) => (
        <PageButton key={n} n={n} active={page === n} onClick={onPageChange} />
      ))}

      {end < totalPages && (
        <>
          {end < totalPages - 1 && <span className="px-1 text-gray-400">…</span>}
          <PageButton n={totalPages} active={page === totalPages} onClick={onPageChange} />
        </>
      )}

      <button
        onClick={() => onPageChange(page + 1)}
        disabled={page === totalPages}
        aria-label="Next page"
        className="rounded-full p-2 text-gray-600 transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-30"
      >
        <ChevronRight size={18} />
      </button>
    </div>
  );
}

function PageButton({ n, active, onClick }) {
  return (
    <button
      onClick={() => onClick(n)}
      className={`h-9 w-9 rounded-full text-sm font-medium transition ${
        active ? "bg-[#101828] text-white" : "text-gray-600 hover:bg-gray-100"
      }`}
    >
      {n}
    </button>
  );
}
