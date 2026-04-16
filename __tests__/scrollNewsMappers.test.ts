import { mapAuthor, mapComment, mapPost } from '@/features/scroll-news/api/mappers';

describe('scroll-news mappers', () => {
  test('mapAuthor keeps required fields', () => {
    const a = mapAuthor({
      id: 'author_1',
      displayName: 'Леша Крид',
      avatarUrl: 'https://example.com/a.png',
      username: 'lesha_krid',
      bio: 'bio',
      subscribersCount: 10,
      isVerified: true,
    });
    expect(a).toEqual({
      id: 'author_1',
      displayName: 'Леша Крид',
      avatarUrl: 'https://example.com/a.png',
    });
  });

  test('mapPost maps tier and counters', () => {
    const p = mapPost({
      id: 'post_1',
      author: {
        id: 'author_1',
        displayName: 'Author',
        avatarUrl: 'https://example.com/a.png',
      },
      title: 'Title',
      preview: 'Preview',
      body: '',
      coverUrl: 'https://example.com/c.png',
      likesCount: 12,
      commentsCount: 3,
      isLiked: true,
      tier: 'paid',
      createdAt: '2026-01-01T00:00:00.000Z',
    });
    expect(p.id).toBe('post_1');
    expect(p.tier).toBe('paid');
    expect(p.likesCount).toBe(12);
    expect(p.commentsCount).toBe(3);
    expect(p.author.displayName).toBe('Author');
  });

  test('mapComment maps postId and text', () => {
    const c = mapComment({
      id: 'comment_1',
      postId: 'post_1',
      author: {
        id: 'author_2',
        displayName: 'Author 2',
        avatarUrl: 'https://example.com/b.png',
      },
      text: 'Hi',
      createdAt: '2026-01-01T00:00:00.000Z',
    });
    expect(c.postId).toBe('post_1');
    expect(c.text).toBe('Hi');
    expect(c.author.id).toBe('author_2');
  });
});

