import { api } from "@/lib/api";
import {
  User,
  UserStats,
  UpdateUserDTO,
  ChangePasswordDTO,
} from "@/types/user";

export const userService = {
  async getMe(): Promise<User> {
    const response = await api.get<User>("/users/me");
    return response.data;
  },

  async updateProfile(dto: UpdateUserDTO): Promise<User> {
    const response = await api.patch<User>("/users/me", dto);
    return response.data;
  },

  async changePassword(dto: ChangePasswordDTO): Promise<{ message: string }> {
    const response = await api.patch<{ message: string }>(
      "/users/me/change-password",
      dto,
    );
    return response.data;
  },

  async updateAvatar(file: File): Promise<User> {
    const formData = new FormData();
    formData.append("file", file);

    const response = await api.patch<User>('/users/me/avatar', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  async getUserStats(): Promise<UserStats> {
    const response = await api.get<UserStats>("/users/me/stats");
    return response.data;
  },
};
