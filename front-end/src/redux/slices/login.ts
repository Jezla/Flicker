import { logIn, logout } from "@/shared/APIs/loginAPI";
import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { AxiosError } from "axios";
import { AppRouterInstance } from "next/dist/shared/lib/app-router-context";

export interface Login {
  accessToken: string;
  refreshToken: string;
  error: string;
  loading: boolean;
}

const initialState: Login = {
  accessToken: "",
  refreshToken: "",
  error: "",
  loading: false,
};

const loginSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setState: (state, action: PayloadAction<Partial<Login>>) => {
      return { ...state, ...action.payload };
    },
    resetState: () => {
      return initialState;
    },
    loginSuccess: (state, action: PayloadAction<{ accessToken: string; refreshToken: string }>) => {
      localStorage.setItem("accessToken", action.payload.accessToken);
      localStorage.setItem("refreshToken", action.payload.refreshToken);
      state.accessToken = action.payload.accessToken;
      state.refreshToken = action.payload.refreshToken;
      state.loading = false;
    },
    loginFailed: (state, action: PayloadAction<{ error: string }>) => {
      state.error = action.payload.error;
      state.loading = false;
    },
    logoutSuccess: (state) => {
      state.accessToken = "";
      state.refreshToken = "";
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
    },
  },
});

const logoutAsyncAction = createAsyncThunk(
  "Auth/Logout",
  async (router: AppRouterInstance, thunkAPI) => {
    try {
      await logout();
      thunkAPI.dispatch(logoutSuccess());
      router.push("/login");
    } catch (e: any) {
      thunkAPI.dispatch(
        loginFailed({ error: e.response.data.data ? e.response.data.data : e.message })
      );
    }
  }
);

const loginAsyncAction = createAsyncThunk(
  "Auth/Login",
  async (data: { email: string; password: string }, thunkAPI) => {
    try {
      thunkAPI.dispatch(setState({ loading: true }));
      const response: any = await logIn(data.email, data.password);
      thunkAPI.dispatch(
        loginSuccess({
          accessToken: response.accessToken,
          refreshToken: response.refreshToken,
        })
      );
    } catch (e: any) {
      if (e instanceof AxiosError) {
        if (e.response?.status === 417) {
          thunkAPI.dispatch(loginFailed({ error: "Wrong email or password" }));
        } else if (e.response?.status === 401) {
          thunkAPI.dispatch(loginFailed({ error: "Your email has not been verified" }));
        } else {
          thunkAPI.dispatch(
            loginFailed({ error: e.response?.data.data ? e.response.data.data : e.message })
          );
        }
      } else {
        thunkAPI.dispatch(
          loginFailed({ error: e.response.data.data ? e.response.data.data : e.message })
        );
      }
    }
  }
);

export { loginAsyncAction, logoutAsyncAction };
export const { setState, resetState, loginFailed, loginSuccess, logoutSuccess } =
  loginSlice.actions;
export default loginSlice.reducer;
