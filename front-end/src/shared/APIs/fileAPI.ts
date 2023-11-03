import { axiosFormCaller } from "../utils/axiosCaller";

export const sendFiles = async (conversationId: number, files: File[]) => {
  try {
    const formData = new FormData();
    for (let i = 0; i < files.length; i++) {
      formData.append("files", files[i], files[i].name);
    }
    return await axiosFormCaller(`/conversation/files/upload/${conversationId}`, "POST", formData);
  } catch (e) {
    throw e;
  }
};
