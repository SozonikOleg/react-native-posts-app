import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';

import { createScrollNewsComment } from '../api/createScrollNewsComment';
import { fetchScrollNewsComments } from '../api/fetchScrollNewsComments';
import { fetchScrollNewsPage } from '../api/fetchScrollNewsPage';
import type { ScrollNewsComment, ScrollNewsPost } from '../model/types';
import { scrollNewsKeys } from './keys';

export function useScrollNewsPostsInfinite(filter: 'all' | 'free' | 'paid') {
  return useInfiniteQuery({
    queryKey: scrollNewsKeys.posts(filter),
    queryFn: ({ pageParam }) => fetchScrollNewsPage({ cursor: pageParam ?? null }),
    initialPageParam: null as string | null,
    getNextPageParam: lastPage => (lastPage.hasMore ? lastPage.nextCursor : null),
    select: data => {
      const all = data.pages.flatMap(p => p.posts);
      const filtered =
        filter === 'all' ? all : all.filter(p => p.tier === filter);
      return { ...data, flatPosts: filtered };
    },
  });
}

export function useScrollNewsComments(postId: string | null) {
  return useQuery({
    queryKey: postId ? scrollNewsKeys.comments(postId) : ['scrollNews', 'comments', 'none'],
    queryFn: () => {
      if (!postId) {
        return Promise.resolve({ comments: [], nextCursor: null, hasMore: false });
      }
      return fetchScrollNewsComments({ postId, cursor: null });
    },
    enabled: Boolean(postId),
  });
}

export function useScrollNewsCommentsInfinite(postId: string) {
  return useInfiniteQuery({
    queryKey: scrollNewsKeys.comments(postId),
    queryFn: ({ pageParam }) =>
      fetchScrollNewsComments({ postId, cursor: pageParam ?? null }),
    initialPageParam: null as string | null,
    getNextPageParam: lastPage => (lastPage.hasMore ? lastPage.nextCursor : null),
    select: data => {
      const flat = data.pages.flatMap(p => p.comments);
      return { ...data, flatComments: flat };
    },
  });
}

export function useCreateScrollNewsComment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (args: { postId: string; text: string }) =>
      createScrollNewsComment(args),
    onSuccess: (created: ScrollNewsComment) => {
      // Update comments cache (prepend) for post
      qc.setQueryData(scrollNewsKeys.comments(created.postId), (prev: any) => {
        if (!prev) return prev;
        // For infinite query
        if (prev.pages && Array.isArray(prev.pages)) {
          const first = prev.pages[0];
          const nextFirst = {
            ...first,
            comments: [created, ...(first.comments ?? [])],
          };
          return { ...prev, pages: [nextFirst, ...prev.pages.slice(1)] };
        }
        // For plain query
        if (prev.comments && Array.isArray(prev.comments)) {
          return { ...prev, comments: [created, ...prev.comments] };
        }
        return prev;
      });

      // Update posts cache counts (best-effort)
      const updatePosts = (key: readonly unknown[]) => {
        qc.setQueryData(key, (prev: any) => {
          if (!prev?.pages) return prev;
          const pages = prev.pages.map((p: any) => ({
            ...p,
            posts: (p.posts ?? []).map((post: ScrollNewsPost) =>
              post.id === created.postId
                ? { ...post, commentsCount: post.commentsCount + 1 }
                : post,
            ),
          }));
          return { ...prev, pages };
        });
      };
      updatePosts(scrollNewsKeys.posts('all'));
      updatePosts(scrollNewsKeys.posts('free'));
      updatePosts(scrollNewsKeys.posts('paid'));
    },
  });
}

