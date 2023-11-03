import {
  getCurrentUserProfile,
  updateNotification,
  updateStatus,
  updateUser,
} from "@/shared/APIs/userAPI";
import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { logoutSuccess } from "./login";
import { MessageInstance } from "antd/es/message/interface";

export interface User {
  id: number;
  email: string;
  username: string;
  displayName: string;
  avatar: string | null;
  cover: string | null;
  about: string | null;
  phoneNumber: string;
  active: boolean;
  online: boolean;
  language: string | null;
  createdAt: number;
  notification: boolean | null;

  getUserProfileStatus: "F" | "S" | "N";
}

const initialState: User = {
  id: -1,
  email: "",
  username: "",
  displayName: "",
  avatar: null,
  cover: null,
  about: null,
  phoneNumber: "",
  active: true,
  online: true,
  language: null,
  createdAt: 0,
  notification: null,

  getUserProfileStatus: "N",
};

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setState: (state, action: PayloadAction<Partial<User>>) => {
      return { ...state, ...action.payload };
    },
    resetState: () => {
      return initialState;
    },
    getUserProfileSuccess: (state, action: PayloadAction<User>) => {
      return { ...state, ...action.payload };
    },
    getUserProfileFailed: (state) => {
      state.getUserProfileStatus = "F";
    },
  },
});

const getUserProfileAsyncAction = createAsyncThunk("User/GetProfile", async (data, thunkAPI) => {
  try {
    const response: any = await getCurrentUserProfile();
    thunkAPI.dispatch(getUserProfileSuccess({ ...response, getUserProfileStatus: "S" }));
  } catch (e: any) {
    thunkAPI.dispatch(getUserProfileFailed());
    thunkAPI.dispatch(logoutSuccess());
  }
});

const updateProfileAsyncAction = createAsyncThunk(
  "User/UpdateProfile",
  async (
    data: {
      messageApi: MessageInstance;
      displayName: string;
      phoneNumber: string;
      about: string | null;
      language: string | null;
    },
    thunkAPI
  ) => {
    try {
      const response: any = await updateUser(
        data.displayName,
        data.phoneNumber,
        data.about,
        data.language
      );
      thunkAPI.dispatch(setState(response));
      data.messageApi.success("Update profile successfully");
    } catch (e: any) {
      data.messageApi.error(e.message);
    }
  }
);

const updateStatusAsyncAction = createAsyncThunk(
  "User/UpdateStatus",
  async (
    data: {
      messageApi: MessageInstance;
      online: boolean;
    },
    thunkAPI
  ) => {
    try {
      const response: any = await updateStatus(data.online);
      thunkAPI.dispatch(setState(response));
      data.messageApi.success("Update status successfully");
    } catch (e: any) {
      data.messageApi.error(e.message);
    }
  }
);

const updateNotificationAsyncAction = createAsyncThunk(
  "User/UpdateNotification",
  async (
    data: {
      messageApi: MessageInstance;
      notification: boolean;
    },
    thunkAPI
  ) => {
    try {
      const response: any = await updateNotification(data.notification);
      thunkAPI.dispatch(setState(response));
      data.messageApi.success("Update notification successfully");
    } catch (e: any) {
      data.messageApi.error(e.message);
    }
  }
);

export {
  getUserProfileAsyncAction,
  updateProfileAsyncAction,
  updateStatusAsyncAction,
  updateNotificationAsyncAction,
};
export const { setState, resetState, getUserProfileSuccess, getUserProfileFailed } =
  userSlice.actions;
export default userSlice.reducer;
