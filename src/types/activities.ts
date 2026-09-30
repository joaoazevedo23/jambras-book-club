import { UserBook } from "./book";

export interface FeedUser {
  id: string;
  name: string;
  username: string;
  avatarUrl: string | null;
}

export interface FeedComment {
  id: string;
  userId: string;
  activityId: string;
  content: string;
  createdAt: string;
  user: FeedUser;
}

export interface FeedActivity {
  id: string;
  userId: string;
  type: string;
  readingSessionId?: string | null;
  competitionId?: string | null;
  metadata: Record<string, unknown>;
  createdAt: string;
  user: FeedUser;
  readingSession?: {
    id: string;
    mode: string;
    startPage?: number;
    endPage?: number;
    startChapter?: number;
    endChapter?: number;
    rating?: number;
    notes?: string;
    userBook: UserBook;
  } | null;
  comments: FeedComment[];
  _count: {
    likes: number;
    comments: number;
  };
  isLikedByMe: boolean;
}

export interface FeedMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface FeedResponse {
  data: FeedActivity[];
  meta: FeedMeta;
}
