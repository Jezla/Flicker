import { axiosCaller, axiosFormCaller } from "../utils/axiosCaller";

export const getConversations = async (page?: number, size?: number) => {
  try {
    return await axiosCaller("/conversation/get", "GET", {}, { page, size });
  } catch (e) {
    throw e;
  }
};

export const searchConversations = async (query: string, page?: number, size?: number) => {
  try {
    return await axiosCaller(
      "/conversation/search",
      "GET",
      {},
      { query: query ? query : "''", page, size }
    );
  } catch (e) {
    throw e;
  }
};

export const createPrivateChat = async (userId2: number) => {
  try {
    return await axiosCaller("/conversation/create/private-chat", "POST", {}, { userId2 });
  } catch (e) {
    throw e;
  }
};

export const createGroupChat = async (name: string, userIds: number[]) => {
  try {
    return await axiosCaller("/conversation/create", "POST", { name, userIds });
  } catch (e) {
    throw e;
  }
};

export const getConversationMedia = async (
  conversationId: number,
  page?: number,
  size?: number
) => {
  try {
    return await axiosCaller(
      `/conversation/media/get/${conversationId}`,
      "GET",
      {},
      { page, size }
    );
  } catch (e) {
    throw e;
  }
};

export const getConversationDocs = async (conversationId: number, page?: number, size?: number) => {
  try {
    return await axiosCaller(`/conversation/docs/get/${conversationId}`, "GET", {}, { page, size });
  } catch (e) {
    throw e;
  }
};

export const getConversationPreferLanguage = async (conversationId: number) => {
  try {
    return await axiosCaller(`/conversation/language-preference/get/${conversationId}`, "GET");
  } catch (e) {
    throw e;
  }
};

export const setConversationPreferLanguage = async (
  conversationId: number,
  preferredLanguage: string
) => {
  try {
    return await axiosCaller(
      `/conversation/language-preference/set/${conversationId}`,
      "POST",
      {},
      { preferredLanguage }
    );
  } catch (e) {
    throw e;
  }
};

export const getNumOfUnseenMessages = async (conversationId: number) => {
  try {
    return await axiosCaller(`/conversation/get/numOfUnseenMessages/${conversationId}`, "GET");
  } catch (e) {
    throw e;
  }
};

export const getUserRoles = async (conversationId: number) => {
  try {
    return await axiosCaller(`/conversation/get/userRoles/${conversationId}`, "GET");
  } catch (e) {
    throw e;
  }
};

export const uploadGroupAvatar = async (conversationId: number, file: File) => {
  try {
    const formData = new FormData();
    formData.append("file", file);
    return await axiosFormCaller(
      `/conversation/file/groupPhoto/update/${conversationId}`,
      "POST",
      formData
    );
  } catch (e) {
    throw e;
  }
};

export const removeGroupAvatar = async (conversationId: number) => {
  try {
    return await axiosFormCaller(`/conversation/file/groupPhoto/remove/${conversationId}`, "PUT");
  } catch (e) {
    throw e;
  }
};

export const getConversationNotification = async (conversationId: number) => {
  try {
    return await axiosFormCaller(`/conversation/notification/get/${conversationId}`, "GET");
  } catch (e) {
    throw e;
  }
};

export const setConversationNotification = async (
  conversationId: number,
  notification: boolean
) => {
  try {
    return await axiosFormCaller(`/conversation/notification/set/${conversationId}`, "PUT", {
      notification,
    });
  } catch (e) {
    throw e;
  }
};
