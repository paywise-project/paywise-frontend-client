import { client } from "../client.gen";
import { axiosInstance } from "./axios-instance";

export function configureApiClient() {
  client.setConfig({
    baseURL: process.env.NEXT_PUBLIC_API_BASE_URL,
    axios: axiosInstance,
  });
}
