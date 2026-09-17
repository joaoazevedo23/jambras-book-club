export type ShelfStatus = "WANT_TO_READ" | "READING" | "COMPLETED";

export interface Book {
  id: string;
  title: string;
  author: string;
  coverUrl?: string | null;
  totalPages: number;
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
