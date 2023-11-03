import { axiosCaller } from "../utils/axiosCaller";

export const getSystemLanguages = async () => {
  try {
    return await axiosCaller("/translate/supported-language-codes-and-names", "GET");
  } catch (e) {
    throw e;
  }
};

export const translate = async (text: string, targetLanguage: string) => {
  try {
    return await axiosCaller("/translate", "POST", { text, targetLanguage });
  } catch (e) {
    throw e;
  }
};

export const transcribe = async (audioFilePath: string) => {
  try {
    return await axiosCaller("/transcribe/audio", "POST", { audioFilePath });
  } catch (e) {
    throw e;
  }
};
