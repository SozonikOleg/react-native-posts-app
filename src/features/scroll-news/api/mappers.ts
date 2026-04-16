import type {
  ScrollNewsAuthor,
  ScrollNewsComment,
  ScrollNewsPost,
} from '@/entities/scroll-news/model/types';

type ApiAuthor = {
  id: string;
  username?: string;
  displayName: string;
  avatarUrl: string;
  bio?: string;
  subscribersCount?: number;
  isVerified?: boolean;
};

type ApiPost = {
  id: string;
  author: ApiAuthor;
  title: string;
  body?: string;
  preview?: string;
  coverUrl?: string;
  likesCount: number;
  commentsCount: number;
  isLiked?: boolean;
  tier: 'free' | 'paid';
  createdAt: string;
};

type ApiComment = {
  id: string;
  postId: string;
  author: ApiAuthor;
  text: string;
  createdAt: string;
};

export function mapAuthor(a: ApiAuthor): ScrollNewsAuthor {
  return {
    id: a.id,
    displayName: a.displayName,
    avatarUrl: a.avatarUrl,
  };
}

export function mapPost(p: ApiPost): ScrollNewsPost {
  return {
    id: p.id,
    title: p.title,
    preview: p.preview,
    body: p.body,
    coverUrl: p.coverUrl,
    tier: p.tier,
    isLiked: p.isLiked,
    likesCount: p.likesCount,
    commentsCount: p.commentsCount,
    author: mapAuthor(p.author),
    createdAt: p.createdAt,
  };
}

export function mapComment(c: ApiComment): ScrollNewsComment {
  return {
    id: c.id,
    postId: c.postId,
    text: c.text,
    createdAt: c.createdAt,
    author: mapAuthor(c.author),
  };
}

