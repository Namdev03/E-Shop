import { Star } from "lucide-react";

export function StarRating({ rating = 0, size = 14, showCount, count }) {
  return (
    <div className="flex items-center gap-1">
      <div className="flex">
        {[1, 2, 3, 4, 5].map((n) => (
          <Star
            key={n}
            size={size}
            className={n <= Math.round(rating) ? "fill-[#D4A017] text-[#D4A017]" : "text-gray-300"}
          />
        ))}
      </div>
      {showCount && <span className="text-xs text-gray-500">({count})</span>}
    </div>
  );
}
