import type { ScrollNewsCommentsResponse } from '../model/types';
import { scrollNewsMockDb } from './mockDb';

function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export async function fetchScrollNewsComments(args: {
  postId: string;
  cursor?: string | null;
}): Promise<ScrollNewsCommentsResponse> {
  await sleep(300);
  return await scrollNewsMockDb.fetchCommentsPage({
    postId: args.postId,
    cursor: args.cursor ?? null,
  });
}

