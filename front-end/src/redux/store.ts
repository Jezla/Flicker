import { combineReducers, configureStore } from "@reduxjs/toolkit";
import loginReducer from "./slices/login";
import signupReducer from "./slices/signup";
import userReducer from "./slices/user";
import contactReducer from "./slices/contact";
import chatReducer from "./slices/chat";
import routerReducer from "./slices/router";
import languageReducer from "./slices/language";
import notificationReducer from "./slices/notification";

const rootReducer = combineReducers({
  login: loginReducer,
  signup: signupReducer,
  user: userReducer,
  contact: contactReducer,
  chat: chatReducer,
  router: routerReducer,
  language: languageReducer,
  notification: notificationReducer,
});

export const store = configureStore({
  reducer: rootReducer,
  devTools: process.env.NODE_ENV === "development" ? true : false,
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
