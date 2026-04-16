import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  FlatList,
  Text,
  Vibration,
  View,
  StyleSheet,
} from 'react-native';
import {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import type {
  ScrollNewsComment,
  ScrollNewsPost,
} from '@/entities/scroll-news/model/types';
import { observer } from 'mobx-react-lite';
import { useRootStore } from '@/application/providers/rootStore';
import { useQueryClient } from '@tanstack/react-query';
import {
  useCreateScrollNewsComment,
  useScrollNewsCommentsInfinite,
} from '@/features/scroll-news/queries/hooks';
import { scrollNewsKeys } from '@/features/scroll-news/queries/keys';
import {
  CommentInputDock,
  CommentRowItem,
  CommentsHeaderRow,
  PaidCoverOverlay,
  PostActionsRow,
  PostCover,
  PostHeaderRow,
  PostTextBlock,
} from './components';
import { scrollNewsTokens as t } from '@/shared/theme/scrollNewsTokens';

const COMMENTS_ERROR_MESSAGE = 'Не удалось загрузить комментарии';
const WS_EVENTS_URL =
  'wss://k8s.mectest.ru/test-app/ws?token=550e8400-e29b-41d4-a716-446655440000';

type CommentUiState = {
  liked: boolean;
  likesCount: number;
};

type PendingCommentSignature = {
  postId: string;
  text: string;
  createdAtMs: number;
};

function resolveCoverUrl(coverUrl: string, postId: string) {
  if (!coverUrl || coverUrl.includes('picsum.photos')) {
    return `https://i.pravatar.cc/900?u=${postId}-cover`;
  }
  return coverUrl;
}

function normalizeCommentText(text: string) {
  return text.trim().replace(/\s+/g, ' ').toLowerCase();
}

function buildCommentUiStats(_commentId: string): CommentUiState {
  return {
    liked: false,
    likesCount: 0,
  };
}

function formatCount(value: number): string {
  if (value >= 1_000_000) {
    return `${(value / 1_000_000).toFixed(1)}M`;
  }
  if (value >= 1_000) {
    return `${(value / 1_000).toFixed(1)}K`;
  }
  return String(value);
}

function ScrollNewsPostPageImpl(props: {
  post: ScrollNewsPost;
  onBackPress?: () => void;
}) {
  const { post, onBackPress } = props;
  const { scrollNewsUi } = useRootStore();
  const qc = useQueryClient();
  const isPaid = post.tier === 'paid';
  const [coverUri, setCoverUri] = useState(() =>
    resolveCoverUrl(post.coverUrl, post.id),
  );
  const [liked, setLiked] = useState(Boolean(post.isLiked));
  const [likesCount, setLikesCount] = useState(post.likesCount);
  const [commentsCount, setCommentsCount] = useState(post.commentsCount);
  const commentsNewestFirst = scrollNewsUi.commentsNewestFirst;
  const commentDraft = scrollNewsUi.getCommentDraft(post.id);

  const commentsQuery = useScrollNewsCommentsInfinite(post.id);
  const createComment = useCreateScrollNewsComment();

  const comments = useMemo(
    () => (commentsQuery.data as any)?.flatComments ?? [],
    [commentsQuery.data],
  );
  const commentsError = commentsQuery.isError ? COMMENTS_ERROR_MESSAGE : null;
  const commentsLoading = commentsQuery.isLoading;
  const commentsLoadingMore = commentsQuery.isFetchingNextPage;
  const sendingComment = createComment.isPending;

  const [commentUi, setCommentUi] = useState<Record<string, CommentUiState>>(
    {},
  );
  const pendingCommentEchoRef = useRef<PendingCommentSignature[]>([]);
  const postIdRef = useRef(post.id);
  const likePulse = useSharedValue(1);

  const sortedComments = useMemo(() => {
    const next = [...comments];
    next.sort((a, b) => {
      const at = new Date(a.createdAt).getTime();
      const bt = new Date(b.createdAt).getTime();
      return commentsNewestFirst ? bt - at : at - bt;
    });
    return next;
  }, [comments, commentsNewestFirst]);

  useEffect(() => {
    postIdRef.current = post.id;
    setCoverUri(resolveCoverUrl(post.coverUrl, post.id));
    setLiked(Boolean(post.isLiked));
    setLikesCount(post.likesCount);
  }, [post.coverUrl, post.id, post.isLiked, post.likesCount]);

  const likePulseStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: likePulse.value }],
    };
  }, []);

  const onLikePress = useCallback(() => {
    const nextLiked = !liked;
    setLiked(nextLiked);
    setLikesCount(prev => Math.max(0, prev + (nextLiked ? 1 : -1)));

    // Light haptic feedback (fallback without extra deps).
    Vibration.vibrate(10);

    // Smooth count pulse.
    likePulse.value = withSequence(
      withTiming(1.12, {
        duration: 140,
        easing: Easing.out(Easing.quad),
      }),
      withTiming(1, {
        duration: 180,
        easing: Easing.out(Easing.quad),
      }),
    );
  }, [likePulse, liked]);

  const ensureCommentUiState = useCallback((commentId: string) => {
    setCommentUi(prev => {
      if (prev[commentId]) {
        return prev;
      }
      return {
        ...prev,
        [commentId]: buildCommentUiStats(commentId),
      };
    });
  }, []);

  const loadMoreComments = useCallback(async () => {
    const postId = postIdRef.current;
    if (!postId || commentsLoading || commentsLoadingMore) {
      return;
    }
    if (!commentsQuery.hasNextPage) {
      return;
    }
    await commentsQuery.fetchNextPage();
  }, [commentsLoading, commentsLoadingMore, commentsQuery]);

  useEffect(() => {
    setCommentsCount(post.commentsCount);
  }, [post.commentsCount]);

  useEffect(() => {
    let socket: WebSocket | null = null;
    try {
      socket = new WebSocket(WS_EVENTS_URL);
      socket.onopen = () => {
        console.log('[ScrollNews][WS] open', WS_EVENTS_URL);
      };
      socket.onerror = event => {
        console.log('[ScrollNews][WS] error', event);
      };
      socket.onclose = event => {
        console.log('[ScrollNews][WS] close', {
          code: event.code,
          reason: event.reason,
        });
      };
      socket.onmessage = event => {
        console.log('[ScrollNews][WS] message', String(event.data));
        try {
          const payload = JSON.parse(String(event.data)) as {
            type?: string;
            postId?: string;
            comment?: ScrollNewsComment;
          };
          if (
            payload.type === 'comment_added' &&
            payload.postId &&
            payload.comment
          ) {
            if (payload.postId !== post.id) {
              return;
            }
            const now = Date.now();
            pendingCommentEchoRef.current =
              pendingCommentEchoRef.current.filter(
                pending => now - pending.createdAtMs < 12_000,
              );
            const normalizedIncomingText = normalizeCommentText(
              payload.comment.text,
            );
            const pendingIdx = pendingCommentEchoRef.current.findIndex(
              pending =>
                pending.postId === payload.postId &&
                pending.text === normalizedIncomingText,
            );
            if (pendingIdx >= 0) {
              pendingCommentEchoRef.current.splice(pendingIdx, 1);
              return;
            }
            setCommentsCount(prev => prev + 1);
            ensureCommentUiState(payload.comment.id);
            // Let React Query sync comments list.
            qc.invalidateQueries({ queryKey: scrollNewsKeys.comments(post.id) });
          }
        } catch {
          // Ignore malformed event payloads.
        }
      };
    } catch {
      // Silent fallback: comments still work via REST polling.
    }

    return () => {
      if (socket) {
        socket.close();
      }
    };
  }, [ensureCommentUiState, post.id, qc]);

  const onSubmitComment = useCallback(async () => {
    const trimmed = commentDraft.trim();
    if (!trimmed || sendingComment) {
      return;
    }

    try {
      pendingCommentEchoRef.current.push({
        postId: post.id,
        text: normalizeCommentText(trimmed),
        createdAtMs: Date.now(),
      });
      const created = await createComment.mutateAsync({ postId: post.id, text: trimmed });
      ensureCommentUiState(created.id);
      setCommentsCount(prev => prev + 1);
      scrollNewsUi.clearCommentDraft(post.id);
    } catch {
      // errors are exposed via mutation state; keep local UI minimal
    }
  }, [
    commentDraft,
    createComment,
    ensureCommentUiState,
    post.id,
    sendingComment,
    scrollNewsUi,
  ]);

  const toggleCommentLike = useCallback((commentId: string) => {
    setCommentUi(prev => {
      const current = prev[commentId] || buildCommentUiStats(commentId);
      const nextLiked = !current.liked;
      return {
        ...prev,
        [commentId]: {
          liked: nextLiked,
          likesCount: Math.max(0, current.likesCount + (nextLiked ? 1 : -1)),
        },
      };
    });
  }, []);

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <FlatList
        style={styles.commentsScrollView}
        contentContainerStyle={styles.listContent}
        data={!isPaid ? sortedComments : []}
        keyExtractor={item => item.id}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        onEndReachedThreshold={0.4}
        onEndReached={() => {
          loadMoreComments();
        }}
        ListHeaderComponent={
          <View>
            <PostHeaderRow
              authorAvatarUrl={post.author.avatarUrl}
              authorDisplayName={post.author.displayName}
              onBackPress={onBackPress || (() => {})}
            />
            <PostCover
              coverUri={coverUri}
              blur={isPaid ? 52 : 0}
              onCoverError={() => {
                setCoverUri(`https://i.pravatar.cc/900?u=${post.author.id}-cover`);
              }}
              paidOverlay={isPaid ? <PaidCoverOverlay /> : null}
            />
            <PostTextBlock
              isPaid={isPaid}
              title={post.title}
              text={post.body?.trim() ? post.body : post.preview || ''}
            />
            {!isPaid ? (
              <PostActionsRow
                liked={liked}
                likesCountLabel={formatCount(likesCount)}
                commentsCountLabel={formatCount(commentsCount)}
                onLikePress={onLikePress}
                likePulseStyle={likePulseStyle}
              />
            ) : null}
            {!isPaid ? (
              <View style={styles.inlineCommentsWrap}>
                <CommentsHeaderRow
                  title={`${commentsCount} комментария`}
                  sortLabel={commentsNewestFirst ? 'Сначала новые' : 'Сначала старые'}
                  onToggleSort={() =>
                    scrollNewsUi.setCommentsNewestFirst(!commentsNewestFirst)
                  }
                />
                {commentsError ? (
                  <Text style={styles.commentsErrorText}>{commentsError}</Text>
                ) : null}
              </View>
            ) : null}
          </View>
        }
        ListEmptyComponent={
          isPaid ? null : commentsLoading ? (
            <View style={styles.commentsLoadingWrap}>
              <Text style={styles.commentsLoadingText}>Загрузка...</Text>
            </View>
          ) : (
            <Text style={styles.commentsEmptyText}>Пока нет комментариев</Text>
          )
        }
        renderItem={
          isPaid
            ? null
            : ({ item: comment }) => {
                const stats =
                  commentUi[comment.id] || buildCommentUiStats(comment.id);
                return (
                  <CommentRowItem
                    comment={comment}
                    liked={stats.liked}
                    likesCount={stats.likesCount}
                    onToggleLike={() => toggleCommentLike(comment.id)}
                  />
                );
              }
        }
        ListFooterComponent={
          isPaid ? null : commentsLoadingMore ? (
            <View style={styles.commentsLoadingMoreWrap}>
              <Text style={styles.commentsLoadingText}>Загрузка...</Text>
            </View>
          ) : null
        }
      />
      {!isPaid ? (
        <CommentInputDock
          value={commentDraft}
          onChangeText={text => scrollNewsUi.setCommentDraft(post.id, text)}
          onSend={onSubmitComment}
          disabled={sendingComment || !commentDraft.trim()}
        />
      ) : null}
    </SafeAreaView>
  );
}

export const ScrollNewsPostPage = observer(ScrollNewsPostPageImpl);

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: t.colors.pageBackground,
  },
  listContent: {
    paddingBottom: 30,
    backgroundColor: '#FFFFFF',
  },
  inlineCommentsWrap: {
    marginTop: 0,
    backgroundColor: '#FFFFFF',
    paddingTop: 12,
    alignSelf: 'stretch',
  },
  commentsErrorText: {
    color: '#DC2626',
    paddingHorizontal: 16,
    paddingBottom: 8,
    fontFamily: t.fontFamily.base,
    fontSize: 14,
  },
  commentsScrollView: {
    flex: 1,
  },
  commentsLoadingWrap: {
    paddingVertical: 26,
    alignItems: 'center',
  },
  commentsLoadingMoreWrap: {
    paddingVertical: 14,
    alignItems: 'center',
  },
  commentsLoadingText: {
    color: '#6B7280',
    fontFamily: t.fontFamily.base,
    fontSize: 15,
  },
  commentsEmptyText: {
    textAlign: 'center',
    fontFamily: t.fontFamily.base,
    fontSize: 15,
    paddingVertical: 20,
  },
});
