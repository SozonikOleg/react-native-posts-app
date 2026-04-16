import type {
  ScrollNewsAuthor,
  ScrollNewsComment,
  ScrollNewsPost,
  ScrollNewsPostTier,
} from '../model/types';

function isoNowMinus(minutes: number) {
  return new Date(Date.now() - minutes * 60_000).toISOString();
}

const authors: ScrollNewsAuthor[] = [
  {
    id: 'author_1',
    displayName: 'Анна Ильина',
    avatarUrl: 'https://i.pravatar.cc/150?u=author_1',
  },
  {
    id: 'author_2',
    displayName: 'Петр Федько',
    avatarUrl: 'https://i.pravatar.cc/150?u=author_2',
  },
  {
    id: 'author_3',
    displayName: 'Мария Зорина',
    avatarUrl: 'https://i.pravatar.cc/150?u=author_3',
  },
];

function makePost(idx: number, tier: ScrollNewsPostTier): ScrollNewsPost {
  const author = authors[idx % authors.length]!;
  const id = `post_${idx + 1}`;
  return {
    id,
    title:
      tier === 'paid'
        ? `Платный пост №${idx + 1}: закрытый разбор`
        : `Пост №${idx + 1}: новости и детали`,
    preview:
      tier === 'paid'
        ? 'Полный текст доступен после доната.'
        : 'Короткий анонс: что произошло и почему это важно.',
    body:
      tier === 'paid'
        ? 'Спасибо за поддержку! Здесь мог бы быть полный текст платного поста.'
        : 'Развернутый текст поста. Здесь может быть несколько абзацев с подробностями и контекстом.',
    coverUrl: `https://i.pravatar.cc/900?u=${id}-cover`,
    tier,
    isLiked: idx % 3 === 0,
    likesCount: 12 + idx * 3,
    commentsCount: Math.max(0, (idx * 7) % 23),
    author,
    createdAt: isoNowMinus(15 + idx * 7),
  };
}

const posts: ScrollNewsPost[] = Array.from({ length: 24 }).map((_, i) =>
  makePost(i, i % 5 === 0 ? 'paid' : 'free'),
);

let commentSeq = 1;
const commentsByPostId: Record<string, ScrollNewsComment[]> = {};

function ensureSeedComments(postId: string) {
  if (commentsByPostId[postId]) {
    return;
  }
  const seedCount = 5 + (Number(postId.replace(/\D+/g, '')) % 6);
  commentsByPostId[postId] = Array.from({ length: seedCount }).map((_, i) => {
    const author = authors[(i + 1) % authors.length]!;
    return {
      id: `c_${commentSeq++}`,
      postId,
      text:
        i % 2 === 0
          ? 'Интересно, спасибо! Есть источник?'
          : 'Согласен/согласна, похоже на правду.',
      createdAt: isoNowMinus(5 + i * 9),
      author,
    };
  });
}

export const scrollNewsMockDb = {
  async fetchPostsPage(args?: { cursor?: string | null; limit?: number }) {
    const limit = args?.limit ?? 8;
    const cursor = args?.cursor ?? null;
    const startIdx = cursor ? Number(cursor) : 0;
    const slice = posts.slice(startIdx, startIdx + limit);
    const nextIdx = startIdx + slice.length;
    const hasMore = nextIdx < posts.length;
    return {
      posts: slice,
      nextCursor: hasMore ? String(nextIdx) : null,
      hasMore,
    };
  },

  async fetchCommentsPage(args: {
    postId: string;
    cursor?: string | null;
    limit?: number;
  }) {
    const { postId } = args;
    ensureSeedComments(postId);
    const limit = args.limit ?? 20;
    const cursor = args.cursor ?? null;
    const all = commentsByPostId[postId] ?? [];
    const startIdx = cursor ? Number(cursor) : 0;
    const slice = all.slice(startIdx, startIdx + limit);
    const nextIdx = startIdx + slice.length;
    const hasMore = nextIdx < all.length;
    return {
      comments: slice,
      nextCursor: hasMore ? String(nextIdx) : null,
      hasMore,
    };
  },

  async createComment(args: { postId: string; text: string }) {
    const { postId, text } = args;
    ensureSeedComments(postId);
    const author = authors[0]!;
    const created: ScrollNewsComment = {
      id: `c_${commentSeq++}`,
      postId,
      text,
      createdAt: new Date().toISOString(),
      author,
    };
    commentsByPostId[postId] = [created, ...(commentsByPostId[postId] ?? [])];
    return created;
  },
};

