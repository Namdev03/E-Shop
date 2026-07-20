import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router";
import { toast } from "react-toastify";
import { ShieldCheck, HelpCircle } from "lucide-react";
import { sendUserOtp, resendUserOtp, verifyUserOtp } from "../../redux/slices/userSlice.js";
import { sendSellerOtp, resendSellerOtp, verifySellerOtp } from "../../redux/slices/sellerSlice.js";

const OTP_LENGTH = 6;
const RESEND_COOLDOWN = 30;

export function VerifyMobile() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { role } = useSelector((state) => state.auth);

  const [otp, setOtp] = useState(Array(OTP_LENGTH).fill(""));
  const inputRefs = useRef([]);
  const [timer, setTimer] = useState(RESEND_COOLDOWN);
  const [isDisabled, setIsDisabled] = useState(true);
  const [verifying, setVerifying] = useState(false);
  const [resending, setResending] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const hasAutoSubmitted = useRef(false);

  const sendAction = () => (role === "seller" ? sendSellerOtp() : sendUserOtp());
  const resendAction = () => (role === "seller" ? resendSellerOtp() : resendUserOtp());
  const verifyAction = (code) =>
    role === "seller"
      ? verifySellerOtp({ code, rememberMe: true })
      : verifyUserOtp({ code, rememberMe: true });

  useEffect(() => {
    dispatch(sendAction()).then((result) => {
      if (result.meta.requestStatus === "rejected") {
        toast.error(result.payload || "Failed to send OTP");
        setIsDisabled(false);
        setTimer(0);
      }
    });
    inputRefs.current[0]?.focus();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!isDisabled) return;
    const interval = setInterval(() => {
      setTimer((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setIsDisabled(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [isDisabled]);

  const handleChange = (value, index) => {
    if (!/^\d?$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    if (value && index < otp.length - 1) inputRefs.current[index + 1]?.focus();
  };

  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) inputRefs.current[index - 1]?.focus();
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, OTP_LENGTH);
    if (!pasted) return;
    const newOtp = Array(OTP_LENGTH).fill("");
    pasted.split("").forEach((d, i) => (newOtp[i] = d));
    setOtp(newOtp);
    inputRefs.current[Math.min(pasted.length, OTP_LENGTH - 1)]?.focus();
  };

  const submitOtp = async (code) => {
    setVerifying(true);
    const result = await dispatch(verifyAction(code));
    setVerifying(false);

    if (result.meta.requestStatus === "fulfilled") {
      toast.success("Mobile number verified successfully!");
      navigate(role === "seller" ? "/seller/dashboard" : "/", { replace: true });
    } else {
      toast.error(result.payload || "Invalid or expired OTP");
      setOtp(Array(OTP_LENGTH).fill(""));
      inputRefs.current[0]?.focus();
      hasAutoSubmitted.current = false;
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const code = otp.join("");
    if (code.length !== OTP_LENGTH) {
      toast.error(`Please enter the full ${OTP_LENGTH}-digit code`);
      return;
    }
    submitOtp(code);
  };

  useEffect(() => {
    const code = otp.join("");
    if (code.length === OTP_LENGTH && !hasAutoSubmitted.current && !verifying) {
      hasAutoSubmitted.current = true;
      submitOtp(code);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [otp]);

  const handleResend = async () => {
    setResending(true);
    const result = await dispatch(resendAction());
    setResending(false);

    if (result.meta.requestStatus === "fulfilled") {
      toast.success("A new OTP has been sent");
      setOtp(Array(OTP_LENGTH).fill(""));
      hasAutoSubmitted.current = false;
      inputRefs.current[0]?.focus();
      setTimer(RESEND_COOLDOWN);
      setIsDisabled(true);
    } else {
      toast.error(result.payload || "Failed to resend OTP");
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-64px)] items-center justify-center bg-[#FAFAFA] px-4 py-12">
      <div className="w-full max-w-md rounded-2xl border border-[#E5E7EB] bg-white p-8 shadow-sm">
        <div className="mb-6 text-center">
          <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-[#C81E5C]/10">
            <ShieldCheck className="text-[#C81E5C]" size={28} />
          </div>
          <h1 className="text-2xl font-bold text-[#101828]">Verify your mobile</h1>
          <p className="mt-2 text-sm text-gray-500">
            Enter the {OTP_LENGTH}-digit code sent to your registered mobile number
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="flex justify-center gap-2 sm:gap-3" onPaste={handlePaste}>
            {otp.map((digit, index) => (
              <input
                key={index}
                ref={(el) => (inputRefs.current[index] = el)}
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                maxLength={1}
                value={digit}
                disabled={verifying}
                onChange={(e) => handleChange(e.target.value, index)}
                onKeyDown={(e) => handleKeyDown(e, index)}
                className="h-12 w-11 rounded-xl border-2 border-[#E5E7EB] text-center text-xl font-bold text-[#101828] outline-none transition focus:border-[#C81E5C] focus:ring-2 focus:ring-[#C81E5C]/20 disabled:bg-gray-50 sm:h-16 sm:w-14 sm:text-2xl"
              />
            ))}
          </div>

          <button
            type="submit"
            disabled={verifying || otp.join("").length !== OTP_LENGTH}
            className="mt-6 w-full rounded-xl bg-[#101828] py-3 text-lg font-semibold text-white transition hover:bg-[#C81E5C] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {verifying ? "Verifying..." : "Verify OTP"}
          </button>
        </form>

        <div className="mt-5 text-center">
          <button
            type="button"
            onClick={handleResend}
            disabled={isDisabled || resending}
            className={`font-semibold transition ${
              isDisabled || resending ? "cursor-not-allowed text-gray-400" : "text-[#C81E5C] hover:text-[#a8184c]"
            }`}
          >
            {resending ? "Resending..." : isDisabled ? `Resend OTP in ${timer}s` : "Resend OTP"}
          </button>
        </div>

        <div className="mt-6 border-t border-[#E5E7EB] pt-4">
          <button
            type="button"
            onClick={() => setShowHelp((s) => !s)}
            className="mx-auto flex items-center gap-1.5 text-sm text-gray-500 hover:text-[#101828]"
          >
            <HelpCircle size={14} /> Didn't receive the code?
          </button>
          {showHelp && (
            <ul className="mt-3 list-inside list-disc space-y-1.5 text-sm text-gray-500">
              <li>Make sure your mobile number is correct on your account.</li>
              <li>SMS delivery can take up to a minute.</li>
              <li>Each code expires after 10 minutes and allows a limited number of attempts.</li>
              <li>Once the timer ends, use Resend OTP for a new code.</li>
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
