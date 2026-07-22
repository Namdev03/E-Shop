import axios from "axios";

const axiosInstance = axios.create({
  baseURL: "https://e-shop-hopu.onrender.com/api" || "http://localhost:5000/api",
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
});

// Prevents a stampede of parallel refresh calls if several requests
// fail with an expired token at the same moment — only one refresh
// request is ever in flight; everyone else waits on it.
let refreshPromise = null;

const getRefreshEndpoint = (role) =>
  role === "seller" ? "/seller/refresh-token" : "/user/refresh-token";

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const isTokenExpired = error.response?.data?.code === "TOKEN_EXPIRED";
    const isRefreshCall = originalRequest.url?.includes("refresh-token");

    if (isTokenExpired && !originalRequest._retry && !isRefreshCall) {
      originalRequest._retry = true;

      try {
        // Role isn't known to Axios directly — read it from localStorage,
        // the same lightweight signal used across the app (see authStorage.js).
        const role = localStorage.getItem("eshop_role") || "user";

        if (!refreshPromise) {
          refreshPromise = axiosInstance
            .post(getRefreshEndpoint(role))
            .finally(() => {
              refreshPromise = null;
            });
        }

        await refreshPromise;
        return axiosInstance(originalRequest);
      } catch (refreshError) {
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
