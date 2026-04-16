import { apiPostJson } from '@/shared/api/http';

export type ToggleLikeResult = {
  isLiked: boolean;
  likesCount: number;
};

export async function toggleScrollNewsLike(args: {
  postId: string;
}): Promise<ToggleLikeResult> {
  const res = await apiPostJson<{
    ok: true;
    data: ToggleLikeResult;
  }>(`/posts/${encodeURIComponent(args.postId)}/like`);

  return res.data;
}

