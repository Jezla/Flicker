import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Message } from "./chat";

export interface Notification {
  messages: (Message & { conversation: { name: string; isGroup: boolean } })[];
}

const initialState: Notification = {
  messages: [],
};

const notificationSlice = createSlice({
  name: "notification",
  initialState,
  reducers: {
    setState: (state, action: PayloadAction<Partial<Notification>>) => {
      return { ...state, ...action.payload };
    },
    resetState: () => {
      return initialState;
    },
    addNotification: (
      state,
      action: PayloadAction<Message & { conversation: { name: string; isGroup: boolean } }>
    ) => {
      state.messages.unshift(action.payload);
    },
  },
});

export const { setState, resetState, addNotification } = notificationSlice.actions;
export default notificationSlice.reducer;
