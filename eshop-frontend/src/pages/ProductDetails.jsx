import { useEffect, useState } from "react";
import { useParams } from "react-router";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import { Heart, ShoppingCart, Check, Star } from "lucide-react";
import { fetchProductBySlug, clearCurrentProduct } from "../redux/slices/productSlice.js";
import { addToWishlist, removeFromWishlist } from "../redux/slices/wishlistSlice.js";
import { addToCart } from "../redux/slices/cartSlice.js";
import { fetchProductReviews, addReview } from "../redux/slices/reviewSlice.js";
import { Loader } from "../components/Loader.jsx";
import { StarRating } from "../components/StarRating.jsx";
import { ProductCard } from "../components/ProductCard.jsx";

export function ProductDetails() {
  const { slug } = useParams();
  const dispatch = useDispatch();
  const { current: product, relatedProducts, loading } = useSelector((state) => state.product);
  const { isLoggedIn, role } = useSelector((state) => state.auth);
  const wishlistItems = useSelector((state) => state.wishlist.items);
  const reviews = useSelector((state) => state.review.list);

  const [activeImage, setActiveImage] = useState(0);
  const [selectedColor, setSelectedColor] = useState(null);
  const [selectedSize, setSelectedSize] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");

  useEffect(() => {
    dispatch(fetchProductBySlug(slug));
    return () => dispatch(clearCurrentProduct());
  }, [dispatch, slug]);

  useEffect(() => {
    if (product?._id) dispatch(fetchProductReviews(product._id));
  }, [dispatch, product?._id]);

  useEffect(() => {
    setActiveImage(0);
    setSelectedColor(product?.colorVariants?.[0]?.name || null);
    setSelectedSize(product?.sizeVariants?.[0]?.size || null);
    setQuantity(1);
  }, [product?._id]);

  if (loading || !product) return <Loader fullScreen />;

  const isWishlisted = wishlistItems?.some((i) => i.product._id === product._id);
  const hasDiscount = product.discountPrice && product.discountPrice < product.price;
  const displayPrice = hasDiscount ? product.discountPrice : product.price;

  const activeColorImages = product.colorVariants?.find((v) => v.name === selectedColor)?.images;
  const gallery = activeColorImages?.length ? activeColorImages : product.images;

  const handleAddToCart = () => {
    if (!isLoggedIn || role !== "user") {
      toast.info("Please log in as a customer to add items to your cart");
      return;
    }
    dispatch(addToCart({ productId: product._id, quantity, color: selectedColor, size: selectedSize }))
      .unwrap()
      .then(() => toast.success("Added to cart"))
      .catch((err) => toast.error(err));
  };

  const handleWishlistToggle = () => {
    if (!isLoggedIn || role !== "user") {
      toast.info("Please log in as a customer to save products");
      return;
    }
    const action = isWishlisted ? removeFromWishlist(product._id) : addToWishlist(product._id);
    dispatch(action)
      .unwrap()
      .then(() => toast.success(isWishlisted ? "Removed from wishlist" : "Added to wishlist"))
      .catch((err) => toast.error(err));
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!isLoggedIn || role !== "user") {
      toast.info("Please log in as a customer to leave a review");
      return;
    }
    if (rating === 0) {
      toast.error("Please select a star rating");
      return;
    }

    const formData = new FormData();
    formData.append("rating", rating);
    formData.append("comment", comment);

    const result = await dispatch(addReview({ productId: product._id, formData }));
    if (result.meta.requestStatus === "fulfilled") {
      toast.success("Review submitted");
      setRating(0);
      setComment("");
      dispatch(fetchProductReviews(product._id));
    } else {
      toast.error(result.payload || "Failed to submit review");
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-6 py-8 lg:px-8">
      <div className="grid grid-cols-1 gap-10 lg:grid-cols-2">
        {/* Gallery */}
        <div>
          <div className="aspect-square w-full overflow-hidden rounded-2xl bg-gray-50">
            {gallery?.[activeImage]?.url && (
              <img src={gallery[activeImage].url} alt={product.title} className="h-full w-full object-cover" />
            )}
          </div>
          {gallery?.length > 1 && (
            <div className="mt-3 flex gap-2 overflow-x-auto">
              {gallery.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setActiveImage(i)}
                  className={`h-16 w-16 shrink-0 overflow-hidden rounded-lg border-2 ${
                    activeImage === i ? "border-[#C81E5C]" : "border-transparent"
                  }`}
                >
                  <img src={img.url} alt="" className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div className="space-y-5">
          <div>
            <h1 className="text-2xl font-bold text-[#101828]">{product.title}</h1>
            {product.brand && <p className="mt-1 text-sm text-gray-500">by {product.brand.name}</p>}
            {product.ratings > 0 && (
              <div className="mt-2">
                <StarRating rating={product.ratings} showCount count={product.reviewsCount} />
              </div>
            )}
          </div>

          <div className="flex items-baseline gap-3">
            <span className="text-3xl font-bold text-[#101828]">₹{displayPrice.toLocaleString("en-IN")}</span>
            {hasDiscount && (
              <>
                <span className="text-lg text-gray-400 line-through">₹{product.price.toLocaleString("en-IN")}</span>
                <span className="rounded-full bg-[#C81E5C]/10 px-2.5 py-1 text-sm font-semibold text-[#C81E5C]">
                  {product.discountPercent}% OFF
                </span>
              </>
            )}
          </div>

          {product.colorVariants?.length > 0 && (
            <div>
              <p className="mb-2 text-sm font-medium text-gray-700">Color: {selectedColor}</p>
              <div className="flex gap-2">
                {product.colorVariants.map((v) => (
                  <button
                    key={v.name}
                    onClick={() => setSelectedColor(v.name)}
                    style={{ backgroundColor: v.hexCode || "#ccc" }}
                    className={`h-9 w-9 rounded-full border-2 ${
                      selectedColor === v.name ? "border-[#101828]" : "border-transparent"
                    }`}
                    aria-label={v.name}
                  />
                ))}
              </div>
            </div>
          )}

          {product.sizeVariants?.length > 0 && (
            <div>
              <p className="mb-2 text-sm font-medium text-gray-700">Size: {selectedSize}</p>
              <div className="flex flex-wrap gap-2">
                {product.sizeVariants.map((v) => (
                  <button
                    key={v.size}
                    onClick={() => setSelectedSize(v.size)}
                    disabled={v.stock === 0}
                    className={`rounded-lg border px-4 py-2 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-40 ${
                      selectedSize === v.size
                        ? "border-[#101828] bg-[#101828] text-white"
                        : "border-[#E5E7EB] text-gray-700 hover:border-[#101828]"
                    }`}
                  >
                    {v.size}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="flex items-center gap-4">
            <div className="flex items-center rounded-lg border border-[#E5E7EB]">
              <button onClick={() => setQuantity((q) => Math.max(1, q - 1))} className="px-3 py-2 text-lg">−</button>
              <span className="w-10 text-center">{quantity}</span>
              <button onClick={() => setQuantity((q) => q + 1)} className="px-3 py-2 text-lg">+</button>
            </div>
            <span className="text-sm text-gray-500">
              {product.stock > 0 ? `${product.stock} in stock` : "Out of stock"}
            </span>
          </div>

          <div className="flex gap-3">
            <button
              onClick={handleAddToCart}
              disabled={product.stock === 0}
              className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#101828] py-3.5 font-semibold text-white transition hover:bg-[#C81E5C] disabled:cursor-not-allowed disabled:opacity-50"
            >
              <ShoppingCart size={18} /> Add to Cart
            </button>
            <button
              onClick={handleWishlistToggle}
              aria-label="Toggle wishlist"
              className="flex items-center justify-center rounded-xl border border-[#E5E7EB] px-4 transition hover:bg-gray-50"
            >
              <Heart size={20} className={isWishlisted ? "fill-[#C81E5C] text-[#C81E5C]" : "text-gray-600"} />
            </button>
          </div>

          {product.specifications?.length > 0 && (
            <div className="rounded-xl border border-[#E5E7EB] p-4">
              <p className="mb-2 font-semibold text-[#101828]">Specifications</p>
              <dl className="grid grid-cols-2 gap-2 text-sm">
                {product.specifications.map((spec) => (
                  <div key={spec.key} className="contents">
                    <dt className="text-gray-500">{spec.key}</dt>
                    <dd className="text-[#101828]">{spec.value}</dd>
                  </div>
                ))}
              </dl>
            </div>
          )}

          {product.seller && (
            <div className="flex items-center gap-2 text-sm text-gray-500">
              Sold by <span className="font-medium text-[#101828]">{product.seller.storeName}</span>
              {product.seller.isVerifiedSeller && <Check size={14} className="text-[#C81E5C]" />}
            </div>
          )}
        </div>
      </div>

      <div className="mt-10">
        <h2 className="mb-3 font-semibold text-[#101828]">Description</h2>
        <p className="whitespace-pre-line text-sm leading-relaxed text-gray-600">{product.description}</p>
      </div>

      {/* Reviews */}
      <div className="mt-10 max-w-2xl space-y-6">
        <h2 className="font-semibold text-[#101828]">Reviews</h2>

        {reviews.length === 0 ? (
          <p className="text-sm text-gray-500">No reviews yet.</p>
        ) : (
          <div className="space-y-4">
            {reviews.map((r) => (
              <div key={r._id} className="rounded-xl border border-[#E5E7EB] p-4">
                <div className="flex items-center gap-3">
                  <img
                    src={
                      r.user?.profileImage?.url ||
                      "https://static.vecteezy.com/system/resources/previews/036/280/651/original/default-avatar-profile-icon-social-media-user-image-gray-avatar-icon-blank-profile-silhouette-illustration-vector.jpg"
                    }
                    alt={r.user?.fullName}
                    className="h-9 w-9 rounded-full object-cover"
                  />
                  <div>
                    <p className="text-sm font-semibold text-[#101828]">{r.user?.fullName}</p>
                    <StarRating rating={r.rating} size={12} />
                  </div>
                </div>
                {r.comment && <p className="mt-2 text-sm text-gray-600">{r.comment}</p>}
              </div>
            ))}
          </div>
        )}

        <form onSubmit={handleReviewSubmit} className="rounded-xl border border-[#E5E7EB] p-4">
          <p className="mb-2 text-sm font-medium text-gray-700">Leave a review</p>
          <div className="mb-3 flex gap-1">
            {[1, 2, 3, 4, 5].map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => setRating(n)}
                onMouseEnter={() => setHoverRating(n)}
                onMouseLeave={() => setHoverRating(0)}
              >
                <Star
                  size={24}
                  className={n <= (hoverRating || rating) ? "fill-[#D4A017] text-[#D4A017]" : "text-gray-300"}
                />
              </button>
            ))}
          </div>
          <textarea
            rows={3}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Share your experience..."
            className="mb-3 w-full rounded-lg border border-[#E5E7EB] px-3 py-2 text-sm outline-none focus:border-[#C81E5C]"
          />
          <button type="submit" className="rounded-lg bg-[#101828] px-5 py-2 text-sm font-semibold text-white hover:bg-[#C81E5C]">
            Submit Review
          </button>
        </form>
      </div>

      {relatedProducts?.length > 0 && (
        <div className="mt-14">
          <h2 className="mb-5 font-semibold text-[#101828]">Related Products</h2>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
            {relatedProducts.map((p) => (
              <ProductCard key={p._id} product={p} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
