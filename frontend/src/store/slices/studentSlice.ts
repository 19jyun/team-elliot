import { createSlice } from "@reduxjs/toolkit";
import type { StudentState, StudentData } from "@/types/store/student";

const initialState: StudentState = {
  data: null,
};

export const studentSlice = createSlice({
  name: "student",
  initialState,
  reducers: {
    setStudentData: (state, action) => {
      state.data = action.payload;
    },

    clearStudentData: (state) => {
      state.data = null;
    },
  },
});

export const { setStudentData, clearStudentData } = studentSlice.actions;

export default studentSlice.reducer;
