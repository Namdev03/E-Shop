import { useState } from "react";
import { useForm } from "react-hook-form";
import { useDispatch } from "react-redux";
import { useNavigate, Link, useLocation } from "react-router";
import { toast } from "react-toastify";
import { Mail, Lock, ShoppingBag } from "lucide-react";
import { loginUser } from "../../redux/slices/userSlice.js";

export function Login() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const [rememberMe, setRememberMe] = useState(false);

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm();

  const onSubmit = async (formData) => {
    const result = await dispatch(loginUser({ ...formData, rememberMe }));

    if (result.meta.requestStatus === "fulfilled") {
      if (result.payload.data.requiresMobileVerification) {
        toast.info("Please verify your mobile number to continue");
        navigate("/verify-mobile");
      } else {
        toast.success(result.payload.message);
        navigate(location.state?.from?.pathname || "/");
      }
    } else {
      toast.error(result.payload || "Login failed");
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-64px)] items-center justify-center bg-[#FAFAFA] px-4 py-12">
      <div className="w-full max-w-md rounded-2xl border border-[#E5E7EB] bg-white p-8 shadow-sm">
        <div className="mb-6 text-center">
          <ShoppingBag className="mx-auto mb-2 text-[#C81E5C]" size={32} />
          <h1 className="text-2xl font-bold text-[#101828]">Welcome back</h1>
          <p className="mt-1 text-sm text-gray-500">Log in to continue shopping</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Email or Phone</label>
            <div className="relative">
              <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                {...register("emailOrPhone", { required: "Email or phone is required" })}
                placeholder="you@example.com or +91..."
                className="w-full rounded-lg border border-[#E5E7EB] py-2.5 pl-10 pr-4 text-sm outline-none focus:border-[#C81E5C] focus:ring-2 focus:ring-[#C81E5C]/15"
              />
            </div>
            {errors.emailOrPhone && <p className="mt-1 text-xs text-red-500">{errors.emailOrPhone.message}</p>}
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Password</label>
            <div className="relative">
              <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="password"
                {...register("password", { required: "Password is required" })}
                placeholder="••••••••"
                className="w-full rounded-lg border border-[#E5E7EB] py-2.5 pl-10 pr-4 text-sm outline-none focus:border-[#C81E5C] focus:ring-2 focus:ring-[#C81E5C]/15"
              />
            </div>
            {errors.password && <p className="mt-1 text-xs text-red-500">{errors.password.message}</p>}
          </div>

          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 text-sm text-gray-600">
              <input type="checkbox" checked={rememberMe} onChange={(e) => setRememberMe(e.target.checked)} />
              Remember me
            </label>
            <Link to="/forgot-password" className="text-xs font-medium text-[#C81E5C] hover:underline">
              Forgot password?
            </Link>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-lg bg-[#101828] py-2.5 text-sm font-semibold text-white transition hover:bg-[#C81E5C] disabled:opacity-60"
          >
            {isSubmitting ? "Logging in..." : "Log in"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-500">
          Don't have an account?{" "}
          <Link to="/signup" className="font-semibold text-[#C81E5C] hover:underline">Sign up</Link>
        </p>
        <p className="mt-2 text-center text-sm text-gray-500">
          Want to sell on E-Shop?{" "}
          <Link to="/seller/login" className="font-semibold text-[#101828] hover:underline">Seller login</Link>
        </p>
      </div>
    </div>
  );
}
