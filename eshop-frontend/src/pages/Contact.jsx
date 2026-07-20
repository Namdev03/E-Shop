import { useForm } from "react-hook-form";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import { Mail, Phone, MapPin, Clock } from "lucide-react";
import { submitContactForm } from "../redux/slices/contactSlice.js";

export function Contact() {
  const dispatch = useDispatch();
  const { loading } = useSelector((state) => state.contact);
  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  const onSubmit = async (formData) => {
    const result = await dispatch(submitContactForm(formData));
    if (result.meta.requestStatus === "fulfilled") {
      toast.success("Message sent! We'll get back to you soon.");
      reset();
    } else {
      toast.error(result.payload || "Failed to send message");
    }
  };

  return (
    <div className="mx-auto max-w-5xl px-6 py-16 lg:px-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-[#101828]">Get in touch</h1>
        <p className="mt-2 text-gray-500">Questions about an order or your account? We're here to help.</p>
      </div>

      <div className="mt-12 grid grid-cols-1 gap-10 lg:grid-cols-5">
        <div className="space-y-6 lg:col-span-2">
          <Info icon={Mail} label="Email" value="support@eshop.com" />
          <Info icon={Phone} label="Phone" value="+91 98765 43210" />
          <Info icon={MapPin} label="Office" value="Bengaluru, Karnataka, India" />
          <Info icon={Clock} label="Working Hours" value="Mon–Sat, 9am–7pm IST" />
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 lg:col-span-3">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Name" error={errors.name} inputProps={register("name", { required: "Required" })} />
            <Field label="Email" type="email" error={errors.email} inputProps={register("email", { required: "Required" })} />
          </div>
          <Field label="Phone (optional)" inputProps={register("phone")} />
          <Field label="Subject" error={errors.subject} inputProps={register("subject", { required: "Required" })} />
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Message</label>
            <textarea rows={5} {...register("message", { required: "Message is required" })} className="w-full rounded-lg border border-[#E5E7EB] px-3 py-2 text-sm outline-none focus:border-[#C81E5C]" />
            {errors.message && <p className="mt-1 text-xs text-red-500">{errors.message.message}</p>}
          </div>
          <button type="submit" disabled={loading} className="w-full rounded-lg bg-[#101828] py-3 text-sm font-semibold text-white hover:bg-[#C81E5C] disabled:opacity-60 sm:w-auto sm:px-8">
            {loading ? "Sending..." : "Send Message"}
          </button>
        </form>
      </div>
    </div>
  );
}

function Info({ icon: Icon, label, value }) {
  return (
    <div className="flex items-start gap-3">
      <div className="rounded-full bg-[#C81E5C]/10 p-2.5"><Icon size={18} className="text-[#C81E5C]" /></div>
      <div><p className="text-sm text-gray-500">{label}</p><p className="font-medium text-[#101828]">{value}</p></div>
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
