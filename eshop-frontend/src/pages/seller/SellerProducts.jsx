import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router";
import { toast } from "react-toastify";
import { Plus, Pencil, Trash2, Package, Eye, EyeOff } from "lucide-react";
import { fetchSellerProducts, deleteProduct, setProductStatus } from "../../redux/slices/productSlice.js";
import { Loader } from "../../components/Loader.jsx";
import { EmptyState } from "../../components/EmptyState.jsx";
import { Modal } from "../../components/Modal.jsx";

export function SellerProducts() {
  const dispatch = useDispatch();
  const { sellerProducts, loading } = useSelector((state) => state.product);
  const [deleteTarget, setDeleteTarget] = useState(null);

  useEffect(() => {
    dispatch(fetchSellerProducts());
  }, [dispatch]);

  const handleToggleStatus = (product) => {
    const newStatus = product.status === "Published" ? "Draft" : "Published";
    dispatch(setProductStatus({ id: product._id, status: newStatus }))
      .unwrap()
      .then(() => toast.success(`Product ${newStatus.toLowerCase()}`))
      .catch((err) => toast.error(err));
  };

  const confirmDelete = async () => {
    const result = await dispatch(deleteProduct(deleteTarget._id));
    setDeleteTarget(null);
    if (result.meta.requestStatus === "fulfilled") {
      toast.success("Product deleted");
    } else {
      toast.error(result.payload || "Failed to delete product");
    }
  };

  if (loading) return <Loader fullScreen />;

  return (
    <div className="mx-auto max-w-7xl px-6 py-8 lg:px-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-[#101828]">My Products</h1>
        <Link to="/seller/products/add" className="flex items-center gap-2 rounded-full bg-[#101828] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#C81E5C]">
          <Plus size={16} /> Add Product
        </Link>
      </div>

      {sellerProducts.length === 0 ? (
        <EmptyState icon={Package} title="No products yet" message="Add your first product to start selling." />
      ) : (
        <div className="overflow-hidden rounded-2xl border border-[#E5E7EB]">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 text-gray-500">
              <tr>
                <th className="px-5 py-3 font-medium">Product</th>
                <th className="px-5 py-3 font-medium">Price</th>
                <th className="px-5 py-3 font-medium">Stock</th>
                <th className="px-5 py-3 font-medium">Status</th>
                <th className="px-5 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5E7EB]">
              {sellerProducts.map((product) => (
                <tr key={product._id}>
                  <td className="flex items-center gap-3 px-5 py-3">
                    <img src={product.images?.[0]?.url} alt="" className="h-12 w-12 rounded-lg object-cover" />
                    <span className="font-medium text-[#101828]">{product.title}</span>
                  </td>
                  <td className="px-5 py-3 font-medium text-[#C81E5C]">₹{product.price?.toLocaleString("en-IN")}</td>
                  <td className="px-5 py-3">{product.stock}</td>
                  <td className="px-5 py-3">
                    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${product.status === "Published" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"}`}>
                      {product.status}
                    </span>
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex gap-2">
                      <button onClick={() => handleToggleStatus(product)} className="rounded-lg p-2 text-gray-600 hover:bg-gray-100" aria-label="Toggle status">
                        {product.status === "Published" ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                      <Link to={`/seller/products/${product._id}/edit`} className="rounded-lg p-2 text-gray-600 hover:bg-gray-100" aria-label="Edit">
                        <Pencil size={16} />
                      </Link>
                      <button onClick={() => setDeleteTarget(product)} className="rounded-lg p-2 text-red-600 hover:bg-red-50" aria-label="Delete">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal isOpen={!!deleteTarget} onClose={() => setDeleteTarget(null)} title="Delete product?">
        <p className="text-sm text-gray-600">Are you sure you want to delete "{deleteTarget?.title}"? This cannot be undone.</p>
        <div className="mt-5 flex justify-end gap-3">
          <button onClick={() => setDeleteTarget(null)} className="rounded-lg border border-[#E5E7EB] px-4 py-2 text-sm font-medium">Cancel</button>
          <button onClick={confirmDelete} className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700">Delete</button>
        </div>
      </Modal>
    </div>
  );
}
