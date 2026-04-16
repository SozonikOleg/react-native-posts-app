import type { ScrollNewsComment } from '@/entities/scroll-news/model/types';
import { apiPostJson } from '@/shared/api/http';
import { mapComment } from './mappers';

export async function createScrollNewsComment(args: {
  postId: string;
  text: string;
}): Promise<ScrollNewsComment> {
  const res = await apiPostJson<{
    ok: true;
    data: { comment: any };
  }>(`/posts/${encodeURIComponent(args.postId)}/comments`, { text: args.text });

  return mapComment(res.data.comment);
}

