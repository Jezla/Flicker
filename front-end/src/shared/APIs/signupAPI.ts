import { axiosCaller } from "../utils/axiosCaller";

export const signUp = async (
  email: string,
  username: string,
  phoneNumber: string,
  password: string
) => {
  try {
    return await axiosCaller("/auth/register", "POST", {
      email,
      username,
      phoneNumber,
      password,
      registerAsAdmin: false,
    });
  } catch (e) {
    throw e;
  }
};
