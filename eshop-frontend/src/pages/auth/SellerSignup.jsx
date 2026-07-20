import { useForm } from "react-hook-form";
import { useDispatch } from "react-redux";
import { useNavigate, Link } from "react-router";
import { toast } from "react-toastify";
import { Store, User, Mail, Phone, Lock, Building2 } from "lucide-react";
import { signupSeller } from "../../redux/slices/sellerSlice.js";

export function SellerSignup() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { register, handleSubmit, watch, formState: { errors, isSubmitting } } = useForm();
  const password = watch("password");

  const onSubmit = async (formData) => {
    const result = await dispatch(signupSeller(formData));
    if (result.meta.requestStatus === "fulfilled") {
      toast.success("Store created! Check your email to verify, then log in.");
      navigate("/seller/login");
    } else {
      toast.error(result.payload || "Signup failed");
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-64px)] items-center justify-center bg-[#FAFAFA] px-4 py-12">
      <div className="w-full max-w-md rounded-2xl border border-[#E5E7EB] bg-white p-8 shadow-sm">
        <div className="mb-6 text-center">
          <Store className="mx-auto mb-2 text-[#101828]" size={32} />
          <h1 className="text-2xl font-bold text-[#101828]">Start Selling on E-Shop</h1>
          <p className="mt-1 text-sm text-gray-500">Set up your store in minutes</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Field icon={Building2} label="Store Name" error={errors.storeName} inputProps={register("storeName", { required: "Store name is required" })} placeholder="Acme Store" />
          <Field icon={User} label="Your Name" error={errors.fullName} inputProps={register("fullName", { required: "Full name is required" })} placeholder="Jane Doe" />
          <Field icon={Mail} label="Email" type="email" error={errors.email} inputProps={register("email", { required: "Email is required" })} placeholder="you@example.com" />
          <Field icon={Phone} label="Phone Number" error={errors.phone} inputProps={register("phone", { required: "Phone number is required" })} placeholder="+91 98765 43210" />
          <Field
            icon={Lock}
            label="Password"
            type="password"
            error={errors.password}
            inputProps={register("password", { required: "Password is required" })}
            placeholder="At least 8 characters, mixed case, number, symbol"
          />
          <Field
            icon={Lock}
            label="Confirm Password"
            type="password"
            error={errors.confirmPassword}
            inputProps={register("confirmPassword", {
              required: "Please confirm your password",
              validate: (v) => v === password || "Passwords do not match",
            })}
            placeholder="••••••••"
          />

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-lg bg-[#101828] py-2.5 text-sm font-semibold text-white transition hover:bg-[#C81E5C] disabled:opacity-60"
          >
            {isSubmitting ? "Creating store..." : "Create Store"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-500">
          Already a seller?{" "}
          <Link to="/seller/login" className="font-semibold text-[#101828] hover:underline">Log in</Link>
        </p>
      </div>
    </div>
  );
}

function Field({ icon: Icon, label, type = "text", error, inputProps, placeholder }) {
  return (
    <div>
      <label className="mb-1 block text-sm font-medium text-gray-700">{label}</label>
      <div className="relative">
        <Icon size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type={type}
          {...inputProps}
          placeholder={placeholder}
          className="w-full rounded-lg border border-[#E5E7EB] py-2.5 pl-10 pr-4 text-sm outline-none focus:border-[#101828]"
        />
      </div>
      {error && <p className="mt-1 text-xs text-red-500">{error.message}</p>}
    </div>
  );
}
