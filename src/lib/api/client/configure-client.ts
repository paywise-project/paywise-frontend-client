import { client } from "../client.gen";
import { axiosInstance } from "./axios-instance";

export function configureApiClient() {
  client.setConfig({
    baseURL: "https://paywise-api.dipper.ir",
    axios: axiosInstance,
  });
}
