import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "../../helpers/axiosHelper";

// Async thunk to fetch deals
export const fetchDeals = createAsyncThunk(
  "deals/list",
  async (data, thunkAPI) => {
    try {
      const filteredParams = Object.fromEntries(
        Object.entries(data).filter(
          ([key, value]) =>
            value !== null && value !== undefined && value !== ""
        )
      );
      const response = await axiosInstance.get("/get_customer_deals", {
        params: filteredParams,
      });
      return response?.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data || "Failed to fetch deals"
      );
    }
  }
);


// Thunk to toggle deal flags
export const toggleDealFlags = createAsyncThunk(
  "deal/toggle-deal-flags",
  async (payload, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post(`/deal/toggle_deal_flags`, payload,
        {
          headers: {
            accept: "application/json",
          }
        }
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error?.response?.data || "Something went wrong");
    }
  }
);
export const craeteRenewalDeal = createAsyncThunk(
  "deal/create-renewal-deal",
  async (payload, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post(`/deal/create_renewal_deal`, payload);
      return response.data;
    } catch (error) {
      return rejectWithValue(error?.response?.data || "Failed to create renewal deal");
    }
  }
);

// Thunk to clone deal
export const cloneDeal = createAsyncThunk(
  "deal/clone-deal",
  async (payload, { rejectWithValue }) => {
    try {
      const { dealId, newDealName } = payload;
      const response = await axiosInstance.post(`/clone_deal/${dealId}`, {
        new_deal_name: newDealName
      },
        {
          headers: {
            accept: "application/json",
          }
        }
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error?.response?.data || "Failed to clone deal");
    }
  }
);

export const sendDealEmail = createAsyncThunk(
  "deal/send-email",
  async (payload, { rejectWithValue }) => {
    try {
      const { dealId, emails, templateAction } = payload || {};
      const requestBody = {
        deal_id: dealId,
        emails,
      };

      if (templateAction) {
        requestBody.template_action = templateAction;
      }

      const response = await axiosInstance.post(
        `/communication/send_deal_email`,
        requestBody,
        {
          headers: {
            accept: "application/json",
          },
        }
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error?.response?.data || "Failed to send deal email"
      );
    }
  }
);

// Thunk to process complete amendment (clone deal, transfer data, sync global data)
export const processDealAmendment = createAsyncThunk(
  "deal/process-amendment",
  async (payload, { rejectWithValue }) => {
    try {
      const { dealId, amendmentData } = payload;
      const response = await axiosInstance.post(`/deal_amendment/${dealId}/process`, amendmentData, {
        headers: {
          accept: "application/json",
        }
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error?.response?.data || "Failed to process amendment");
    }
  }
);

// Legacy thunk for backward compatibility (deprecated)
export const syncAllTablesAmendment = createAsyncThunk(
  "deal/sync-all-tables-amendment",
  async (dealId, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post(`/deal_amendment/${dealId}/sync_all_tables`,
        {},
        {
          headers: {
            accept: "application/json",
          }
        }
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error?.response?.data || "Failed to sync tables for amendment");
    }
  }
);


const dealsListSlice = createSlice({
  name: "deals_list",
  initialState: {
    deals: [],
    loading: false,
    cloning: false,
    amending: false,
    status: "idle", // 'idle' | 'loading' | 'succeeded' | 'failed'
    error: null,
    sendingEmail: false,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchDeals.pending, (state, action) => {
        state.loading = true;
      })
      .addCase(fetchDeals.fulfilled, (state, action) => {
        state.loading = false;
        state.deals = action.payload;
      })
      .addCase(fetchDeals.rejected, (state, action) => {
        state.loading = false;
        state.error = action?.error?.message;
      })
      .addCase(toggleDealFlags.fulfilled, (state, action) => {
        state.deals = action?.payload?.deals;
      })
      .addCase(cloneDeal.pending, (state, action) => {
        state.cloning = true;
        state.error = null;
      })
      .addCase(cloneDeal.fulfilled, (state, action) => {
        state.cloning = false;
        // Optionally update the deals list if needed
        // The page will be refreshed anyway
      })
      .addCase(cloneDeal.rejected, (state, action) => {
        state.cloning = false;
        state.error = action?.payload?.detail || "Failed to clone deal";
      })
      .addCase(sendDealEmail.pending, (state) => {
        state.sendingEmail = true;
        state.error = null;
      })
      .addCase(sendDealEmail.fulfilled, (state) => {
        state.sendingEmail = false;
      })
      .addCase(sendDealEmail.rejected, (state, action) => {
        state.sendingEmail = false;
        state.error = action?.payload?.detail || action?.payload || "Failed to send deal email";
      })
      .addCase(syncAllTablesAmendment.pending, (state, action) => {
        state.amending = true;
        state.error = null;
      })
      .addCase(syncAllTablesAmendment.fulfilled, (state, action) => {
        state.amending = false;
      })
      .addCase(syncAllTablesAmendment.rejected, (state, action) => {
        state.amending = false;
        state.error = action?.payload?.detail || "Failed to sync tables for amendment";
      })
      .addCase(processDealAmendment.pending, (state, action) => {
        state.amending = true;
        state.error = null;
      })
      .addCase(processDealAmendment.fulfilled, (state, action) => {
        state.amending = false;
        // Optionally update the deals list if needed
      })
      .addCase(processDealAmendment.rejected, (state, action) => {
        state.amending = false;
        state.error = action?.payload?.detail || "Failed to process amendment";
      });
  },
});

export default dealsListSlice.reducer;
