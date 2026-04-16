export type ScrollNewsAuthor = {
  id: string;
  displayName: string;
  avatarUrl: string;
};

export type ScrollNewsPostTier = 'free' | 'paid';

export type ScrollNewsPost = {
  id: string;
  title: string;
  preview?: string;
  body?: string;
  coverUrl?: string;
  tier: ScrollNewsPostTier;
  isLiked?: boolean;
  likesCount: number;
  commentsCount: number;
  author: ScrollNewsAuthor;
  createdAt: string;
};

export type ScrollNewsComment = {
  id: string;
  postId: string;
  text: string;
  createdAt: string;
  author: ScrollNewsAuthor;
};

export type ScrollNewsPageResponse = {
  posts: ScrollNewsPost[];
  nextCursor: string | null;
  hasMore: boolean;
};

export type ScrollNewsCommentsResponse = {
  comments: ScrollNewsComment[];
  nextCursor: string | null;
  hasMore: boolean;
};

