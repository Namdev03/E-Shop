import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import { Plus, Pencil, Trash2, MapPin, Home as HomeIcon, Building2 } from "lucide-react";
import {
  fetchAddresses, addAddress, updateAddress, deleteAddress,
} from "../../redux/slices/addressSlice.js";
import { Loader } from "../../components/Loader.jsx";
import { EmptyState } from "../../components/EmptyState.jsx";
import { Modal } from "../../components/Modal.jsx";

export function Addresses() {
  const dispatch = useDispatch();
  const { list: addresses, loading } = useSelector((state) => state.address);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm();

  useEffect(() => {
    dispatch(fetchAddresses());
  }, [dispatch]);

  const openAddModal = () => {
    setEditingAddress(null);
    reset({ addressType: "Home" });
    setModalOpen(true);
  };

  const openEditModal = (addr) => {
    setEditingAddress(addr);
    reset(addr);
    setModalOpen(true);
  };

  const onSubmit = async (formData) => {
    const action = editingAddress
      ? updateAddress({ id: editingAddress._id, addressData: formData })
      : addAddress(formData);

    const result = await dispatch(action);
    if (result.meta.requestStatus === "fulfilled") {
      toast.success(editingAddress ? "Address updated" : "Address added");
      setModalOpen(false);
    } else {
      toast.error(result.payload || "Failed to save address");
    }
  };

  const confirmDelete = async () => {
    const result = await dispatch(deleteAddress(deleteTarget._id));
    setDeleteTarget(null);
    if (result.meta.requestStatus === "fulfilled") {
      toast.success("Address deleted");
    } else {
      toast.error(result.payload || "Failed to delete address");
    }
  };

  if (loading) return <Loader fullScreen />;

  return (
    <div className="mx-auto max-w-4xl px-6 py-8 lg:px-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-[#101828]">My Addresses</h1>
        <button
          onClick={openAddModal}
          className="flex items-center gap-2 rounded-full bg-[#101828] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#C81E5C]"
        >
          <Plus size={16} /> Add Address
        </button>
      </div>

      {addresses.length === 0 ? (
        <EmptyState icon={MapPin} title="No addresses saved" message="Add an address to speed up checkout." />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {addresses.map((addr) => (
            <div key={addr._id} className="rounded-2xl border border-[#E5E7EB] p-5">
              <div className="mb-2 flex items-center justify-between">
                <span className="flex items-center gap-1.5 rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-600">
                  {addr.addressType === "Home" ? <HomeIcon size={12} /> : <Building2 size={12} />}
                  {addr.addressType}
                </span>
                {addr.isDefault && (
                  <span className="rounded-full bg-[#C81E5C]/10 px-2.5 py-1 text-xs font-medium text-[#C81E5C]">Default</span>
                )}
              </div>
              <p className="font-medium text-[#101828]">{addr.fullName}</p>
              <p className="mt-1 text-sm text-gray-500">
                {addr.streetAddress}, {addr.landmark && `${addr.landmark}, `}{addr.city}, {addr.state} {addr.pincode}, {addr.country}
              </p>
              <p className="text-sm text-gray-500">{addr.phone}</p>

              <div className="mt-4 flex gap-2">
                <button onClick={() => openEditModal(addr)} className="flex items-center gap-1 rounded-lg border border-[#E5E7EB] px-3 py-1.5 text-xs font-medium hover:bg-gray-50">
                  <Pencil size={12} /> Edit
                </button>
                <button onClick={() => setDeleteTarget(addr)} className="flex items-center gap-1 rounded-lg border border-red-200 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50">
                  <Trash2 size={12} /> Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editingAddress ? "Edit Address" : "Add Address"}>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <Field label="Full Name" error={errors.fullName} inputProps={register("fullName", { required: "Required" })} />
            <Field label="Phone" error={errors.phone} inputProps={register("phone", { required: "Required" })} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Alternate Phone" inputProps={register("alternatePhone")} />
            <Field label="Email" type="email" inputProps={register("email")} />
          </div>
          <Field label="Street Address" error={errors.streetAddress} inputProps={register("streetAddress", { required: "Required" })} />
          <Field label="Landmark" inputProps={register("landmark")} />
          <div className="grid grid-cols-3 gap-3">
            <Field label="City" error={errors.city} inputProps={register("city", { required: "Required" })} />
            <Field label="State" error={errors.state} inputProps={register("state", { required: "Required" })} />
            <Field label="Pincode" error={errors.pincode} inputProps={register("pincode", { required: "Required" })} />
          </div>
          <Field label="Country" error={errors.country} inputProps={register("country", { required: "Required" })} />
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Address Type</label>
            <select {...register("addressType")} className="w-full rounded-lg border border-[#E5E7EB] px-3 py-2 text-sm outline-none focus:border-[#C81E5C]">
              <option value="Home">Home</option>
              <option value="Office">Office</option>
            </select>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Delivery Instructions</label>
            <textarea rows={2} {...register("deliveryInstructions")} className="w-full rounded-lg border border-[#E5E7EB] px-3 py-2 text-sm outline-none focus:border-[#C81E5C]" />
          </div>
          <label className="flex items-center gap-2 text-sm text-gray-700">
            <input type="checkbox" {...register("isDefault")} /> Set as default address
          </label>
          <button type="submit" disabled={isSubmitting} className="w-full rounded-lg bg-[#101828] py-2.5 text-sm font-semibold text-white hover:bg-[#C81E5C] disabled:opacity-60">
            {isSubmitting ? "Saving..." : "Save Address"}
          </button>
        </form>
      </Modal>

      <Modal isOpen={!!deleteTarget} onClose={() => setDeleteTarget(null)} title="Delete address?">
        <p className="text-sm text-gray-600">Are you sure you want to delete this address?</p>
        <div className="mt-5 flex justify-end gap-3">
          <button onClick={() => setDeleteTarget(null)} className="rounded-lg border border-[#E5E7EB] px-4 py-2 text-sm font-medium">Cancel</button>
          <button onClick={confirmDelete} className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700">Delete</button>
        </div>
      </Modal>
    </div>
  );
}

function Field({ label, type = "text", error, inputProps }) {
  return (
    <div>
      <label className="mb-1 block text-sm font-medium text-gray-700">{label}</label>
      <input type={type} {...inputProps} className="w-full rounded-lg border border-[#E5E7EB] px-3 py-2 text-sm outline-none focus:border-[#C81E5C]" />
      {error && <p className="mt-1 text-xs text-red-500">{error.message}</p>}
    </div>
  );
}
