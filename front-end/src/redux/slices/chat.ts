import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { User } from "./user";
import { MessageInstance } from "antd/es/message/interface";
import {
  getConversationDocs,
  getConversationMedia,
  getConversationNotification,
  getConversationPreferLanguage,
  getConversations,
  getNumOfUnseenMessages,
  getUserRoles,
  searchConversations,
  setConversationNotification,
} from "@/shared/APIs/conversationAPI";
import { getMessages, markMessageAsSeen } from "@/shared/APIs/messageAPI";
import { transcribe, translate } from "@/shared/APIs/languageAPI";
import { RootState } from "../store";
import { NavigateOptions } from "next/dist/shared/lib/app-router-context";

export interface File {
  id: number;
  user: User;
  originalFileName: string;
  storedFileName: string;
  contentType: string;
  url: string;
  createdAt: number;
  transcript?: string | null;
  translate?: {
    text?: string;
    code: string;
    name: string;
  };
}

export interface Message {
  id: number;
  content: string;
  messageType:
    | "MESSAGE_TYPE_USER_TEXT"
    | "MESSAGE_TYPE_SYSTEM_TEXT"
    | "MESSAGE_TYPE_FILE_TEXT"
    | "MESSAGE_TYPE_USER_FILE"
    | "MESSAGE_TYPE_TIMELINE";
  sender: User;
  files: File[];
  status: "SENT" | "SEEN" | "PENDING" | "RECEIVED";
  createdAt: number;
  deleted: boolean;
  translate?: {
    text?: string;
    code: string;
    name: string;
  };
}

export interface Conversation {
  id: number;
  conversationName: string;
  avatar: string | null;
  users: (User & { role: "ROLE_PARTICIPANT" | "ROLE_ADMIN" | "ROLE_SUB_ADMIN" })[];
  isGroup: boolean;
  notification: boolean;
  preferLanguage: string | null;
  shouldTranslate: boolean;
  unseenMessage: number;
  message: {
    hasMore: boolean;
    messages: Message[];
  };
  media: {
    hasMore: boolean;
    mediaFiles: File[];
  };
  document: {
    hasMore: boolean;
    documentFiles: File[];
  };
}

export interface Chat {
  currentId: number | null;
  conversations: Conversation[];

  loadingConversation: boolean;
}

const initialState: Chat = {
  currentId: null,
  conversations: [],

  loadingConversation: false,
};

const chatSlice = createSlice({
  name: "chat",
  initialState,
  reducers: {
    setState: (state, action: PayloadAction<Partial<Chat>>) => {
      return { ...state, ...action.payload };
    },
    resetState: () => {
      return initialState;
    },
    select: (state, action: PayloadAction<{ currentId: number }>) => {
      const oldConversation = state.conversations.find((c) => c.id === state.currentId);
      if (oldConversation) oldConversation.shouldTranslate = false;
      state.currentId = action.payload.currentId;
    },
    selectIf: (state, action: PayloadAction<{ currentId: number }>) => {
      if (state.currentId === null) state.currentId = action.payload.currentId;
    },
    addMessage: (
      state,
      action: PayloadAction<{
        message: Message;
        conversationId: number;
      }>
    ) => {
      const index = state.conversations.findIndex((c) => c.id === action.payload.conversationId);
      if (index !== -1) {
        const conversation = state.conversations.splice(index, 1)[0];
        action.payload.message.createdAt =
          new Date(action.payload.message.createdAt).getTime() / 1000;
        conversation.message.messages.unshift(action.payload.message);
        if (
          action.payload.message.messageType === "MESSAGE_TYPE_FILE_TEXT" ||
          action.payload.message.messageType === "MESSAGE_TYPE_USER_FILE"
        ) {
          const { files } = action.payload.message;
          files.forEach((f) => {
            f.createdAt = new Date(f.createdAt).getTime() / 1000;
            if (f.contentType.startsWith("image/") || f.contentType.startsWith("video/")) {
              conversation.media.mediaFiles.unshift(f);
            } else {
              conversation.document.documentFiles.unshift(f);
            }
          });
        }
        if (action.payload.message.messageType === "MESSAGE_TYPE_SYSTEM_TEXT") {
          const { message } = action.payload;
          if (message.content.includes("left the chat")) {
            conversation.users = conversation.users.filter((u) => u.id !== message.sender.id);
          }
        }
        if (conversation.id === state.currentId) conversation.shouldTranslate = true;
        if (
          conversation.id !== state.currentId &&
          action.payload.message.messageType !== "MESSAGE_TYPE_SYSTEM_TEXT"
        )
          conversation.unseenMessage++;
        state.conversations.unshift(conversation);
      }
    },
    deleteMessage: (
      state,
      action: PayloadAction<{
        message: Message;
        conversationId: number;
      }>
    ) => {
      const conversation = state.conversations.find((c) => c.id === action.payload.conversationId);
      if (conversation) {
        const message = conversation.message.messages.find(
          (m) => m.id === action.payload.message.id
        );
        if (message) {
          message.deleted = action.payload.message.deleted;
        }
      }
    },
    beforeTranslate: (
      state,
      action: PayloadAction<{
        conversationId: number;
        messageId: number;
        code: string;
        name: string;
      }>
    ) => {
      const conversation = state.conversations.find((c) => c.id === action.payload.conversationId);
      if (conversation) {
        const message = conversation.message.messages.find(
          (m) => m.id === action.payload.messageId
        );
        if (message) {
          message.translate = {
            code: action.payload.code,
            name: action.payload.name,
            text: undefined,
          };
        }
      }
    },
    translateFail: (
      state,
      action: PayloadAction<{ conversationId: number; messageId: number }>
    ) => {
      const conversation = state.conversations.find((c) => c.id === action.payload.conversationId);
      if (conversation) {
        const message = conversation.message.messages.find(
          (m) => m.id === action.payload.messageId
        );
        if (message) {
          message.translate = undefined;
        }
      }
    },
    changePreferConversationLanguage: (
      state,
      action: PayloadAction<{ conversationId: number; language: string | null }>
    ) => {
      const conversation = state.conversations.find((c) => c.id === action.payload.conversationId);
      if (conversation) {
        conversation.preferLanguage = action.payload.language;
      }
    },
    changeConversationNotification: (
      state,
      action: PayloadAction<{ conversationId: number; notification: boolean }>
    ) => {
      const conversation = state.conversations.find((c) => c.id === action.payload.conversationId);
      if (conversation) {
        conversation.notification = action.payload.notification;
      }
    },
    beforeTranscribe: (
      state,
      action: PayloadAction<{
        conversationId: number;
        messageId: number;
        audioFileId: number;
      }>
    ) => {
      const conversation = state.conversations.find((c) => c.id === action.payload.conversationId);
      if (conversation) {
        const message = conversation.message.messages.find(
          (m) => m.id === action.payload.messageId
        );
        if (message) {
          const audioFile = message.files.find((f) => f.id === action.payload.audioFileId);
          if (audioFile) {
            audioFile.transcript = null;
            audioFile.translate = undefined;
          }
        }
      }
    },
    transcribeFail: (
      state,
      action: PayloadAction<{
        conversationId: number;
        messageId: number;
        audioFileId: number;
      }>
    ) => {
      const conversation = state.conversations.find((c) => c.id === action.payload.conversationId);
      if (conversation) {
        const message = conversation.message.messages.find(
          (m) => m.id === action.payload.messageId
        );
        if (message) {
          const audioFile = message.files.find((f) => f.id === action.payload.audioFileId);
          if (audioFile) {
            audioFile.transcript = undefined;
            audioFile.translate = undefined;
          }
        }
      }
    },
    leaveConversation: (
      state,
      action: PayloadAction<{
        conversationId: number;
        pushFunction: (href: string, options?: NavigateOptions | undefined) => void;
      }>
    ) => {
      const index = state.conversations.findIndex((c) => c.id === action.payload.conversationId);
      const conversations = state.conversations.filter(
        (c) => c.id !== action.payload.conversationId
      );
      state.conversations = conversations;
      if (conversations.length > 0 && state.currentId !== null) {
        if (conversations.length > index && index > -1) {
          action.payload.pushFunction(`/chat/${conversations[index].id}`);
        } else action.payload.pushFunction(`/chat/${conversations[conversations.length - 1].id}`);
      } else action.payload.pushFunction("/chat");
    },
    addConversation: (
      state,
      action: PayloadAction<{
        conversation: Conversation;
      }>
    ) => {
      state.conversations.unshift(action.payload.conversation);
    },
    updateUsersInConversation: (
      state,
      action: PayloadAction<{ conversation: Conversation; userId: number }>
    ) => {
      const { conversation, userId } = action.payload;
      const index = state.conversations.findIndex((c) => c.id === conversation.id);
      if (index > -1) {
        if (conversation.users.find((u) => u.id === userId)) {
          state.conversations[index].users = conversation.users;
        } else {
          state.conversations = state.conversations.filter((c) => c.id !== conversation.id);
        }
      }
    },
    changeConversationName: (state, action: PayloadAction<{ conversation: Conversation }>) => {
      const { conversation } = action.payload;
      const index = state.conversations.findIndex((c) => c.id === conversation.id);
      if (index > -1) {
        state.conversations[index].conversationName = conversation.conversationName;
      }
    },
    changeConversationAvatar: (state, action: PayloadAction<{ conversation: Conversation }>) => {
      const { conversation } = action.payload;
      const index = state.conversations.findIndex((c) => c.id === conversation.id);
      if (index > -1) {
        state.conversations[index].avatar = conversation.avatar;
      }
    },
  },
  extraReducers: (builder) => {
    builder.addCase(getMessagesAsyncAction.fulfilled, (state, action) => {
      const conversation = state.conversations.find((c) => c.id === action.payload?.conversationId);
      if (conversation) {
        const startPoint = conversation.message.messages.length % 20;
        const newMessages = action.payload?.response.content.slice(startPoint);
        conversation.message.messages.push(...newMessages);
        conversation.message.hasMore = !action.payload?.response.last;
        return state;
      }
    });
    builder.addCase(translateAsyncAction.fulfilled, (state, action) => {
      const conversation = state.conversations.find((c) => c.id === action.payload?.conversationId);
      if (conversation) {
        const message = conversation.message.messages.find(
          (m) => m.id === action.payload?.messageId
        );
        if (message) {
          if (message.translate) message.translate.text = action.payload?.response;
        }
      }
    });
    builder.addCase(transcribeAsyncAction.fulfilled, (state, action) => {
      const conversation = state.conversations.find((c) => c.id === action.payload?.conversationId);
      if (conversation) {
        const message = conversation.message.messages.find(
          (m) => m.id === action.payload?.messageId
        );
        if (message) {
          const audioFile = message.files.find((f) => f.id === action.payload?.audioFileId);
          if (audioFile) {
            audioFile.transcript = action.payload?.response;
            if (action.payload?.translateResponse && action.payload.code && action.payload.name) {
              audioFile.translate = {
                code: action.payload.code,
                name: action.payload.name,
                text: action.payload.translateResponse,
              };
            }
          }
        }
      }
    });
    builder.addCase(markMessageAsSeenAsyncAction.fulfilled, (state, action) => {
      const conversation = state.conversations.find((c) => c.id === action.payload?.conversationId);
      if (conversation) {
        conversation.unseenMessage = 0;
      }
    });
    builder.addCase(getConversationDocsAsyncAction.fulfilled, (state, action) => {});
    builder.addCase(getConversationMediaAsyncAction.fulfilled, (state, action) => {});
  },
});

const getConversationsAsyncAction = createAsyncThunk(
  "Chat/GetConversations",
  async (data: { messageApi: MessageInstance }, thunkAPI) => {
    try {
      thunkAPI.dispatch(setState({ loadingConversation: true }));
      const response: any = await getConversations();
      const conversations = response.content as Conversation[];
      await Promise.all(
        conversations.map(async (c) => {
          const messageResponse = await getMessages(c.id, undefined, 20);
          const media = await getConversationMedia(c.id, undefined, 20);
          const docs = await getConversationDocs(c.id, undefined, 20);
          const preferLanguage = await getConversationPreferLanguage(c.id);
          const unseenMessage = await getNumOfUnseenMessages(c.id);
          const notification = await getConversationNotification(c.id);
          const userRoles = (await getUserRoles(c.id)) as {
            [s: number]: "ROLE_PARTICIPANT" | "ROLE_ADMIN" | "ROLE_SUB_ADMIN";
          };
          Object.entries(userRoles).forEach(([k, v]) => {
            const user = c.users.find((u) => u.id === Number(k));
            if (user) {
              user.role = v;
            }
          });
          c.message = {
            hasMore: !messageResponse.last,
            messages: messageResponse.content,
          };
          c.media = {
            hasMore: !media.last,
            mediaFiles: media.content,
          };
          c.document = {
            hasMore: !docs.last,
            documentFiles: docs.content.filter(
              (f: any) => f.contentType !== "application/octet-stream"
            ),
          };
          c.preferLanguage = preferLanguage ? preferLanguage : null;
          c.shouldTranslate = false;
          c.unseenMessage = unseenMessage;
          c.notification = notification ? true : false;
        })
      );
      thunkAPI.dispatch(setState({ loadingConversation: false, conversations }));
      if (response.content?.length > 0) {
        thunkAPI.dispatch(selectIf({ currentId: response.content[0].id }));
      }
    } catch (e: any) {
      thunkAPI.dispatch(setState({ loadingConversation: false }));
      data.messageApi.error(e.message);
    }
  }
);

const addConversationAsyncAction = createAsyncThunk(
  "Chat/addConversation",
  async (data: { messageApi: MessageInstance; conversation: Conversation }, thunkAPI) => {
    try {
      const c = data.conversation;
      const messageResponse = await getMessages(c.id, undefined, 20);
      const media = await getConversationMedia(c.id, undefined, 20);
      const docs = await getConversationDocs(c.id, undefined, 20);
      const preferLanguage = await getConversationPreferLanguage(c.id);
      const unseenMessage = await getNumOfUnseenMessages(c.id);
      const notification = await getConversationNotification(c.id);
      const userRoles = (await getUserRoles(c.id)) as {
        [s: number]: "ROLE_PARTICIPANT" | "ROLE_ADMIN" | "ROLE_SUB_ADMIN";
      };
      Object.entries(userRoles).forEach(([k, v]) => {
        const user = c.users.find((u) => u.id === Number(k));
        if (user) {
          user.role = v;
        }
      });
      c.message = {
        hasMore: !messageResponse.last,
        messages: messageResponse.content,
      };
      c.media = {
        hasMore: !media.last,
        mediaFiles: media.content,
      };
      c.document = {
        hasMore: !docs.last,
        documentFiles: docs.content.filter(
          (f: any) => f.contentType !== "application/octet-stream"
        ),
      };
      c.preferLanguage = preferLanguage ? preferLanguage : null;
      c.shouldTranslate = false;
      c.unseenMessage = unseenMessage;
      c.notification = notification ? true : false;
      thunkAPI.dispatch(addConversation({ conversation: c }));
    } catch (e: any) {
      data.messageApi.error(e.message);
    }
  }
);

const searchConversationsAsyncAction = createAsyncThunk(
  "Chat/SearchConversations",
  async (
    data: { messageApi: MessageInstance; query: string; page?: number; size?: number },
    thunkAPI
  ) => {
    try {
      const response: any = await searchConversations(data.query, data.page, data.size);
      const conversations = response.content as Conversation[];
      await Promise.all(
        conversations.map(async (c) => {
          const messageResponse = await getMessages(c.id, undefined, 20);
          const media = await getConversationMedia(c.id, undefined, 20);
          const docs = await getConversationDocs(c.id, undefined, 20);
          const preferLanguage = await getConversationPreferLanguage(c.id);
          const unseenMessage = await getNumOfUnseenMessages(c.id);
          const notification = await getConversationNotification(c.id);
          const userRoles = (await getUserRoles(c.id)) as {
            [s: number]: "ROLE_PARTICIPANT" | "ROLE_ADMIN" | "ROLE_SUB_ADMIN";
          };
          Object.entries(userRoles).forEach(([k, v]) => {
            const user = c.users.find((u) => u.id === Number(k));
            if (user) {
              user.role = v;
            }
          });
          c.message = {
            hasMore: !messageResponse.last,
            messages: messageResponse.content,
          };
          c.media = {
            hasMore: !media.last,
            mediaFiles: media.content,
          };
          c.document = {
            hasMore: !docs.last,
            documentFiles: docs.content.filter(
              (f: any) => f.contentType !== "application/octet-stream"
            ),
          };
          c.preferLanguage = preferLanguage ? preferLanguage : null;
          c.shouldTranslate = false;
          c.unseenMessage = unseenMessage;
          c.notification = notification ? true : false;
        })
      );
      thunkAPI.dispatch(setState({ conversations }));
    } catch (e: any) {
      data.messageApi.error(e.message);
    }
  }
);

const getMessagesAsyncAction = createAsyncThunk(
  "Chat/GetMessages",
  async (
    data: { messageApi: MessageInstance; conversationId: number; page?: number; size?: number },
    thunkAPI
  ) => {
    try {
      const response: any = await getMessages(data.conversationId, data.page, data.size);
      return { conversationId: data.conversationId, response };
    } catch (e: any) {
      data.messageApi.error(e.message);
    }
  }
);

const getConversationMediaAsyncAction = createAsyncThunk(
  "Chat/GetConversationMedia",
  async (
    data: { messageApi: MessageInstance; conversationId: number; page?: number; size?: number },
    thunkAPI
  ) => {
    try {
      const response: any = await getConversationMedia(data.conversationId, data.page, data.size);
      return { conversationId: data.conversationId, response };
    } catch (e: any) {
      data.messageApi.error(e.message);
    }
  }
);

const getConversationDocsAsyncAction = createAsyncThunk(
  "Chat/GetConversationDocs",
  async (
    data: { messageApi: MessageInstance; conversationId: number; page?: number; size?: number },
    thunkAPI
  ) => {
    try {
      const response: any = await getConversationDocs(data.conversationId, data.page, data.size);
      return { conversationId: data.conversationId, response };
    } catch (e: any) {
      data.messageApi.error(e.message);
    }
  }
);

const translateAsyncAction = createAsyncThunk(
  "Chat/Translate",
  async (
    data: {
      messageApi: MessageInstance;
      conversationId: number;
      message: Message;
      code: string;
      name: string;
    },
    thunkAPI
  ) => {
    try {
      if (data.name === "") {
        const languages = (thunkAPI.getState() as RootState).language;
        const language = languages.find((l) => l.code === data.code);
        if (language) data.name = language.name;
      }
      thunkAPI.dispatch(
        beforeTranslate({
          conversationId: data.conversationId,
          messageId: data.message.id,
          code: data.code,
          name: data.name,
        })
      );
      const response: any = await translate(data.message.content, data.code);
      return { conversationId: data.conversationId, messageId: data.message.id, response };
    } catch (e: any) {
      data.messageApi.info("Message can not be translated to your language");
      thunkAPI.dispatch(
        translateFail({ conversationId: data.conversationId, messageId: data.message.id })
      );
    }
  }
);

const transcribeAsyncAction = createAsyncThunk(
  "Chat/Transcribe",
  async (
    data: {
      messageApi: MessageInstance;
      conversation: Conversation;
      message: Message;
      audioFile: File;
      name: string;
      code: string;
    },
    thunkAPI
  ) => {
    try {
      thunkAPI.dispatch(
        beforeTranscribe({
          conversationId: data.conversation.id,
          messageId: data.message.id,
          audioFileId: data.audioFile.id,
        })
      );
      const response: any = await transcribe(data.audioFile.url);
      let translateResponse;

      if (data.code !== "none") {
        if (data.code === "cl") {
          if (data.conversation.preferLanguage) {
            translateResponse = await translate(response, data.conversation.preferLanguage);
            const languages = (thunkAPI.getState() as RootState).language;
            const language = languages.find((l) => l.code === data.conversation.preferLanguage);
            if (language) {
              data.code = language.code;
              data.name = language.name;
            }
          }
        } else {
          translateResponse = await translate(response, data.code);
        }
      }

      return {
        conversationId: data.conversation.id,
        messageId: data.message.id,
        audioFileId: data.audioFile.id,
        response,
        translateResponse,
        name: data.name,
        code: data.code,
      };
    } catch (e: any) {
      data.messageApi.error(e.message);
      thunkAPI.dispatch(
        transcribeFail({
          conversationId: data.conversation.id,
          messageId: data.message.id,
          audioFileId: data.audioFile.id,
        })
      );
    }
  }
);

const markMessageAsSeenAsyncAction = createAsyncThunk(
  "Chat/MarkMessageAsSeen",
  async (data: { messageApi: MessageInstance; conversationId: number }, thunkAPI) => {
    try {
      await markMessageAsSeen(data.conversationId);
      return { conversationId: data.conversationId };
    } catch (e: any) {
      data.messageApi.error(e.message);
    }
  }
);

export {
  getConversationsAsyncAction,
  searchConversationsAsyncAction,
  getMessagesAsyncAction,
  getConversationMediaAsyncAction,
  getConversationDocsAsyncAction,
  translateAsyncAction,
  transcribeAsyncAction,
  markMessageAsSeenAsyncAction,
  addConversationAsyncAction,
};

export const {
  setState,
  resetState,
  select,
  selectIf,
  addMessage,
  deleteMessage,
  beforeTranslate,
  translateFail,
  changePreferConversationLanguage,
  beforeTranscribe,
  transcribeFail,
  leaveConversation,
  addConversation,
  updateUsersInConversation,
  changeConversationName,
  changeConversationAvatar,
  changeConversationNotification,
} = chatSlice.actions;
export default chatSlice.reducer;
