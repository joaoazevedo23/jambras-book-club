import { User } from './user';

export interface LoginDTO {
  login: string;
  password: string;
}

export interface Tokens {
  accessToken: string;
  refreshToken: string;
}

export interface AuthResponse {
  user: User;
  tokens: Tokens;
}

export interface RegisterDTO {
  name: string;
  username: string;
  email: string;
  password: string;
}