import { User } from "./user";

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
}

export interface RegisterDTO {
  name: string;
  username: string;
  email: string;
  password: string;
}