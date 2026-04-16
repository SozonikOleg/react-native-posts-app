import type { ScrollNewsComment } from '../model/types';
import { scrollNewsMockDb } from './mockDb';

function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export async function createScrollNewsComment(args: {
  postId: string;
  text: string;
}): Promise<ScrollNewsComment> {
  await sleep(250);
  return await scrollNewsMockDb.createComment(args);
}

