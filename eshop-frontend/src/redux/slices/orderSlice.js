import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "../../services/axiosInstance.js";
import { getErrorMessage } from "../../utils/getErrorMessage.js";

export const placeOrder = createAsyncThunk(
  "order/place",
  async ({ addressId, paymentMethod }, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.post("/orders", { addressId, paymentMethod });
      return data;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

export const fetchUserOrders = createAsyncThunk(
  "order/fetchUserOrders",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.get("/orders");
      return data;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

export const fetchOrderById = createAsyncThunk(
  "order/fetchById",
  async (id, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.get(`/orders/${id}`);
      return data;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

export const cancelOrder = createAsyncThunk(
  "order/cancel",
  async (id, { rejectWithValue }) => {
    try {
      await axiosInstance.patch(`/orders/${id}/cancel`);
      return id;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

export const requestReturn = createAsyncThunk(
  "order/requestReturn",
  async ({ id, reason }, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.post(`/orders/${id}/return`, { reason });
      return data;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

export const reorder = createAsyncThunk(
  "order/reorder",
  async (id, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.post(`/orders/${id}/reorder`);
      return data;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

export const fetchSellerOrderItems = createAsyncThunk(
  "order/fetchSellerOrderItems",
  async (status, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.get("/seller/order-items", { params: { status } });
      return data;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

export const updateOrderItemStatus = createAsyncThunk(
  "order/updateItemStatus",
  async ({ id, status }, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.patch(`/seller/order-items/${id}/status`, { status });
      return data;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

const initialState = {
  userOrders: [],
  currentOrder: null,
  sellerOrderItems: [],
  loading: false,
  error: null,
};

const orderSlice = createSlice({
  name: "order",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(placeOrder.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(placeOrder.fulfilled, (state, action) => {
        state.loading = false;
        state.userOrders.unshift(action.payload.data.order);
      })
      .addCase(placeOrder.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchUserOrders.fulfilled, (state, action) => {
        state.userOrders = action.payload.data.orders;
      })
      .addCase(fetchOrderById.fulfilled, (state, action) => {
        state.currentOrder = action.payload.data.order;
      })
      .addCase(cancelOrder.fulfilled, (state, action) => {
        state.userOrders = state.userOrders.map((o) =>
          o._id === action.payload ? { ...o, items: o.items.map((i) => ({ ...i, status: "Cancelled" })) } : o
        );
      })
      .addCase(fetchSellerOrderItems.fulfilled, (state, action) => {
        state.sellerOrderItems = action.payload.data.items;
      })
      .addCase(updateOrderItemStatus.fulfilled, (state, action) => {
        const updated = action.payload.data.orderItem;
        state.sellerOrderItems = state.sellerOrderItems.map((i) =>
          i._id === updated._id ? updated : i
        );
      });
  },
});

export default orderSlice.reducer;
