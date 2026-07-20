import { useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate, Link } from "react-router";
import { toast } from "react-toastify";
import { Mail, Phone, ArrowLeft } from "lucide-react";
import axiosInstance from "../../services/axiosInstance.js";
import { getErrorMessage } from "../../utils/getErrorMessage.js";

export function ForgotPassword({ role = "user" }) {
  const [channel, setChannel] = useState("email");
  const [emailSent, setEmailSent] = useState(false);
  const navigate = useNavigate();
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm();

  const base = role === "seller" ? "/seller" : "/user";
  const loginPath = role === "seller" ? "/seller/login" : "/login";

  const onSubmit = async (formData) => {
    try {
      if (channel === "email") {
        const { data } = await axiosInstance.post(`${base}/forgot-password/email`, {
          email: formData.emailOrPhone,
        });
        toast.success(data.message);
        setEmailSent(true);
      } else {
        const { data } = await axiosInstance.post(`${base}/forgot-password/phone`, {
          phone: formData.emailOrPhone,
        });
        toast.success(data.message);
        // Carry accountId + role forward for the OTP-based reset step
        navigate(
          `${role === "seller" ? "/seller" : ""}/reset-password/phone?accountId=${data.data.accountId || ""}`
        );
      }
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-64px)] items-center justify-center bg-[#FAFAFA] px-4 py-12">
      <div className="w-full max-w-md rounded-2xl border border-[#E5E7EB] bg-white p-8 shadow-sm">
        <Link to={loginPath} className="mb-4 flex items-center gap-1 text-sm text-gray-500 hover:text-[#101828]">
          <ArrowLeft size={14} /> Back to login
        </Link>

        <div className="mb-6 text-center">
          <h1 className="text-2xl font-bold text-[#101828]">Forgot password?</h1>
          <p className="mt-1 text-sm text-gray-500">Choose how you'd like to reset it</p>
        </div>

        {emailSent ? (
          <div className="rounded-lg bg-[#C81E5C]/10 p-4 text-center text-sm text-[#C81E5C]">
            If an account exists, a reset link has been sent to your email.
          </div>
        ) : (
          <>
            <div className="mb-6 flex rounded-full bg-gray-100 p-1">
              {[
                { value: "email", label: "Email", icon: Mail },
                { value: "phone", label: "Phone", icon: Phone },
              ].map((c) => (
                <button
                  key={c.value}
                  type="button"
                  onClick={() => setChannel(c.value)}
                  className={`flex flex-1 items-center justify-center gap-1.5 rounded-full py-2 text-sm font-semibold transition ${
                    channel === c.value ? "bg-[#101828] text-white shadow" : "text-gray-500"
                  }`}
                >
                  <c.icon size={14} /> {c.label}
                </button>
              ))}
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  {channel === "email" ? "Email" : "Phone Number"}
                </label>
                <input
                  type={channel === "email" ? "email" : "tel"}
                  {...register("emailOrPhone", { required: "This field is required" })}
                  className="w-full rounded-lg border border-[#E5E7EB] px-3 py-2.5 text-sm outline-none focus:border-[#C81E5C]"
                />
                {errors.emailOrPhone && <p className="mt-1 text-xs text-red-500">{errors.emailOrPhone.message}</p>}
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full rounded-lg bg-[#101828] py-2.5 text-sm font-semibold text-white hover:bg-[#C81E5C] disabled:opacity-60"
              >
                {isSubmitting ? "Sending..." : channel === "email" ? "Send Reset Link" : "Send OTP"}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
