import { axiosCaller } from "../utils/axiosCaller";

export const getMessages = async (conversationId: number, page?: number, size?: number) => {
  try {
    return await axiosCaller(`/message/get/${conversationId}`, "GET", {}, { page, size });
  } catch (e) {
    throw e;
  }
};

export const deleteMessage = async (conversationId: number, messageId: number) => {
  try {
    return await axiosCaller(`/message/delete/${conversationId}/${messageId}`, "PUT");
  } catch (e) {
    throw e;
  }
};

export const markMessageAsSeen = async (conversationId: number) => {
  try {
    return await axiosCaller(`/message/mark/seen/${conversationId}`, "PUT");
  } catch (e) {
    throw e;
  }
};

export const getUsersSeenMessage = async (conversationId: number, messageId: number) => {
  try {
    return await axiosCaller(`/conversation/get/users-seen/${messageId}/${conversationId}`, "GET");
  } catch (e) {
    throw e;
  }
};

export const getUserUnSeenMessage = async (conversationId: number, messageId: number) => {
  try {
    return await axiosCaller(`/conversation/get/users-unseen/${messageId}/${conversationId}`, "GET");
  } catch (e) {
    throw e;
  }
};

export const searchMessages = async (conversationId: number, query: string, page?: number, size?: number) => {
  try {
    return await axiosCaller(`/message/search/${conversationId}`, "GET", {}, { query: query ? query : "''", page, size });
  } catch (e) {
    throw e;
  }
};
