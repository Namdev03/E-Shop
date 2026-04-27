import React from "react";
import { useForm } from "react-hook-form";
import axiosInstance from "../Service/AxiosInstance";

import { Link, useNavigate } from "react-router";
import pagepath from "../PagePaths/pagePath";
function Login() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm();
  const navigate = useNavigate()
  async function loginApi(payload) {
    try {
      const response = await axiosInstance.post('/user/login', payload)
      alert(response.data.message)
      navigate(pagepath.home)
    } catch (error) {
      alert(error.response.data.message)
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-r from-indigo-500 to-purple-600 px-4">
      <div className="w-full max-w-md lg:max-w-lg xl:max-w-xl bg-white rounded-2xl shadow-xl p-6 sm:p-8 md:p-10">

        <h2 className="text-2xl md:text-3xl font-bold text-center mb-6">
          Login
        </h2>

        <form onSubmit={handleSubmit(loginApi)} className="space-y-4">

          {/* Email */}
          <div>
            <input
              type="email"
              placeholder="Email"
              disabled={isSubmitting}
              className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400"
              {...register("email", {
                required: "Email is required",
                pattern: {
                  value: /^\S+@\S+$/i,
                  message: "Invalid email"
                }
              })}
            />
            {errors.email && (
              <p className="text-red-500 text-sm">{errors.email.message}</p>
            )}
          </div>

          {/* Password */}
          <div>
            <input
              type="password"
              placeholder="Password"
              disabled={isSubmitting}
              className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400"
              {...register("password", {
                required: "Password is required",
                minLength: {
                  value: 6,
                  message: "Minimum 6 characters"
                }
              })}
            />
            {errors.password && (
              <p className="text-red-500 text-sm">
                {errors.password.message}
              </p>
            )}
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={isSubmitting}
            className={`w-full p-3 text-white rounded-lg transition ${isSubmitting
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-indigo-600 hover:bg-indigo-700"
              }`}
          >
            {isSubmitting ? "Logging in..." : "Login"}
          </button>
        </form>

        <p className="text-center text-sm mt-4">
          Don't have an account?{" "}
          <Link to={pagepath.register} className="text-indigo-600 cursor-pointer">Register</Link>
        </p>
      </div>
    </div>
  );
}

export default Login;