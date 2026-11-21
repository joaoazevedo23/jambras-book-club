import { api, beginLogout } from "./api";
import { storage } from "./storage";
import { authService } from "../services/auth.service";

export const logoutSession = async (): Promise<void> => {
  beginLogout();
  const refreshToken = storage.getRefreshToken();

  try {
    if (refreshToken) {
      await authService.logout(refreshToken);
    }
  } catch {
    // Ignora erro de logout e limpa o estado local
  } finally {
    storage.clearTokens();
    delete api.defaults.headers.common.Authorization;
  }
};
