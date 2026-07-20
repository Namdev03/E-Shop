import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "../../services/axiosInstance.js";
import { getErrorMessage } from "../../utils/getErrorMessage.js";

export const fetchProductReviews = createAsyncThunk(
  "review/fetchForProduct",
  async (productId, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.get(`/products/${productId}/reviews`);
      return data;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

export const addReview = createAsyncThunk(
  "review/add",
  async ({ productId, formData }, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.post(`/products/${productId}/reviews`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return data;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

const initialState = { list: [], loading: false, error: null };

const reviewSlice = createSlice({
  name: "review",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchProductReviews.fulfilled, (state, action) => {
        state.list = action.payload.data.reviews;
      })
      .addCase(addReview.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addReview.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(addReview.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default reviewSlice.reducer;
