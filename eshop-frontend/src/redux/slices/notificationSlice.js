import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "../../services/axiosInstance.js";
import { getErrorMessage } from "../../utils/getErrorMessage.js";

export const fetchNotifications = createAsyncThunk(
  "notification/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.get("/notifications");
      return data;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

export const markNotificationRead = createAsyncThunk(
  "notification/markRead",
  async (id, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.patch(`/notifications/${id}/read`);
      return data;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

const initialState = { list: [], unreadCount: 0, loading: false };

const notificationSlice = createSlice({
  name: "notification",
  initialState,
  reducers: {
    receiveLiveNotification: (state, action) => {
      state.list.unshift(action.payload);
      state.unreadCount += 1;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchNotifications.fulfilled, (state, action) => {
        state.list = action.payload.data.notifications;
        state.unreadCount = state.list.filter((n) => !n.isRead).length;
      })
      .addCase(markNotificationRead.fulfilled, (state, action) => {
        const updated = action.payload.data.notification;
        state.list = state.list.map((n) => (n._id === updated._id ? updated : n));
        state.unreadCount = state.list.filter((n) => !n.isRead).length;
      });
  },
});

export const { receiveLiveNotification } = notificationSlice.actions;
export default notificationSlice.reducer;
