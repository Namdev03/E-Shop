import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "../../services/axiosInstance.js";
import { getErrorMessage } from "../../utils/getErrorMessage.js";

export const fetchWishlist = createAsyncThunk(
  "wishlist/fetch",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.get("/wishlist");
      return data;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

export const addToWishlist = createAsyncThunk(
  "wishlist/add",
  async (productId, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.post(`/wishlist/${productId}`);
      return data;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

export const removeFromWishlist = createAsyncThunk(
  "wishlist/remove",
  async (productId, { rejectWithValue }) => {
    try {
      await axiosInstance.delete(`/wishlist/${productId}`);
      return productId;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

export const moveToCart = createAsyncThunk(
  "wishlist/moveToCart",
  async (productId, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.post(`/wishlist/${productId}/move-to-cart`);
      return { productId, data };
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

const initialState = {
  items: [],
  loading: false,
  error: null,
};

const wishlistSlice = createSlice({
  name: "wishlist",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchWishlist.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchWishlist.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload.data.items;
      })
      .addCase(fetchWishlist.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(addToWishlist.fulfilled, (state, action) => {
        state.items.unshift(action.payload.data.item);
      })
      .addCase(removeFromWishlist.fulfilled, (state, action) => {
        state.items = state.items.filter((i) => i.product._id !== action.payload);
      })
      .addCase(moveToCart.fulfilled, (state, action) => {
        state.items = state.items.filter((i) => i.product._id !== action.payload.productId);
      });
  },
});

export default wishlistSlice.reducer;
