import { api } from "@/lib/api";
import { UserBook, ShelfStatus } from "@/types/book";

export const bookService = {
  async getUserShelf(status?: ShelfStatus): Promise<UserBook[]> {
    const response = await api.get<UserBook[]>("/books/user/shelf", {
      params: status ? { status } : undefined,
    });
    return response.data;
  },
};
