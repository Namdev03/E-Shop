import React from "react";
import { useForm } from "react-hook-form";
import axiosInstance from "../Service/AxiosInstance";
import { Link, useNavigate } from "react-router";
import pagepath from "../PagePaths/pagePath";

function Register() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm();
  const navigate = useNavigate()
async function registerApi(payload) {
  try {
    const response = await axiosInstance.post('/user/',payload)
    alert(response.data.message)
    navigate(pagepath.login)
  } catch (error) {
    alert(error.response.data.message)
  }
}

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-r from-purple-500 to-indigo-600 px-4">
      <div className="w-full max-w-md lg:max-w-lg xl:max-w-xl bg-white rounded-2xl shadow-xl p-6 sm:p-8 md:p-10">

        <h2 className="text-2xl md:text-3xl font-bold text-center mb-6">
          Register
        </h2>

        <form onSubmit={handleSubmit(registerApi)} className="space-y-4">

          {/* Name */}
          <div>
            <input
              type="text"
              placeholder="Name"
              disabled={isSubmitting}
              className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400"
              {...register("name", {
                required: "Name is required"
              })}
            />
            {errors.name && (
              <p className="text-red-500 text-sm">{errors.name.message}</p>
            )}
          </div>

          {/* Email */}
          <div>
            <input
              type="email"
              placeholder="Email"
              disabled={isSubmitting}
              className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400"
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
              className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400"
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
            className={`w-full p-3 text-white rounded-lg transition ${
              isSubmitting
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-purple-600 hover:bg-purple-700"
            }`}
          >
            {isSubmitting ? "Registering..." : "Register"}
          </button>
        </form>

        {/* Footer */}
        <p className="text-center text-sm mt-4">
          Already have an account?{" "}
          <Link to={pagepath.login} className="text-purple-600 cursor-pointer">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}

export default Register;