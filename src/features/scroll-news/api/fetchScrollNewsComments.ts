import type { ScrollNewsCommentsResponse } from '@/entities/scroll-news/model/types';
import { apiGetJson } from '@/shared/api/http';
import { mapComment } from './mappers';

export async function fetchScrollNewsComments(args: {
  postId: string;
  cursor?: string | null;
  limit?: number;
}): Promise<ScrollNewsCommentsResponse> {
  const res = await apiGetJson<{
    ok: true;
    data: { comments: any[]; nextCursor: string | null; hasMore: boolean };
  }>(`/posts/${encodeURIComponent(args.postId)}/comments`, {
    cursor: args.cursor ?? undefined,
    limit: args.limit ?? undefined,
  });

  return {
    comments: res.data.comments.map(mapComment),
    nextCursor: res.data.nextCursor,
    hasMore: res.data.hasMore,
  };
}

