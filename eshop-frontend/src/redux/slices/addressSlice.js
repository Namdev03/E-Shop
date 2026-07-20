import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "../../services/axiosInstance.js";
import { getErrorMessage } from "../../utils/getErrorMessage.js";

export const fetchAddresses = createAsyncThunk(
  "address/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.get("/addresses");
      return data;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

export const addAddress = createAsyncThunk(
  "address/add",
  async (addressData, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.post("/addresses", addressData);
      return data;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

export const updateAddress = createAsyncThunk(
  "address/update",
  async ({ id, addressData }, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.patch(`/addresses/${id}`, addressData);
      return data;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

export const deleteAddress = createAsyncThunk(
  "address/delete",
  async (id, { rejectWithValue }) => {
    try {
      await axiosInstance.delete(`/addresses/${id}`);
      return id;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

const initialState = { list: [], loading: false, error: null };

const addressSlice = createSlice({
  name: "address",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchAddresses.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchAddresses.fulfilled, (state, action) => {
        state.loading = false;
        state.list = action.payload.data.addresses;
      })
      .addCase(fetchAddresses.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(addAddress.fulfilled, (state, action) => {
        state.list.unshift(action.payload.data.address);
      })
      .addCase(updateAddress.fulfilled, (state, action) => {
        const updated = action.payload.data.address;
        state.list = state.list.map((a) => (a._id === updated._id ? updated : a));
      })
      .addCase(deleteAddress.fulfilled, (state, action) => {
        state.list = state.list.filter((a) => a._id !== action.payload);
      });
  },
});

export default addressSlice.reducer;
