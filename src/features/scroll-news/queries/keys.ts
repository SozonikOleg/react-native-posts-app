export const scrollNewsKeys = {
  all: ['scrollNews'] as const,
  posts: (filter: 'all' | 'free' | 'paid') =>
    [...scrollNewsKeys.all, 'posts', { filter }] as const,
  comments: (postId: string) =>
    [...scrollNewsKeys.all, 'comments', { postId }] as const,
};

