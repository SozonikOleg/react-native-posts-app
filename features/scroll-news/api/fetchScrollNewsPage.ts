import type { ScrollNewsPageResponse } from '../model/types';
import { scrollNewsMockDb } from './mockDb';

function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export async function fetchScrollNewsPage(args?: {
  cursor?: string | null;
}): Promise<ScrollNewsPageResponse> {
  // Small delay to mimic real network.
  await sleep(350);
  return await scrollNewsMockDb.fetchPostsPage({ cursor: args?.cursor ?? null });
}

