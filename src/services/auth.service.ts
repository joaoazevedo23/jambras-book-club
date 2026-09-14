import { api } from "@/lib/api";
import { LoginDTO, LoginResponse, RegisterDTO } from "@/types/auth";

export const authService = {
  async login(data: LoginDTO): Promise<LoginResponse> {
    const response = await api.post<LoginResponse>("/auth/login", data);
    return response.data;
  },

  async register(data: RegisterDTO): Promise<LoginResponse> {
    const response = await api.post<LoginResponse>("/auth/register", data);
    return response.data;
  },
};
