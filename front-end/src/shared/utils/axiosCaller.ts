import axios, { Method, ResponseType } from "axios";

export const axiosCaller = async function (
  endpoint: any,
  method: Method,
  data: any = {},
  params: any = {},
  responseType: ResponseType | undefined = "json"
) {
  try {
    const result = await axios.request({
      url: process.env.NEXT_PUBLIC_API_BASE_URL + endpoint,
      method,
      responseType,
      params,
      data: JSON.stringify({ ...data }),
      headers: {
        "Content-Type": "application/json",
        Authorization: localStorage.getItem("accessToken")
          ? "Bearer " + localStorage.getItem("accessToken")
          : "",
      },
    });
    return result.data;
  } catch (e) {
    throw e;
  }
};

export const axiosFormCaller = async function (
  endpoint: any,
  method: Method,
  data: any = {},
  params: any = {},
  responseType: ResponseType | undefined = "json"
) {
  try {
    const result = await axios.request({
      url: process.env.NEXT_PUBLIC_API_BASE_URL + endpoint,
      method,
      responseType,
      params,
      data,
      headers: {
        Authorization: localStorage.getItem("accessToken")
          ? "Bearer " + localStorage.getItem("accessToken")
          : "",
      },
    });
    return result.data;
  } catch (e) {
    throw e;
  }
};
