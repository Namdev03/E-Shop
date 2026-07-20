import { Link } from "react-router";
import { Heart } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import { addToWishlist, removeFromWishlist } from "../redux/slices/wishlistSlice.js";
import { StarRating } from "./StarRating.jsx";

export function ProductCard({ product }) {
  const dispatch = useDispatch();
  const { isLoggedIn, role } = useSelector((state) => state.auth);
  const wishlistItems = useSelector((state) => state.wishlist.items);

  const isWishlisted = wishlistItems?.some((i) => i.product._id === product._id);
  const hasDiscount = product.discountPrice && product.discountPrice < product.price;
  const displayPrice = hasDiscount ? product.discountPrice : product.price;

  const handleWishlistClick = (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isLoggedIn || role !== "user") {
      toast.info("Please log in as a customer to save products");
      return;
    }

    const action = isWishlisted
      ? removeFromWishlist(product._id)
      : addToWishlist(product._id);

    dispatch(action)
      .unwrap()
      .then(() => toast.success(isWishlisted ? "Removed from wishlist" : "Added to wishlist"))
      .catch((err) => toast.error(err));
  };

  return (
    <Link
      to={`/products/${product.slug}`}
      className="group block overflow-hidden rounded-2xl border border-[#E5E7EB] bg-white transition duration-300 hover:shadow-lg"
    >
      <div className="relative aspect-square w-full overflow-hidden bg-gray-50">
        {product.images?.[0]?.url ? (
          <img
            src={product.images[0].url}
            alt={product.title}
            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-sm text-gray-400">
            No image
          </div>
        )}

        {hasDiscount && (
          <span className="absolute left-2 top-2 rounded-full bg-[#C81E5C] px-2.5 py-1 text-xs font-bold text-white">
            {product.discountPercent}% OFF
          </span>
        )}

        <button
          onClick={handleWishlistClick}
          aria-label="Toggle wishlist"
          className="absolute right-2 top-2 rounded-full bg-white/90 p-1.5 shadow-sm backdrop-blur transition hover:scale-110"
        >
          <Heart size={16} className={isWishlisted ? "fill-[#C81E5C] text-[#C81E5C]" : "text-gray-600"} />
        </button>

        {product.stock === 0 && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/40">
            <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-[#101828]">
              Out of Stock
            </span>
          </div>
        )}
      </div>

      <div className="space-y-1 p-3">
        <p className="line-clamp-2 text-sm font-medium text-[#101828]">{product.title}</p>

        {product.ratings > 0 && (
          <StarRating rating={product.ratings} size={12} showCount count={product.reviewsCount} />
        )}

        <div className="flex items-baseline gap-2 pt-0.5">
          <span className="font-semibold text-[#101828]">₹{displayPrice?.toLocaleString("en-IN")}</span>
          {hasDiscount && (
            <span className="text-xs text-gray-400 line-through">
              ₹{product.price.toLocaleString("en-IN")}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
