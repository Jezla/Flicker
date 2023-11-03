import { getSystemLanguages } from "@/shared/APIs/languageAPI";
import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { MessageInstance } from "antd/es/message/interface";

export interface Language {
  code: string;
  name: string;
}

const initialState: Language[] = [];

const languageSlice = createSlice({
  name: "language",
  initialState,
  reducers: {
    setState: (state, action: PayloadAction<Language[]>) => {
      return action.payload;
    },
    resetState: () => {
      return initialState;
    },
  },
});

const getSystemLanguagesAsyncAction = createAsyncThunk(
  "language/GetSystemLanguages",
  async (data: { messageApi: MessageInstance }, thunkAPI) => {
    try {
      const response: { [code: string]: string } = await getSystemLanguages();
      const language: Language[] = [];
      for (const [key, value] of Object.entries(response)) {
        language.push({ code: key, name: value });
      }
      language.sort((a, b) => a.name.localeCompare(b.name));
      language.unshift({ name: "No select", code: "none" });
      thunkAPI.dispatch(setState(language));
    } catch (e: any) {
      data.messageApi.error(e.message);
    }
  }
);

export { getSystemLanguagesAsyncAction };

export const { setState, resetState } = languageSlice.actions;
export default languageSlice.reducer;
