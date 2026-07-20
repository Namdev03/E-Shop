import { useEffect, useState } from "react";
import { Link } from "react-router";
import axiosInstance from "../services/axiosInstance.js";
import { ProductCard } from "../components/ProductCard.jsx";
import { ProductGridSkeleton } from "../components/ProductSkeleton.jsx";
import { EmptyState } from "../components/EmptyState.jsx";

function ProductRow({ title, subtitle, viewAllHref, params }) {
  const [products, setProducts] = useState(null);

  useEffect(() => {
    let cancelled = false;
    axiosInstance
      .get("/products", { params: { ...params, limit: 10 } })
      .then(({ data }) => {
        if (!cancelled) setProducts(data.data.products);
      })
      .catch(() => {
        if (!cancelled) setProducts([]);
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <section className="mx-auto max-w-7xl px-6 py-10 lg:px-8">
      <div className="mb-6 flex items-end justify-between">
        <div>
          <h2 className="text-xl font-bold text-[#101828] sm:text-2xl">{title}</h2>
          {subtitle && <p className="mt-1 text-sm text-gray-500">{subtitle}</p>}
        </div>
        <Link to={viewAllHref} className="text-sm font-semibold text-[#C81E5C] hover:underline">
          View all →
        </Link>
      </div>

      {products === null ? (
        <ProductGridSkeleton count={5} />
      ) : products.length === 0 ? (
        <EmptyState title="Nothing here yet" message="Check back soon." />
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {products.map((p) => (
            <ProductCard key={p._id} product={p} />
          ))}
        </div>
      )}
    </section>
  );
}

export function Home() {
  return (
    <div>
      <section className="bg-gradient-to-br from-[#101828] to-[#1d2939] px-6 py-20 text-center text-white lg:px-8">
        <h1 className="mx-auto max-w-2xl text-4xl font-bold leading-tight sm:text-5xl">
          Shop everything you need, <span className="text-[#C81E5C]">delivered fast</span>
        </h1>
        <p className="mx-auto mt-4 max-w-lg text-white/70">
          Thousands of products from trusted sellers, with deals updated daily.
        </p>
        <Link
          to="/products"
          className="mt-8 inline-block rounded-full bg-[#C81E5C] px-8 py-3 font-semibold text-white transition hover:bg-[#a8184c]"
        >
          Start Shopping
        </Link>
      </section>

      <ProductRow
        title="Flash Sale"
        subtitle="Limited-time deals — grab them before they're gone"
        viewAllHref="/products?flashSale=true"
        params={{ flashSale: "true" }}
      />
      <ProductRow
        title="Featured Products"
        subtitle="Hand-picked picks for you"
        viewAllHref="/products?featured=true"
        params={{ featured: "true" }}
      />
      <ProductRow
        title="Trending Now"
        subtitle="What everyone's buying this week"
        viewAllHref="/products?trending=true"
        params={{ trending: "true" }}
      />
      <ProductRow
        title="New Arrivals"
        subtitle="Fresh off the shelf"
        viewAllHref="/products?newArrivals=true"
        params={{ newArrivals: "true" }}
      />
      <ProductRow
        title="Best Sellers"
        subtitle="Our customers' favorites"
        viewAllHref="/products?bestSellers=true"
        params={{ bestSellers: "true" }}
      />
    </div>
  );
}
