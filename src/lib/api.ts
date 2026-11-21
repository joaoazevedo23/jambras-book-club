import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";
import { storage } from "./storage";

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001",
  headers: {
    "Content-Type": "application/json",
  },
});

let isRefreshing = false;
let logoutInProgress = false;
let authGeneration = 0;

export const beginLogout = () => {
  logoutInProgress = true;
  authGeneration += 1;
};

export const beginSession = () => {
  logoutInProgress = false;
  authGeneration += 1;
};

let failedQueue: Array<{
  resolve: (value?: unknown) => void;
  reject: (reason?: unknown) => void;
}> = [];

const processQueue = (
  error: AxiosError | null,
  token: string | null = null,
) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = storage.getAccessToken();
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    if (
      error.response?.status === 401 &&
      originalRequest &&
      !originalRequest._retry
    ) {
      if (
        originalRequest.url?.includes("/auth/refresh") ||
        originalRequest.url?.includes("/auth/login") ||
        originalRequest.url?.includes("/auth/register") ||
        originalRequest.url?.includes("/auth/logout")
      ) {
        storage.clearTokens();
        return Promise.reject(error);
      }

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${token}`;
            }
            return api(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refreshToken = storage.getRefreshToken();

      if (!refreshToken || logoutInProgress) {
        isRefreshing = false;
        storage.clearTokens();
        if (typeof window !== "undefined") {
          window.location.href = `${window.location.origin}/login`;
        }
        return Promise.reject(error);
      }

      const generationAtRefresh = authGeneration;

      try {
        const { data } = await axios.request({
          method: "post",
          url: `${api.defaults.baseURL}/auth/refresh`,
          headers: { Authorization: `Bearer ${refreshToken}` },
        });

        if (
          authGeneration !== generationAtRefresh ||
          storage.getRefreshToken() !== refreshToken
        ) {
          processQueue(error, null);
          return Promise.reject(error);
        }

        const accessToken = data.tokens?.accessToken || data.accessToken;
        const newRefreshToken = data.tokens?.refreshToken || data.refreshToken;

        storage.setAccessToken(accessToken);
        if (newRefreshToken) storage.setRefreshToken(newRefreshToken);

        api.defaults.headers.common.Authorization = `Bearer ${accessToken}`;
        processQueue(null, accessToken);

        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError as AxiosError, null);
        storage.clearTokens();
        if (typeof window !== "undefined") {
          window.location.href = `${window.location.origin}/login`;
        }
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  },
);
