import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "../../services/axiosInstance.js";
import { getErrorMessage } from "../../utils/getErrorMessage.js";
import {
  setAuthenticated,
  setRequiresMobileVerification,
  clearAuthenticated,
} from "./authSlice.js";
import { setStoredRole, clearStoredRole } from "../../utils/authStorage.js";

export const signupSeller = createAsyncThunk(
  "seller/signup",
  async (formData, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.post("/seller/signup", formData);
      return data;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

export const loginSeller = createAsyncThunk(
  "seller/login",
  async (credentials, { dispatch, rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.post("/seller/login", credentials);
      setStoredRole("seller");

      if (data.data.requiresMobileVerification) {
        dispatch(setRequiresMobileVerification({ role: "seller" }));
      } else {
        dispatch(setAuthenticated({ role: "seller" }));
      }
      return data;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

export const sendSellerOtp = createAsyncThunk(
  "seller/sendOtp",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.post("/seller/send-otp");
      return data;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

export const resendSellerOtp = createAsyncThunk(
  "seller/resendOtp",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.post("/seller/resend-otp");
      return data;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

export const verifySellerOtp = createAsyncThunk(
  "seller/verifyOtp",
  async ({ code, rememberMe }, { dispatch, rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.post("/seller/verify-otp", { code, rememberMe });
      dispatch(setAuthenticated({ role: "seller" }));
      return data;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

export const logoutSeller = createAsyncThunk(
  "seller/logout",
  async (_, { dispatch, rejectWithValue }) => {
    try {
      await axiosInstance.post("/seller/logout");
      dispatch(clearAuthenticated());
      clearStoredRole();
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

export const fetchSellerProfile = createAsyncThunk(
  "seller/fetchProfile",
  async (_, { dispatch, rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.get("/seller/profile");
      dispatch(setAuthenticated({ role: "seller" }));
      return data;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

export const fetchSellerDashboardStats = createAsyncThunk(
  "seller/fetchDashboardStats",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.get("/seller/dashboard/stats");
      return data;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

export const fetchRevenueReport = createAsyncThunk(
  "seller/fetchRevenueReport",
  async (period = "monthly", { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.get("/seller/dashboard/revenue-report", {
        params: { period },
      });
      return data;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

export const fetchTopProducts = createAsyncThunk(
  "seller/fetchTopProducts",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.get("/seller/dashboard/top-products");
      return data;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

const initialState = {
  profile: null,
  stats: { totalProducts: 0, publishedProducts: 0, totalOrders: 0, totalCustomers: 0, revenue: 0 },
  revenueReport: [],
  topProducts: [],
  loading: false,
  error: null,
};

const sellerSlice = createSlice({
  name: "seller",
  initialState,
  reducers: {
    resetSellerState: () => initialState,
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginSeller.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginSeller.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(loginSeller.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(signupSeller.rejected, (state, action) => {
        state.error = action.payload;
      })
      .addCase(verifySellerOtp.fulfilled, (state, action) => {
        state.profile = action.payload.data.seller;
      })
      .addCase(fetchSellerProfile.fulfilled, (state, action) => {
        state.profile = action.payload.data.seller;
      })
      .addCase(fetchSellerProfile.rejected, (state) => {
        state.profile = null;
      })
      .addCase(fetchSellerDashboardStats.fulfilled, (state, action) => {
        state.stats = action.payload.data;
      })
      .addCase(fetchRevenueReport.fulfilled, (state, action) => {
        state.revenueReport = action.payload.data.report;
      })
      .addCase(fetchTopProducts.fulfilled, (state, action) => {
        state.topProducts = action.payload.data.products;
      })
      .addCase(logoutSeller.fulfilled, () => initialState);
  },
});

export const { resetSellerState } = sellerSlice.actions;
export default sellerSlice.reducer;
