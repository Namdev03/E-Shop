import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "../../services/axiosInstance.js";
import { getErrorMessage } from "../../utils/getErrorMessage.js";

export const fetchCart = createAsyncThunk("cart/fetch", async (_, { rejectWithValue }) => {
  try {
    const { data } = await axiosInstance.get("/cart");
    return data;
  } catch (error) {
    return rejectWithValue(getErrorMessage(error));
  }
});

export const addToCart = createAsyncThunk(
  "cart/add",
  async ({ productId, quantity = 1, color, size }, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.post("/cart/items", { productId, quantity, color, size });
      return data;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

export const updateCartItemQuantity = createAsyncThunk(
  "cart/updateQuantity",
  async ({ productId, quantity }, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.patch(`/cart/items/${productId}`, { quantity });
      return data;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

export const removeCartItem = createAsyncThunk(
  "cart/removeItem",
  async (productId, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.delete(`/cart/items/${productId}`);
      return data;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

export const clearCart = createAsyncThunk("cart/clear", async (_, { rejectWithValue }) => {
  try {
    await axiosInstance.delete("/cart");
  } catch (error) {
    return rejectWithValue(getErrorMessage(error));
  }
});

export const applyCoupon = createAsyncThunk(
  "cart/applyCoupon",
  async (code, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.post("/cart/coupon", { code });
      return data;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

const initialState = {
  cart: { items: [] },
  totals: { subtotal: 0, discount: 0, shippingCharge: 0, tax: 0, grandTotal: 0 },
  loading: false,
  error: null,
};

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchCart.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchCart.fulfilled, (state, action) => {
        state.loading = false;
        state.cart = action.payload.data.cart;
        state.totals = action.payload.data.totals;
      })
      .addCase(fetchCart.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(addToCart.fulfilled, (state, action) => {
        state.cart = action.payload.data.cart;
      })
      .addCase(updateCartItemQuantity.fulfilled, (state, action) => {
        state.cart = action.payload.data.cart;
      })
      .addCase(removeCartItem.fulfilled, (state, action) => {
        state.cart = action.payload.data.cart;
      })
      .addCase(clearCart.fulfilled, (state) => {
        state.cart = { items: [] };
        state.totals = initialState.totals;
      })
      .addCase(applyCoupon.fulfilled, (state, action) => {
        state.cart = action.payload.data.cart;
        state.totals = action.payload.data.totals;
      });
  },
});

export default cartSlice.reducer;
