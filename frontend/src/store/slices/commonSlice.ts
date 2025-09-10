import { createSlice } from "@reduxjs/toolkit";
import type { CommonState } from "@/types/store/common";

const initialState: CommonState = {
  user: null,
  isLoading: false,
  error: null,
  lastUpdated: null,
};

const commonSlice = createSlice({
  name: "common",
  initialState,
  reducers: {
    setUser: (state, action) => {
      state.user = action.payload;
    },

    setLoading: (state, action) => {
      state.isLoading = action.payload;
    },

    setError: (state, action) => {
      state.error = action.payload;
    },

    setLastUpdated: (state, action) => {
      state.lastUpdated = action.payload;
    },

    clearCommonData: () => {
      return initialState;
    },
  },
});

export const {
  
  
  
  
  
} = commonSlice.actions;

export default commonSlice.reducer;
