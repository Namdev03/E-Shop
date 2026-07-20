import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "../../services/axiosInstance.js";
import { getErrorMessage } from "../../utils/getErrorMessage.js";

export const fetchProducts = createAsyncThunk(
  "product/fetchAll",
  async (filters = {}, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.get("/products", { params: filters });
      return data;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

export const fetchProductBySlug = createAsyncThunk(
  "product/fetchBySlug",
  async (slug, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.get(`/products/${slug}`);
      return data;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

export const fetchSearchSuggestions = createAsyncThunk(
  "product/fetchSearchSuggestions",
  async (q, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.get("/products/search-suggestions", { params: { q } });
      return data;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

export const fetchSellerProducts = createAsyncThunk(
  "product/fetchSellerProducts",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.get("/seller/products");
      return data;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

export const createProduct = createAsyncThunk(
  "product/create",
  async (formData, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.post("/products", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return data;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

export const updateProduct = createAsyncThunk(
  "product/update",
  async ({ id, formData }, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.patch(`/products/${id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return data;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

export const deleteProduct = createAsyncThunk(
  "product/delete",
  async (id, { rejectWithValue }) => {
    try {
      await axiosInstance.delete(`/products/${id}`);
      return id;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

export const setProductStatus = createAsyncThunk(
  "product/setStatus",
  async ({ id, status }, { rejectWithValue }) => {
    try {
      const endpoint = status === "Published" ? "publish" : "draft";
      const { data } = await axiosInstance.patch(`/products/${id}/${endpoint}`);
      return data;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

const initialState = {
  list: [],
  pagination: { total: 0, page: 1, limit: 20, totalPages: 0 },
  current: null,
  relatedProducts: [],
  searchSuggestions: [],
  sellerProducts: [],
  loading: false,
  error: null,
};

const productSlice = createSlice({
  name: "product",
  initialState,
  reducers: {
    clearCurrentProduct: (state) => {
      state.current = null;
      state.relatedProducts = [];
    },
    clearSearchSuggestions: (state) => {
      state.searchSuggestions = [];
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProducts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.loading = false;
        state.list = action.payload.data.products;
        state.pagination = action.payload.data.pagination;
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchProductBySlug.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchProductBySlug.fulfilled, (state, action) => {
        state.loading = false;
        state.current = action.payload.data.product;
        state.relatedProducts = action.payload.data.relatedProducts;
      })
      .addCase(fetchProductBySlug.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchSearchSuggestions.fulfilled, (state, action) => {
        state.searchSuggestions = action.payload.data.suggestions;
      })
      .addCase(fetchSellerProducts.fulfilled, (state, action) => {
        state.sellerProducts = action.payload.data.products;
      })
      .addCase(createProduct.fulfilled, (state, action) => {
        state.sellerProducts.unshift(action.payload.data.product);
      })
      .addCase(updateProduct.fulfilled, (state, action) => {
        const updated = action.payload.data.product;
        state.sellerProducts = state.sellerProducts.map((p) =>
          p._id === updated._id ? updated : p
        );
      })
      .addCase(setProductStatus.fulfilled, (state, action) => {
        const updated = action.payload.data.product;
        state.sellerProducts = state.sellerProducts.map((p) =>
          p._id === updated._id ? updated : p
        );
      })
      .addCase(deleteProduct.fulfilled, (state, action) => {
        state.sellerProducts = state.sellerProducts.filter((p) => p._id !== action.payload);
      });
  },
});

export const { clearCurrentProduct, clearSearchSuggestions } = productSlice.actions;
export default productSlice.reducer;
