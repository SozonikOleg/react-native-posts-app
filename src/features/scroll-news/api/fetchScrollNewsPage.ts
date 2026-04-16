import type { ScrollNewsPageResponse } from '@/entities/scroll-news/model/types';
import { apiGetJson } from '@/shared/api/http';
import { mapPost } from './mappers';

export async function fetchScrollNewsPage(args?: {
  cursor?: string | null;
  limit?: number;
  tier?: 'free' | 'paid';
}): Promise<ScrollNewsPageResponse> {
  const res = await apiGetJson<{
    ok: true;
    data: { posts: any[]; nextCursor: string | null; hasMore: boolean };
  }>('/posts', {
    cursor: args?.cursor ?? undefined,
    limit: args?.limit ?? undefined,
    tier: args?.tier ?? undefined,
  });

  return {
    posts: res.data.posts.map(mapPost),
    nextCursor: res.data.nextCursor,
    hasMore: res.data.hasMore,
  };
}

