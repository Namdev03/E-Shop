import React from "react";
import { useForm } from "react-hook-form";

export default function AddProductForm() {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    defaultValues: {
      stock: 0,
      isActive: true,
    },
  });

  const onSubmit = (data) => {
    const formattedData = {
      ...data,
      price: Number(data.price),
      stock: Number(data.stock),
      images: data.images
        ? data.images.split(",").map((img) => img.trim())
        : [],
    };

    console.log("Final Product:", formattedData);
    reset();
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4">
      <div className="w-full max-w-3xl bg-white rounded-2xl shadow-lg p-8">
        
        <h2 className="text-3xl font-semibold text-gray-800 mb-6 text-center">
          Add New Product
        </h2>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="grid grid-cols-1 md:grid-cols-2 gap-5"
        >
          {/* Name */}
          <div className="md:col-span-2">
            <label className="text-sm font-medium text-gray-700">
              Product Name *
            </label>
            <input
              {...register("name", { required: "Name is required" })}
              className="mt-1 w-full border border-gray-300 rounded-xl px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              placeholder="Enter product name"
            />
            {errors.name && (
              <p className="text-red-500 text-xs mt-1">
                {errors.name.message}
              </p>
            )}
          </div>

          {/* Price */}
          <div>
            <label className="text-sm font-medium text-gray-700">
              Price *
            </label>
            <input
              type="number"
              step="0.01"
              {...register("price", {
                required: "Price is required",
                min: { value: 0, message: "Must be ≥ 0" },
              })}
              className="mt-1 w-full border border-gray-300 rounded-xl px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="0.00"
            />
            {errors.price && (
              <p className="text-red-500 text-xs mt-1">
                {errors.price.message}
              </p>
            )}
          </div>

          {/* Stock */}
          <div>
            <label className="text-sm font-medium text-gray-700">
              Stock
            </label>
            <input
              type="number"
              {...register("stock")}
              className="mt-1 w-full border border-gray-300 rounded-xl px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          {/* Category */}
          <div>
            <label className="text-sm font-medium text-gray-700">
              Category *
            </label>
            <input
              {...register("category", { required: "Category is required" })}
              className="mt-1 w-full border border-gray-300 rounded-xl px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="Electronics"
            />
            {errors.category && (
              <p className="text-red-500 text-xs mt-1">
                {errors.category.message}
              </p>
            )}
          </div>

          {/* Brand */}
          <div>
            <label className="text-sm font-medium text-gray-700">
              Brand
            </label>
            <input
              {...register("brand")}
              className="mt-1 w-full border border-gray-300 rounded-xl px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="Apple"
            />
          </div>

          {/* Description */}
          <div className="md:col-span-2">
            <label className="text-sm font-medium text-gray-700">
              Description
            </label>
            <textarea
              rows="3"
              {...register("description")}
              className="mt-1 w-full border border-gray-300 rounded-xl px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="Write product description..."
            />
          </div>

          {/* Image */}
          <div className="md:col-span-2">
            <label className="text-sm font-medium text-gray-700">
            product image
            </label>
            <input
              {...register("productImage")}
              type="file"
              className="mt-1 w-full border border-gray-300 rounded-xl px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="https://example.com/image.jpg"
            />
          </div>

          {/* Images */}
          <div className="md:col-span-2">
            <label className="text-sm font-medium text-gray-700">
              Additional Images
            </label>
            <input
              {...register("images")}
              className="mt-1 w-full border border-gray-300 rounded-xl px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="url1, url2, url3"
            />
          </div>

          {/* Toggle */}
          <div className="md:col-span-2 flex items-center justify-between bg-gray-50 px-4 py-3 rounded-xl">
            <span className="text-sm font-medium text-gray-700">
              Active Product
            </span>
            <input
              type="checkbox"
              {...register("isActive")}
              className="w-5 h-5 accent-blue-600"
            />
          </div>

          {/* Submit */}
          <div className="md:col-span-2">
            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-3 rounded-xl font-medium hover:bg-blue-700 transition"
            >
              Add Product
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}