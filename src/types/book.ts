export type ShelfStatus = "WANT_TO_READ" | "READING" | "COMPLETED";

export interface Book {
  id: string;
  googleBooksId?: string | null;
  isbn?: string | null;
  title: string;
  author: string;
  description?: string | null;
  coverUrl?: string | null;
  totalPages: number;
  genres: string[];
}

export interface UserBook {
  id: string;
  userId: string;
  bookId: string;
  status: ShelfStatus;
  currentPage: number;
  book: Book;
  createdAt: string;
  updatedAt: string;
}

export interface ExternalBook {
  googleBooksId: string;
  title: string;
  author: string;
  description?: string | null;
  coverUrl?: string | null;
  pageCount?: number | null;
  isbn?: string | null;
  genres: string[];
}

export interface UpdateUserBookDTO {
  status: ShelfStatus;
  currentPage?: number;
}
