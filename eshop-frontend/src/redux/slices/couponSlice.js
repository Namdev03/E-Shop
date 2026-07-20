import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "../../services/axiosInstance.js";
import { getErrorMessage } from "../../utils/getErrorMessage.js";

export const fetchActiveCoupons = createAsyncThunk(
  "coupon/fetchActive",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.get("/coupons/active");
      return data;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

const initialState = { list: [], loading: false };

const couponSlice = createSlice({
  name: "coupon",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchActiveCoupons.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchActiveCoupons.fulfilled, (state, action) => {
        state.loading = false;
        state.list = action.payload.data.coupons;
      })
      .addCase(fetchActiveCoupons.rejected, (state) => {
        state.loading = false;
      });
  },
});

export default couponSlice.reducer;
