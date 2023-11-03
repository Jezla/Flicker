import { axiosCaller } from "../utils/axiosCaller";

export const logIn = async (email: string, password: string) => {
  try {
    return await axiosCaller("/auth/login", "POST", {
      email,
      password,
      deviceInfo: {
        deviceId: "1",
        deviceType: "DEVICE_TYPE_ANDROID",
        notificationToken: "flicker",
      },
    });
  } catch (e) {
    throw e;
  }
};

export const resendEmail = async (existingToken: string) => {
  try {
    return await axiosCaller("/auth/resendRegistrationToken", "GET", {}, { token: existingToken });
  } catch (e) {
    throw e;
  }
};

export const logout = async () => {
  try {
    return await axiosCaller("/user/logout", "POST", {
      deviceInfo: {
        deviceId: "1",
        deviceType: "DEVICE_TYPE_ANDROID",
        notificationToken: "flicker",
      },
    });
  } catch (e) {
    throw e;
  }
};

export const sendResetLink = async (email: string) => {
  try {
    return await axiosCaller("/auth/password/resetlink", "POST", {
      email,
    });
  } catch (e) {
    throw e;
  }
};

export const resetPassword = async (
  email: string,
  password: string,
  confirmPassword: string,
  token: string
) => {
  try {
    return await axiosCaller("/auth/password/reset", "POST", {
      email,
      password,
      confirmPassword,
      token,
    });
  } catch (e) {
    throw e;
  }
};
