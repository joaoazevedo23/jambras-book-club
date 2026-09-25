export type ShelfStatus = "WANT_TO_READ" | "READING" | "COMPLETED";
export type TrackingMode = 'PAGES' | 'CHAPTERS';

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

export interface ReadingSession {
  id: string;
  userBookId: string;
  mode: TrackingMode;
  startPage?: number;
  endPage?: number;
  startChapter?: number;
  endChapter?: number;
  rating?: number;
  notes?: string;
  createdAt: string;
}

export interface CreateReadingSessionDTO {
  mode?: TrackingMode;
  startPage?: number;
  endPage?: number;
  startChapter?: number;
  endChapter?: number;
  rating?: number;
  notes?: string;
}
