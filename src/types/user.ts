export interface User {
  id: string;
  email: string;
  username: string;
  name: string;
  avatarUrl: string | null;
  bio?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface UserStats {
  totalPagesRead: number;
  totalChaptersRead: number;
  completedBooksCount: number;
  completedThisMonth: number;
  currentStreak: number;
  favoriteGenres: string[];
}

export interface UpdateUserDTO {
  name?: string;
  username?: string;
  bio?: string;
}

export interface ChangePasswordDTO {
  oldPassword: string;
  newPassword: string;
}