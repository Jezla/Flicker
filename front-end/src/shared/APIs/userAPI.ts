import { axiosCaller, axiosFormCaller } from "../utils/axiosCaller";

export const getCurrentUserProfile = async () => {
  try {
    return await axiosCaller("/user/self-profile", "GET");
  } catch (e) {
    throw e;
  }
};

export const getUserProfile = async (userId: number) => {
  try {
    return await axiosCaller(`/user/profile/${userId}`, "GET");
  } catch (e) {
    throw e;
  }
};

export const getNumberOfFriend = async (userId: number) => {
  try {
    return await axiosCaller(`/friendship/numOfFriends/${userId}`, "GET");
  } catch (e) {
    throw e;
  }
};

export const getFriendsStatus = async (userId: number) => {
  try {
    return await axiosCaller(`/friendship/status/${userId}`, "GET");
  } catch (e) {
    throw e;
  }
};

export const updateUser = async (
  displayName: string,
  phoneNumber: string,
  about: string | null,
  language: string | null
) => {
  try {
    return await axiosCaller(`/user/profile/update`, "PUT", {
      displayName,
      phoneNumber,
      about,
      language,
    });
  } catch (e) {
    throw e;
  }
};

export const updateAvatar = async (file: File) => {
  const formData = new FormData();
  formData.append("file", file);
  try {
    return await axiosFormCaller(`/user/avatar/update`, "PUT", formData);
  } catch (e) {
    throw e;
  }
};

export const removeAvatar = async () => {
  try {
    return await axiosCaller(`/user/avatar/remove`, "PUT");
  } catch (e) {
    throw e;
  }
};

export const updateCover = async (file: File) => {
  const formData = new FormData();
  formData.append("file", file);
  try {
    return await axiosFormCaller(`/user/cover/update`, "PUT", formData);
  } catch (e) {
    throw e;
  }
};

export const removeCover = async () => {
  try {
    return await axiosCaller(`/user/cover/remove`, "PUT");
  } catch (e) {
    throw e;
  }
};

export const updateStatus = async (online: boolean) => {
  try {
    return await axiosCaller(`/user/status/update`, "PUT", { online });
  } catch (e) {
    throw e;
  }
};

export const updateNotification = async (notification: boolean) => {
  try {
    return await axiosCaller(`/user/notification/update`, "PUT", { notification });
  } catch (e) {
    throw e;
  }
};
