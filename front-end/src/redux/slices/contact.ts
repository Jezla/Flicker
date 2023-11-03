import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { User } from "./user";
import {
  acceptReceivedRequest,
  declineReceivedRequest,
  dismissSentRequest,
  getFriends,
  getNumberOfReceivedRequests,
  getReceivedRequests,
  getSentRequests,
  searchFriendsInList,
  searchFriends,
  searchFriendsWithStatus,
  sendRequest,
  unFriend,
} from "@/shared/APIs/contactAPI";
import { MessageInstance } from "antd/es/message/interface";

export interface Contact {
  friends: User[];
  searchedUsers: (User & {
    status?: "PENDING_R" | "PENDING_S" | "DECLINED" | "FRIEND" | "NOT_FRIEND";
  })[];
  sentRequests: User[];
  receivedRequests: User[];
  numberOfReceivedRequests: number;

  loadingFriend: boolean;
  loadingRequest: boolean;
  currentId: number | null;
  frActive: boolean;
  fafActive: boolean;
}

const initialState: Contact = {
  friends: [],
  searchedUsers: [],
  sentRequests: [],
  receivedRequests: [],
  numberOfReceivedRequests: 0,

  loadingFriend: false,
  loadingRequest: false,
  currentId: null,
  frActive: false,
  fafActive: false,
};

const contactSlice = createSlice({
  name: "contact",
  initialState,
  reducers: {
    setState: (state, action: PayloadAction<Partial<Contact>>) => {
      return { ...state, ...action.payload };
    },
    resetState: () => {
      return initialState;
    },
    select: (state, action: PayloadAction<{ currentId: number }>) => {
      state.currentId = action.payload.currentId;
    },
    selectIf: (state, action: PayloadAction<{ currentId: number }>) => {
      if (state.currentId === null) state.currentId = action.payload.currentId;
    },
    toggle: (state, action: PayloadAction<{ frActive: boolean; fafActive: boolean }>) => {
      state.frActive = action.payload.frActive;
      state.fafActive = action.payload.fafActive;
      if (action.payload.frActive || action.payload.frActive) state.currentId = null;
    },
    changeFriendShipState: (
      state,
      action: PayloadAction<{
        receivedId: number;
        status: "PENDING_R" | "PENDING_S" | "DECLINED" | "FRIEND" | "NOT_FRIEND";
      }>
    ) => {
      const user = state.searchedUsers.find((u) => u.id === action.payload.receivedId);
      if (user) user.status = action.payload.status;
      return state;
    },
    removeFriend: (state, action: PayloadAction<{ userId: number }>) => {
      state.friends = state.friends.filter((f) => f.id !== action.payload.userId);
      state.currentId = null;
    },
  },
});

const getFriendsAsyncAction = createAsyncThunk(
  "Contact/GetFriend",
  async (data: { messageApi: MessageInstance; page?: number; size?: number }, thunkAPI) => {
    try {
      thunkAPI.dispatch(setState({ loadingFriend: true }));
      const response: any = await getFriends(data.page, data.size);
      thunkAPI.dispatch(setState({ loadingFriend: false, friends: response.content }));
      if (response.content?.length > 0) {
        thunkAPI.dispatch(selectIf({ currentId: response.content[0].id }));
      }
    } catch (e: any) {
      thunkAPI.dispatch(setState({ loadingFriend: false }));
      data.messageApi.error(e.message);
    }
  }
);

const unFriendAsyncAction = createAsyncThunk(
  "Contact/UnFriend",
  async (data: { messageApi: MessageInstance; userId: number }, thunkAPI) => {
    try {
      await unFriend(data.userId);
      thunkAPI.dispatch(removeFriend({ userId: data.userId }));
    } catch (e: any) {
      thunkAPI.dispatch(setState({ loadingFriend: false }));
      data.messageApi.error(e.message);
    }
  }
);

const getNumberOfReceivedRequestsAsyncAction = createAsyncThunk(
  "Contact/GetNumberOfReceivedRequests",
  async (data: { messageApi: MessageInstance }, thunkAPI) => {
    try {
      const response: any = await getNumberOfReceivedRequests();
      thunkAPI.dispatch(setState({ numberOfReceivedRequests: response }));
    } catch (e: any) {
      data.messageApi.error(e.message);
    }
  }
);

const searchFriendsWithStatusAsyncAction = createAsyncThunk(
  "Contact/searchFriendsWithStatus",
  async (
    data: { messageApi: MessageInstance; query: string; page?: number; size?: number },
    thunkAPI
  ) => {
    try {
      const response: any = await searchFriends(data.query, data.page, data.size);
      const responseWithStatus: any = await searchFriendsWithStatus(
        data.query,
        data.page,
        data.size
      );

      const searchedUsers = response.content as (User & {
        status: "PENDING_R" | "PENDING_S" | "DECLINED" | "FRIEND" | "NOT_FRIEND";
      })[];

      searchedUsers.forEach((u) => {
        u.status = responseWithStatus[u.id];
      });

      thunkAPI.dispatch(setState({ searchedUsers }));
    } catch (e: any) {
      data.messageApi.error(e.message);
    }
  }
);

const searchFriendsAsyncAction = createAsyncThunk(
  "Contact/searchFriends",
  async (
    data: { messageApi: MessageInstance; searchTerm: string; page?: number; size?: number },
    thunkAPI
  ) => {
    try {
      const response: any = await searchFriendsInList(data.searchTerm, data.page, data.size);
      thunkAPI.dispatch(setState({ friends: response.content }));
    } catch (e: any) {
      data.messageApi.error(e.message);
    }
  }
);

const sendRequestAsyncAction = createAsyncThunk(
  "Contact/SendRequest",
  async (data: { messageApi: MessageInstance; receivedId: number }, thunkAPI) => {
    try {
      thunkAPI.dispatch(
        changeFriendShipState({ receivedId: data.receivedId, status: "PENDING_S" })
      );
      const response: any = await sendRequest(data.receivedId);
    } catch (e: any) {
      data.messageApi.error(e.message);
    }
  }
);

const getRequestsAsyncAction = createAsyncThunk(
  "Contact/GetRequests",
  async (data: { messageApi: MessageInstance }, thunkAPI) => {
    try {
      thunkAPI.dispatch(setState({ loadingRequest: true }));
      const sentResponse: any = await getSentRequests();
      const receivedResponse: any = await getReceivedRequests();
      thunkAPI.dispatch(
        setState({
          loadingRequest: false,
          sentRequests: sentResponse,
          receivedRequests: receivedResponse,
        })
      );
    } catch (e: any) {
      data.messageApi.error(e.message);
    }
  }
);

const dismissSentRequestAsyncAction = createAsyncThunk(
  "Contact/DismissSentRequest",
  async (data: { userId: number; messageApi: MessageInstance }, thunkAPI) => {
    try {
      await dismissSentRequest(data.userId);
      const sentResponse: any = await getSentRequests();
      thunkAPI.dispatch(
        setState({
          sentRequests: sentResponse,
        })
      );
    } catch (e: any) {
      data.messageApi.error(e.message);
    }
  }
);

const acceptReceivedRequestAsyncAction = createAsyncThunk(
  "Contact/AcceptReceivedRequest",
  async (data: { userId: number; messageApi: MessageInstance }, thunkAPI) => {
    try {
      await acceptReceivedRequest(data.userId);
      const receivedResponse: any = await getReceivedRequests();
      const response: any = await getFriends();
      thunkAPI.dispatch(
        setState({
          friends: response.content,
          receivedRequests: receivedResponse,
          numberOfReceivedRequests: receivedResponse.length,
        })
      );
    } catch (e: any) {
      data.messageApi.error(e.message);
    }
  }
);

const declineReceivedRequestAsyncAction = createAsyncThunk(
  "Contact/DeclineReceivedRequest",
  async (data: { userId: number; messageApi: MessageInstance }, thunkAPI) => {
    try {
      await declineReceivedRequest(data.userId);
      const receivedResponse: any = await getReceivedRequests();
      thunkAPI.dispatch(
        setState({
          receivedRequests: receivedResponse,
          numberOfReceivedRequests: receivedResponse.length,
        })
      );
    } catch (e: any) {
      data.messageApi.error(e.message);
    }
  }
);

export {
  getFriendsAsyncAction,
  unFriendAsyncAction,
  getNumberOfReceivedRequestsAsyncAction,
  searchFriendsWithStatusAsyncAction,
  searchFriendsAsyncAction,
  sendRequestAsyncAction,
  getRequestsAsyncAction,
  dismissSentRequestAsyncAction,
  acceptReceivedRequestAsyncAction,
  declineReceivedRequestAsyncAction,
};
export const {
  setState,
  resetState,
  select,
  selectIf,
  toggle,
  changeFriendShipState,
  removeFriend,
} = contactSlice.actions;
export default contactSlice.reducer;
