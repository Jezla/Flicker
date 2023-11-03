import { signUp } from "@/shared/APIs/signupAPI";
import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface Signup {
  error: string;
  loading: boolean;
  complete: boolean;
}

const initialState: Signup = {
  error: "",
  loading: false,
  complete: false,
};

const signupSlice = createSlice({
  name: "signup",
  initialState,
  reducers: {
    setState: (state, action: PayloadAction<Partial<Signup>>) => {
      return { ...state, ...action.payload };
    },
    resetState: () => {
      return initialState;
    },
    signupSuccess: (state) => {
      state.complete = true;
      state.loading = false;
    },
    signupFailed: (state, action: PayloadAction<{ error: string }>) => {
      state.error = action.payload.error;
      state.loading = false;
    },
  },
});

const signupAsyncAction = createAsyncThunk(
  "Signup/Signup",
  async (
    data: { email: string; username: string; phoneNumber: string; password: string },
    thunkAPI
  ) => {
    try {
      thunkAPI.dispatch(setState({ loading: true }));
      const response: any = await signUp(
        data.email,
        data.username,
        data.phoneNumber,
        data.password
      );
      thunkAPI.dispatch(signupSuccess());
    } catch (e: any) {
      thunkAPI.dispatch(
        signupFailed({ error: e.response.data.data ? e.response.data.data : e.message })
      );
    }
  }
);

export { signupAsyncAction };
export const { setState, resetState, signupFailed, signupSuccess } = signupSlice.actions;
export default signupSlice.reducer;
