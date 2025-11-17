import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "../../helpers/axiosHelper";

export const createNap = createAsyncThunk(
  "nap/create",
  async (data, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post("/nap", data, {
        headers: {
          "Content-Type": "application/json",
        },
      });
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

export const fetchNap = createAsyncThunk(
  "nap/getAll",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get("/nap");
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

export const fetchNapById = createAsyncThunk(
  "nap/get",
  async (data, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(`/get_nap/${data.id}`);
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

export const updateNap = createAsyncThunk(
  "nap/update",
  async (data, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.put(`/nap/${data.id}`, data);
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

export const deleteNap = createAsyncThunk(
  "nap/delete",
  async (data, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.delete(`/nap/${data.id}`);
      return { ...response.data, id: data.id };
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

export const activeNap = createAsyncThunk(
  "nap/active",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(`/nap/active`);
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

export const fetchNapSchedules = createAsyncThunk(
  "nap/schedules",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(`/nap/schedules`);
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

const defaultSchedules = [
  { label: "Annually", value: "Annually" },
  { label: "Half Yearly", value: "Half Yearly" },
  { label: "Quarterly", value: "Quarterly" },
];

const napSlice = createSlice({
  name: "nap",
  initialState: {
    nap: [],
    allNap: [],
    scheduleOptions: defaultSchedules,
    status: "idle",
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(createNap.fulfilled, (state, action) => {
        state.nap.push(action.payload);
      })
      .addCase(fetchNap.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchNap.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.allNap = action.payload;
      })
      .addCase(fetchNap.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload || action.error.message;
      })
      .addCase(activeNap.fulfilled, (state, action) => {
        state.allNap = action.payload;
      })
      .addCase(updateNap.fulfilled, (state, action) => {
        state.status = "succeeded";
        const updatedNap = action.payload?.data || action.payload;
        if (updatedNap?.id) {
          state.allNap = state.allNap.map((nap) =>
            nap.id === updatedNap.id ? { ...nap, ...updatedNap } : nap
          );
        }
      })
      .addCase(updateNap.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload || action.error.message;
      })
      .addCase(deleteNap.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.allNap = state.allNap.filter((nap) => nap.id !== action.payload.id);
      })
      .addCase(deleteNap.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload || action.error.message;
      })
      .addCase(fetchNapSchedules.fulfilled, (state, action) => {
        if (Array.isArray(action.payload) && action.payload.length) {
          state.scheduleOptions = action.payload;
        }
      })
      .addCase(fetchNapSchedules.rejected, (state) => {
        state.scheduleOptions = defaultSchedules;
      });
  },
});

export default napSlice.reducer;
