import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface Router {
  from: string | null;
}

const initialState: Router = {
  from: null,
};

const routerSlice = createSlice({
  name: "router",
  initialState,
  reducers: {
    setState: (state, action: PayloadAction<Partial<Router>>) => {
      return { ...state, ...action.payload };
    },
    resetState: () => {
      return initialState;
    },
  },
});

export const { setState, resetState } = routerSlice.actions;
export default routerSlice.reducer;
