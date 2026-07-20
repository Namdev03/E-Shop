import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router";
import { Package, TrendingUp, ShoppingBag, IndianRupee, Plus } from "lucide-react";
import { fetchSellerDashboardStats, fetchTopProducts } from "../../redux/slices/sellerSlice.js";

export function SellerDashboard() {
  const dispatch = useDispatch();
  const { stats, topProducts, profile } = useSelector((state) => state.seller);

  useEffect(() => {
    dispatch(fetchSellerDashboardStats());
    dispatch(fetchTopProducts());
  }, [dispatch]);

  const cards = [
    { label: "Total Products", value: stats.totalProducts, icon: Package },
    { label: "Published", value: stats.publishedProducts, icon: TrendingUp },
    { label: "Total Orders", value: stats.totalOrders, icon: ShoppingBag },
    { label: "Revenue", value: `₹${stats.revenue?.toLocaleString("en-IN") || 0}`, icon: IndianRupee },
  ];

  return (
    <div className="mx-auto max-w-7xl px-6 py-8 lg:px-8">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#101828]">Welcome, {profile?.storeName}</h1>
          <p className="mt-1 text-sm text-gray-500">Here's how your store is performing</p>
        </div>
        <Link to="/seller/products/add" className="flex items-center gap-2 rounded-full bg-[#101828] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#C81E5C]">
          <Plus size={16} /> Add Product
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((card) => (
          <div key={card.label} className="rounded-2xl border border-[#E5E7EB] bg-white p-5">
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-[#C81E5C]/10">
              <card.icon size={20} className="text-[#C81E5C]" />
            </div>
            <p className="text-2xl font-bold text-[#101828]">{card.value}</p>
            <p className="text-sm text-gray-500">{card.label}</p>
          </div>
        ))}
      </div>

      {topProducts.length > 0 && (
        <div className="mt-10">
          <h2 className="mb-4 font-semibold text-[#101828]">Top Products</h2>
          <div className="overflow-hidden rounded-2xl border border-[#E5E7EB]">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 text-gray-500">
                <tr><th className="px-5 py-3 font-medium">Product</th><th className="px-5 py-3 font-medium">Price</th><th className="px-5 py-3 font-medium">Units Sold</th></tr>
              </thead>
              <tbody className="divide-y divide-[#E5E7EB]">
                {topProducts.map((p) => (
                  <tr key={p._id}>
                    <td className="flex items-center gap-3 px-5 py-3">
                      <img src={p.images?.[0]?.url} alt="" className="h-10 w-10 rounded-lg object-cover" />
                      <span className="font-medium text-[#101828]">{p.title}</span>
                    </td>
                    <td className="px-5 py-3 text-[#C81E5C]">₹{p.price?.toLocaleString("en-IN")}</td>
                    <td className="px-5 py-3">{p.totalSold}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
