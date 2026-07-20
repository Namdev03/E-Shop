import { useEffect, useState } from "react";
import { useParams, Link } from "react-router";
import { CheckCircle, XCircle } from "lucide-react";
import axiosInstance from "../../services/axiosInstance.js";
import { getErrorMessage } from "../../utils/getErrorMessage.js";
import { Loader } from "../../components/Loader.jsx";

export function VerifyEmail({ role = "user" }) {
  const { token } = useParams();
  const [status, setStatus] = useState("loading");
  const [message, setMessage] = useState("");

  const base = role === "seller" ? "/seller" : "/user";
  const loginPath = role === "seller" ? "/seller/login" : "/login";

  useEffect(() => {
    axiosInstance
      .post(`${base}/verify-email/${token}`)
      .then(({ data }) => {
        setStatus("success");
        setMessage(data.message);
      })
      .catch((error) => {
        setStatus("error");
        setMessage(getErrorMessage(error));
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  if (status === "loading") return <Loader fullScreen label="Verifying your email..." />;

  return (
    <div className="flex min-h-[calc(100vh-64px)] items-center justify-center bg-[#FAFAFA] px-4 py-12">
      <div className="w-full max-w-md rounded-2xl border border-[#E5E7EB] bg-white p-8 text-center shadow-sm">
        {status === "success" ? (
          <CheckCircle className="mx-auto mb-3 text-green-600" size={40} />
        ) : (
          <XCircle className="mx-auto mb-3 text-red-500" size={40} />
        )}
        <h1 className="text-xl font-bold text-[#101828]">
          {status === "success" ? "Email Verified" : "Verification Failed"}
        </h1>
        <p className="mt-2 text-sm text-gray-500">{message}</p>
        <Link to={loginPath} className="mt-6 inline-block rounded-full bg-[#101828] px-6 py-2.5 text-sm font-semibold text-white hover:bg-[#C81E5C]">
          Go to Login
        </Link>
      </div>
    </div>
  );
}
