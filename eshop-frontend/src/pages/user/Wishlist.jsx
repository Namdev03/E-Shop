import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import { Heart, ShoppingCart, Trash2 } from "lucide-react";
import { fetchWishlist, removeFromWishlist, moveToCart } from "../../redux/slices/wishlistSlice.js";
import { EmptyState } from "../../components/EmptyState.jsx";
import { Loader } from "../../components/Loader.jsx";
import { Link } from "react-router";

export function Wishlist() {
  const dispatch = useDispatch();
  const { items, loading } = useSelector((state) => state.wishlist);

  useEffect(() => {
    dispatch(fetchWishlist());
  }, [dispatch]);

  const handleRemove = (productId) => {
    dispatch(removeFromWishlist(productId))
      .unwrap()
      .then(() => toast.success("Removed from wishlist"))
      .catch((err) => toast.error(err));
  };

  const handleMoveToCart = (productId) => {
    dispatch(moveToCart(productId))
      .unwrap()
      .then(() => toast.success("Moved to cart"))
      .catch((err) => toast.error(err));
  };

  if (loading) return <Loader fullScreen />;

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-4xl px-6 py-16">
        <EmptyState icon={Heart} title="Your wishlist is empty" message="Tap the heart icon on any product to save it here." />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-6 py-8 lg:px-8">
      <h1 className="mb-6 text-2xl font-bold text-[#101828]">My Wishlist</h1>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((item) => (
          <div key={item._id} className="overflow-hidden rounded-2xl border border-[#E5E7EB] bg-white">
            <Link to={`/products/${item.product.slug}`}>
              <img src={item.product.images?.[0]?.url} alt={item.product.title} className="aspect-square w-full object-cover" />
            </Link>
            <div className="p-3">
              <p className="line-clamp-1 text-sm font-medium text-[#101828]">{item.product.title}</p>
              <p className="mt-1 font-semibold text-[#101828]">₹{item.product.price?.toLocaleString("en-IN")}</p>
              <div className="mt-3 flex gap-2">
                <button
                  onClick={() => handleMoveToCart(item.product._id)}
                  className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-[#101828] py-2 text-xs font-semibold text-white hover:bg-[#C81E5C]"
                >
                  <ShoppingCart size={13} /> Move to Cart
                </button>
                <button
                  onClick={() => handleRemove(item.product._id)}
                  className="rounded-lg border border-[#E5E7EB] px-2.5 text-red-500 hover:bg-red-50"
                  aria-label="Remove"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
