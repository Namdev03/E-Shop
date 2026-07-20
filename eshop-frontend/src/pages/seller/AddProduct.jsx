import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router";
import { toast } from "react-toastify";
import { Plus, Trash2 } from "lucide-react";
import axiosInstance from "../../services/axiosInstance.js";
import { createProduct } from "../../redux/slices/productSlice.js";

export function AddProduct() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm();

  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [images, setImages] = useState([]);
  const [colorVariants, setColorVariants] = useState([]);
  const [sizeVariants, setSizeVariants] = useState([]);
  const [specifications, setSpecifications] = useState([]);

  useEffect(() => {
    axiosInstance.get("/categories").then(({ data }) => setCategories(data.data.categories));
    axiosInstance.get("/brands").then(({ data }) => setBrands(data.data.brands));
  }, []);

  const addColorVariant = () => setColorVariants((v) => [...v, { name: "", hexCode: "#000000", stock: 0 }]);
  const addSizeVariant = () => setSizeVariants((v) => [...v, { size: "", stock: 0 }]);
  const addSpecification = () => setSpecifications((v) => [...v, { key: "", value: "" }]);

  const updateColorVariant = (i, field, value) =>
    setColorVariants((v) => v.map((item, idx) => (idx === i ? { ...item, [field]: value } : item)));
  const updateSizeVariant = (i, field, value) =>
    setSizeVariants((v) => v.map((item, idx) => (idx === i ? { ...item, [field]: value } : item)));
  const updateSpecification = (i, field, value) =>
    setSpecifications((v) => v.map((item, idx) => (idx === i ? { ...item, [field]: value } : item)));

  const onSubmit = async (formValues) => {
    if (images.length === 0) {
      toast.error("At least one product image is required");
      return;
    }

    const formData = new FormData();
    Object.entries(formValues).forEach(([key, value]) => formData.append(key, value));
    formData.append("colorVariants", JSON.stringify(colorVariants.filter((v) => v.name)));
    formData.append("sizeVariants", JSON.stringify(sizeVariants.filter((v) => v.size)));
    formData.append("specifications", JSON.stringify(specifications.filter((s) => s.key)));
    images.forEach((file) => formData.append("images", file));

    const result = await dispatch(createProduct(formData));
    if (result.meta.requestStatus === "fulfilled") {
      toast.success("Product created successfully");
      navigate("/seller/products");
    } else {
      toast.error(result.payload || "Failed to create product");
    }
  };

  return (
    <div className="mx-auto max-w-3xl px-6 py-8 lg:px-8">
      <h1 className="mb-6 text-2xl font-bold text-[#101828]">Add New Product</h1>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <Section title="Basic Details">
          <TextField label="Title" error={errors.title} inputProps={register("title", { required: "Required" })} />
          <TextArea label="Description" error={errors.description} inputProps={register("description", { required: "Required" })} />
          <div className="grid grid-cols-2 gap-4">
            <SelectField label="Category" error={errors.category} inputProps={register("category", { required: "Required" })} options={categories.map((c) => ({ value: c._id, label: c.name }))} />
            <SelectField label="Brand" inputProps={register("brand")} options={brands.map((b) => ({ value: b._id, label: b.name }))} />
          </div>
        </Section>

        <Section title="Pricing & Stock">
          <div className="grid grid-cols-3 gap-4">
            <TextField label="Price (₹)" type="number" error={errors.price} inputProps={register("price", { required: "Required" })} />
            <TextField label="Discount Price (₹)" type="number" inputProps={register("discountPrice")} />
            <TextField label="Stock" type="number" error={errors.stock} inputProps={register("stock", { required: "Required" })} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <TextField label="Weight (grams)" type="number" inputProps={register("weight")} />
            <SelectField label="Status" inputProps={register("status")} options={[{ value: "Draft", label: "Draft" }, { value: "Published", label: "Published" }]} />
          </div>
        </Section>

        <Section title="Color Variants">
          {colorVariants.map((v, i) => (
            <div key={i} className="flex items-center gap-2">
              <input type="text" placeholder="Color name" value={v.name} onChange={(e) => updateColorVariant(i, "name", e.target.value)} className="flex-1 rounded-lg border border-[#E5E7EB] px-3 py-2 text-sm" />
              <input type="color" value={v.hexCode} onChange={(e) => updateColorVariant(i, "hexCode", e.target.value)} className="h-9 w-9 rounded" />
              <input type="number" placeholder="Stock" value={v.stock} onChange={(e) => updateColorVariant(i, "stock", e.target.value)} className="w-24 rounded-lg border border-[#E5E7EB] px-3 py-2 text-sm" />
              <button type="button" onClick={() => setColorVariants((cv) => cv.filter((_, idx) => idx !== i))} className="rounded-lg p-2 text-red-500 hover:bg-red-50"><Trash2 size={16} /></button>
            </div>
          ))}
          <button type="button" onClick={addColorVariant} className="flex items-center gap-1.5 text-sm font-medium text-[#C81E5C]"><Plus size={14} /> Add Color</button>
        </Section>

        <Section title="Size Variants">
          {sizeVariants.map((v, i) => (
            <div key={i} className="flex items-center gap-2">
              <input type="text" placeholder="Size (e.g. M, 42)" value={v.size} onChange={(e) => updateSizeVariant(i, "size", e.target.value)} className="flex-1 rounded-lg border border-[#E5E7EB] px-3 py-2 text-sm" />
              <input type="number" placeholder="Stock" value={v.stock} onChange={(e) => updateSizeVariant(i, "stock", e.target.value)} className="w-24 rounded-lg border border-[#E5E7EB] px-3 py-2 text-sm" />
              <button type="button" onClick={() => setSizeVariants((sv) => sv.filter((_, idx) => idx !== i))} className="rounded-lg p-2 text-red-500 hover:bg-red-50"><Trash2 size={16} /></button>
            </div>
          ))}
          <button type="button" onClick={addSizeVariant} className="flex items-center gap-1.5 text-sm font-medium text-[#C81E5C]"><Plus size={14} /> Add Size</button>
        </Section>

        <Section title="Specifications">
          {specifications.map((s, i) => (
            <div key={i} className="flex items-center gap-2">
              <input type="text" placeholder="Key (e.g. Material)" value={s.key} onChange={(e) => updateSpecification(i, "key", e.target.value)} className="flex-1 rounded-lg border border-[#E5E7EB] px-3 py-2 text-sm" />
              <input type="text" placeholder="Value" value={s.value} onChange={(e) => updateSpecification(i, "value", e.target.value)} className="flex-1 rounded-lg border border-[#E5E7EB] px-3 py-2 text-sm" />
              <button type="button" onClick={() => setSpecifications((sp) => sp.filter((_, idx) => idx !== i))} className="rounded-lg p-2 text-red-500 hover:bg-red-50"><Trash2 size={16} /></button>
            </div>
          ))}
          <button type="button" onClick={addSpecification} className="flex items-center gap-1.5 text-sm font-medium text-[#C81E5C]"><Plus size={14} /> Add Specification</button>
        </Section>

        <Section title="Images">
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={(e) => setImages(Array.from(e.target.files))}
            className="w-full rounded-lg border border-[#E5E7EB] px-3 py-2 text-sm file:mr-3 file:rounded-md file:border-0 file:bg-[#101828] file:px-3 file:py-1.5 file:text-xs file:text-white"
          />
          {images.length > 0 && <p className="mt-1 text-xs text-gray-500">{images.length} file(s) selected</p>}
        </Section>

        <button type="submit" disabled={isSubmitting} className="w-full rounded-lg bg-[#101828] py-3 text-sm font-semibold text-white hover:bg-[#C81E5C] disabled:opacity-60">
          {isSubmitting ? "Publishing..." : "Create Product"}
        </button>
      </form>
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div className="rounded-2xl border border-[#E5E7EB] p-5">
      <h2 className="mb-4 font-semibold text-[#101828]">{title}</h2>
      <div className="space-y-3">{children}</div>
    </div>
  );
}

function TextField({ label, type = "text", error, inputProps }) {
  return (
    <div>
      <label className="mb-1 block text-sm font-medium text-gray-700">{label}</label>
      <input type={type} {...inputProps} className="w-full rounded-lg border border-[#E5E7EB] px-3 py-2 text-sm outline-none focus:border-[#C81E5C]" />
      {error && <p className="mt-1 text-xs text-red-500">{error.message}</p>}
    </div>
  );
}

function TextArea({ label, error, inputProps }) {
  return (
    <div>
      <label className="mb-1 block text-sm font-medium text-gray-700">{label}</label>
      <textarea rows={4} {...inputProps} className="w-full rounded-lg border border-[#E5E7EB] px-3 py-2 text-sm outline-none focus:border-[#C81E5C]" />
      {error && <p className="mt-1 text-xs text-red-500">{error.message}</p>}
    </div>
  );
}

function SelectField({ label, error, inputProps, options }) {
  return (
    <div>
      <label className="mb-1 block text-sm font-medium text-gray-700">{label}</label>
      <select {...inputProps} className="w-full rounded-lg border border-[#E5E7EB] px-3 py-2 text-sm outline-none focus:border-[#C81E5C]">
        <option value="">Select...</option>
        {options.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
      {error && <p className="mt-1 text-xs text-red-500">{error.message}</p>}
    </div>
  );
}
