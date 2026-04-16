import { ScrollNewsUiStore } from '@/application/providers/scrollNewsUiStore';
import type { ScrollNewsPost } from '@/entities/scroll-news/model/types';

function makePost(id: string, tier: 'free' | 'paid' = 'free'): ScrollNewsPost {
  return {
    id,
    title: `Post ${id}`,
    tier,
    likesCount: 0,
    commentsCount: 0,
    author: {
      id: 'author_1',
      displayName: 'Author',
      avatarUrl: 'https://example.com/avatar.png',
    },
    createdAt: new Date().toISOString(),
  };
}

describe('ScrollNewsUiStore', () => {
  test('changes active tab', () => {
    const store = new ScrollNewsUiStore();
    expect(store.activeTab).toBe('all');

    store.setActiveTab('paid');
    expect(store.activeTab).toBe('paid');
  });

  test('opens and closes post', () => {
    const store = new ScrollNewsUiStore();
    const post = makePost('post_1');

    store.openPost(post);
    expect(store.openedPost?.id).toBe('post_1');

    store.closePost();
    expect(store.openedPost).toBe(null);
  });

  test('toggleComments opens and closes comments panel', () => {
    const store = new ScrollNewsUiStore();
    expect(store.selectedPostId).toBe(null);

    store.toggleComments('post_1');
    expect(store.selectedPostId).toBe('post_1');
    expect(store.commentsNewestFirst).toBe(true);

    store.setCommentsNewestFirst(false);
    expect(store.commentsNewestFirst).toBe(false);

    store.toggleComments('post_1');
    expect(store.selectedPostId).toBe(null);
    expect(store.commentsNewestFirst).toBe(true);
  });

  test('comment draft is stored per post', () => {
    const store = new ScrollNewsUiStore();
    expect(store.getCommentDraft('post_1')).toBe('');

    store.setCommentDraft('post_1', 'Hello');
    store.setCommentDraft('post_2', 'World');
    expect(store.getCommentDraft('post_1')).toBe('Hello');
    expect(store.getCommentDraft('post_2')).toBe('World');

    store.clearCommentDraft('post_1');
    expect(store.getCommentDraft('post_1')).toBe('');
    expect(store.getCommentDraft('post_2')).toBe('World');
  });
});

