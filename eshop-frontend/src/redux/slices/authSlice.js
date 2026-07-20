import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  isLoggedIn: false,
  role: null, // "user" | "seller" | null
  authChecked: false,
  requiresMobileVerification: false,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setAuthenticated: (state, action) => {
      state.isLoggedIn = true;
      state.role = action.payload.role;
      state.authChecked = true;
      state.requiresMobileVerification = false;
    },
    setRequiresMobileVerification: (state, action) => {
      state.role = action.payload.role;
      state.requiresMobileVerification = true;
      state.authChecked = true;
    },
    clearAuthenticated: (state) => {
      state.isLoggedIn = false;
      state.role = null;
      state.authChecked = true;
      state.requiresMobileVerification = false;
    },
    setAuthChecked: (state) => {
      state.authChecked = true;
    },
  },
});

export const {
  setAuthenticated,
  setRequiresMobileVerification,
  clearAuthenticated,
  setAuthChecked,
} = authSlice.actions;
export default authSlice.reducer;
