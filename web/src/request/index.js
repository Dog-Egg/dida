import axios from "axios";
import { message } from "antd";

const request = axios.create({
  baseURL: "/api",
  timeout: 5000
});

request.interceptors.response.use(
  response => {
    return response;
  },
  error => {
    message.error(error.message);
    return Promise.reject(error);
  }
);

export default request;
