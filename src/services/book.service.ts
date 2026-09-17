import { api } from "@/lib/api";
import {
  UserBook,
  ShelfStatus,
  ExternalBook,
  Book,
  UpdateUserBookDTO,
} from "@/types/book";

export const bookService = {
  async getUserShelf(status?: ShelfStatus): Promise<UserBook[]> {
    const response = await api.get<UserBook[]>("/books/user/shelf", {
      params: status ? { status } : undefined,
    });
    return response.data;
  },

  async searchExternal(query: string): Promise<ExternalBook[]> {
    if (!query.trim()) return [];
    const response = await api.get<ExternalBook[]>("/books/search/external", {
      params: { q: query },
    });
    return response.data;
  },

  async importFromGoogle(googleBooksId: string): Promise<Book> {
    const response = await api.post<Book>(`/books/import/${googleBooksId}`);
    return response.data;
  },

  async updateShelf(bookId: string, dto: UpdateUserBookDTO): Promise<UserBook> {
    const response = await api.patch<UserBook>(`/books/${bookId}/shelf`, dto);
    return response.data;
  },
};
