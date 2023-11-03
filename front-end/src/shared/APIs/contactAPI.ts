import { axiosCaller } from "../utils/axiosCaller";

export const getFriends = async (page?: number, size?: number) => {
  try {
    return await axiosCaller("/friendship/friends", "GET", {}, { page, size });
  } catch (e) {
    throw e;
  }
};

export const searchFriendsInList = async (searchTerm: string, page?: number, size?: number) => {
  try {
    return await axiosCaller(
      "/friendship/friends/search",
      "GET",
      {},
      { searchTerm: searchTerm ? searchTerm : "''", page, size }
    );
  } catch (e) {
    throw e;
  }
};

export const searchFriends = async (query: String, page?: number, size?: number) => {
  try {
    return await axiosCaller(
      "/user/search",
      "GET",
      {},
      { query: query ? query : "''", page, size }
    );
  } catch (e) {
    throw e;
  }
};

export const unFriend = async (userId: number) => {
  try {
    return await axiosCaller(`/friendship/unfriend/${userId}`, "PUT");
  } catch (e) {
    throw e;
  }
};

export const searchFriendsWithStatus = async (query: string, page?: number, size?: number) => {
  try {
    return await axiosCaller(
      "/user/searchWithStatus",
      "GET",
      {},
      { query: query ? query : "''", page, size }
    );
  } catch (e) {
    throw e;
  }
};

export const sendRequest = async (receiverId: number) => {
  try {
    return await axiosCaller("/friendship/sendRequest", "POST", {}, { receiverId });
  } catch (e) {
    throw e;
  }
};

export const getSentRequests = async () => {
  try {
    return await axiosCaller("/friendship/pendingSentRequests", "GET");
  } catch (e) {
    throw e;
  }
};

export const dismissSentRequest = async (userId: number) => {
  try {
    return await axiosCaller(`/friendship/removeSentRequest/${userId}`, "PUT");
  } catch (e) {
    throw e;
  }
};

export const getReceivedRequests = async () => {
  try {
    return await axiosCaller("/friendship/pendingReceivedRequests", "GET");
  } catch (e) {
    throw e;
  }
};

export const getNumberOfReceivedRequests = async () => {
  try {
    return await axiosCaller("/friendship/numOfPendingReceivedRequests", "GET");
  } catch (e) {
    throw e;
  }
};

export const acceptReceivedRequest = async (userId: number) => {
  try {
    return await axiosCaller(`/friendship/acceptRequest/${userId}`, "PUT");
  } catch (e) {
    throw e;
  }
};

export const declineReceivedRequest = async (userId: number) => {
  try {
    return await axiosCaller(`/friendship/declineRequest/${userId}`, "PUT");
  } catch (e) {
    throw e;
  }
};
