const ACCESS_TOKEN_KEY = "@bookr:accessToken";
const REFRESH_TOKEN_KEY = "@bookr:refreshToken";

export const storage = {
  getAccessToken: () =>
    typeof window !== "undefined"
      ? localStorage.getItem(ACCESS_TOKEN_KEY)
      : null,
  setAccessToken: (token: string) =>
    localStorage.setItem(ACCESS_TOKEN_KEY, token),
  getRefreshToken: () =>
    typeof window !== "undefined"
      ? localStorage.getItem(REFRESH_TOKEN_KEY)
      : null,
  setRefreshToken: (token: string) =>
    localStorage.setItem(REFRESH_TOKEN_KEY, token),
  clearTokens: () => {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
  },
};
