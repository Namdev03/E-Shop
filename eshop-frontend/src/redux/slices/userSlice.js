import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "../../services/axiosInstance.js";
import { getErrorMessage } from "../../utils/getErrorMessage.js";
import {
  setAuthenticated,
  setRequiresMobileVerification,
  clearAuthenticated,
} from "./authSlice.js";
import { setStoredRole, clearStoredRole } from "../../utils/authStorage.js";

export const signupUser = createAsyncThunk(
  "user/signup",
  async (formData, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.post("/user/signup", formData);
      return data;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

export const loginUser = createAsyncThunk(
  "user/login",
  async (credentials, { dispatch, rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.post("/user/login", credentials);
      setStoredRole("user");

      if (data.data.requiresMobileVerification) {
        dispatch(setRequiresMobileVerification({ role: "user" }));
      } else {
        dispatch(setAuthenticated({ role: "user" }));
      }
      return data;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

export const sendUserOtp = createAsyncThunk(
  "user/sendOtp",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.post("/user/send-otp");
      return data;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

export const resendUserOtp = createAsyncThunk(
  "user/resendOtp",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.post("/user/resend-otp");
      return data;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

export const verifyUserOtp = createAsyncThunk(
  "user/verifyOtp",
  async ({ code, rememberMe }, { dispatch, rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.post("/user/verify-otp", { code, rememberMe });
      dispatch(setAuthenticated({ role: "user" }));
      return data;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

export const logoutUser = createAsyncThunk(
  "user/logout",
  async (_, { dispatch, rejectWithValue }) => {
    try {
      await axiosInstance.post("/user/logout");
      dispatch(clearAuthenticated());
      clearStoredRole();
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

export const fetchUserProfile = createAsyncThunk(
  "user/fetchProfile",
  async (_, { dispatch, rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.get("/user/profile");
      dispatch(setAuthenticated({ role: "user" }));
      return data;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

const initialState = {
  profile: null,
  loading: false,
  error: null,
};

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    resetUserState: () => initialState,
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(signupUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(signupUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(signupUser.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(verifyUserOtp.fulfilled, (state, action) => {
        state.profile = action.payload.data.user;
      })
      .addCase(fetchUserProfile.fulfilled, (state, action) => {
        state.profile = action.payload.data.user;
      })
      .addCase(fetchUserProfile.rejected, (state) => {
        state.profile = null;
      })
      .addCase(logoutUser.fulfilled, () => initialState);
  },
});

export const { resetUserState } = userSlice.actions;
export default userSlice.reducer;
