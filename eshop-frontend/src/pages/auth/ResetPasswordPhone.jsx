import { useForm } from "react-hook-form";
import { useSearchParams, useNavigate } from "react-router";
import { toast } from "react-toastify";
import { Lock, Hash } from "lucide-react";
import axiosInstance from "../../services/axiosInstance.js";
import { getErrorMessage } from "../../utils/getErrorMessage.js";

export function ResetPasswordPhone({ role = "user" }) {
  const [searchParams] = useSearchParams();
  const accountId = searchParams.get("accountId");
  const navigate = useNavigate();
  const { register, handleSubmit, watch, formState: { errors, isSubmitting } } = useForm();
  const password = watch("password");

  const base = role === "seller" ? "/seller" : "/user";
  const loginPath = role === "seller" ? "/seller/login" : "/login";

  const onSubmit = async ({ code, password }) => {
    if (!accountId) {
      toast.error("Missing account reference — please restart the forgot password flow");
      return;
    }
    try {
      const { data } = await axiosInstance.post(`${base}/reset-password/phone`, {
        accountId, code, password,
      });
      toast.success(data.message);
      navigate(loginPath);
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-64px)] items-center justify-center bg-[#FAFAFA] px-4 py-12">
      <div className="w-full max-w-md rounded-2xl border border-[#E5E7EB] bg-white p-8 shadow-sm">
        <h1 className="mb-2 text-center text-2xl font-bold text-[#101828]">Reset via OTP</h1>
        <p className="mb-6 text-center text-sm text-gray-500">Enter the code sent to your phone and your new password</p>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Field icon={Hash} label="OTP Code" error={errors.code} inputProps={register("code", { required: "Required" })} />
          <Field icon={Lock} label="New Password" type="password" error={errors.password} inputProps={register("password", { required: "Required", minLength: { value: 8, message: "At least 8 characters" } })} />
          <Field
            icon={Lock}
            label="Confirm Password"
            type="password"
            error={errors.confirmPassword}
            inputProps={register("confirmPassword", { required: "Required", validate: (v) => v === password || "Passwords do not match" })}
          />
          <button type="submit" disabled={isSubmitting} className="w-full rounded-lg bg-[#101828] py-2.5 text-sm font-semibold text-white hover:bg-[#C81E5C] disabled:opacity-60">
            {isSubmitting ? "Resetting..." : "Reset Password"}
          </button>
        </form>
      </div>
    </div>
  );
}

function Field({ icon: Icon, label, type = "text", error, inputProps }) {
  return (
    <div>
      <label className="mb-1 block text-sm font-medium text-gray-700">{label}</label>
      <div className="relative">
        <Icon size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input type={type} {...inputProps} className="w-full rounded-lg border border-[#E5E7EB] py-2.5 pl-10 pr-4 text-sm outline-none focus:border-[#C81E5C]" />
      </div>
      {error && <p className="mt-1 text-xs text-red-500">{error.message}</p>}
    </div>
  );
}
