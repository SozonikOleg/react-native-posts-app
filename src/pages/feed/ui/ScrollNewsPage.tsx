import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  Animated,
  Easing,
  FlatList,
  Image,
  Platform,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  Vibration,
  useWindowDimensions,
  View,
} from 'react-native';
import {
  Easing as ReanimatedEasing,
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { scrollNewsTokens as t } from '@/shared/theme/scrollNewsTokens';
import type {
  ScrollNewsComment,
  ScrollNewsPost,
} from '@/entities/scroll-news/model/types';
import { ScrollNewsPostPage } from '@/pages/post/ui/ScrollNewsPostPage';
import { observer } from 'mobx-react-lite';
import { useRootStore } from '@/application/providers/rootStore';
import {
  useCreateScrollNewsComment,
  useScrollNewsComments,
  useScrollNewsPostsInfinite,
} from '@/features/scroll-news/queries/hooks';
import {
  FeedCardActions,
  FeedCardBody,
  FeedCardCover,
  FeedCardHeader,
  FeedCommentRow,
  FeedInlineCommentsList,
  InlineCommentsSection,
} from './components';
import { SCROLL_NEWS_TEXT } from './constants/texts';

const FORCE_SKELETONS = false;
const ERROR_PREVIEW_AUTHOR_NAME = 'Петр Федько';
const ERROR_PREVIEW_AUTHOR_AVATAR = 'https://i.pravatar.cc/150?u=author_2';

function formatCount(value: number): string {
  if (value >= 1_000_000) {
    return `${(value / 1_000_000).toFixed(1)}M`;
  }
  if (value >= 1_000) {
    return `${(value / 1_000).toFixed(1)}K`;
  }
  return String(value);
}

function useSkeletonPulse() {
  const opacity = useMemo(() => new Animated.Value(0.55), []);
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 0.9,
          duration: 700,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.45,
          duration: 700,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [opacity]);
  return opacity;
}

function SkeletonBone({
  pulse,
  style,
}: {
  pulse: Animated.Value;
  style: object;
}) {
  return (
    <Animated.View style={[styles.skeletonBone, style, { opacity: pulse }]} />
  );
}

function ScrollNewsCardSkeleton() {
  const pulse = useSkeletonPulse();
  return (
    <View style={styles.card}>
      <View style={styles.authorRow}>
        <SkeletonBone pulse={pulse} style={styles.skeletonAvatar} />
        <SkeletonBone pulse={pulse} style={styles.skeletonAuthorName} />
      </View>
      <SkeletonBone pulse={pulse} style={styles.skeletonCover} />
      <View style={styles.contentBlock}>
        <SkeletonBone pulse={pulse} style={styles.skeletonTitle} />
        <SkeletonBone pulse={pulse} style={styles.skeletonText} />
      </View>
      <View style={styles.actionsRow}>
        <SkeletonBone pulse={pulse} style={styles.skeletonPill} />
        <SkeletonBone pulse={pulse} style={styles.skeletonPill} />
      </View>
    </View>
  );
}

function ScrollNewsFeedSkeleton() {
  return (
    <View style={styles.listContent}>
      <ScrollNewsCardSkeleton />
      <ScrollNewsCardSkeleton />
      <ScrollNewsCardSkeleton />
    </View>
  );
}

const API_UNAVAILABLE_MESSAGE = "Не удалось загрузить публикацию";
const COMMENTS_ERROR_MESSAGE = "Не удалось загрузить комментарии";
const WS_EVENTS_URL =
  "wss://k8s.mectest.ru/test-app/ws?token=550e8400-e29b-41d4-a716-446655440000";
type PostsFilterTab = "all" | "free" | "paid";
const FILTER_TABS: readonly {
  key: PostsFilterTab;
  label: string;
}[] = [
  { key: "all", label: "Все" },
  { key: "free", label: "Бесплатные" },
  { key: "paid", label: "Платные" },
];

type CommentUiState = {
  liked: boolean;
  likesCount: number;
};

type PendingCommentSignature = {
  postId: string;
  text: string;
  createdAtMs: number;
};

function buildCommentUiStats(_commentId: string) {
  return {
    liked: false,
    likesCount: 0,
  };
}

function normalizeCommentText(text: string) {
  return text.trim().replace(/\s+/g, " ").toLowerCase();
}

type FeedCardProps = {
  item: ScrollNewsPost;
  onOpenPost: (post: ScrollNewsPost) => void;
  onToggleComments: (post: ScrollNewsPost) => void;
  commentsSection?: React.ReactNode;
};

function resolveInitialCoverUrl(item: ScrollNewsPost): string {
  if (!item.coverUrl) {
    return `https://i.pravatar.cc/900?u=${item.id}-cover`;
  }
  // picsum часто блокируется (403), поэтому сразу меняем на стабильный CDN.
  if (item.coverUrl.includes("picsum.photos")) {
    return `https://i.pravatar.cc/900?u=${item.id}-cover`;
  }
  return item.coverUrl;
}

function FeedCard({
  item,
  onOpenPost,
  onToggleComments,
  commentsSection,
}: FeedCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [coverUri, setCoverUri] = useState(() => resolveInitialCoverUrl(item));
  const [liked, setLiked] = useState(Boolean(item.isLiked));
  const [likesCount, setLikesCount] = useState(item.likesCount);
  const isPaidPost = item.tier === "paid";
  const collapsedText = item.preview || item.body || "";
  const expandedText = item.body?.trim() ? item.body : collapsedText;
  const canExpand =
    expandedText.trim().length > collapsedText.trim().length ||
    collapsedText.trim().length > 90;

  const likeFill = useRef(new Animated.Value(item.isLiked ? 1 : 0)).current;
  const likeFg = likeFill.interpolate({
    inputRange: [0, 1],
    outputRange: [t.colors.textMuted, t.colors.textOnAccent],
  });
  const likeBg = likeFill.interpolate({
    inputRange: [0, 1],
    outputRange: [t.colors.pillNeutralBg, t.colors.likeActiveBg],
  });
  const likePulse = useSharedValue(1);

  const likePulseStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: likePulse.value }],
    };
  }, []);

  useEffect(() => {
    setExpanded(false);
    setCoverUri(resolveInitialCoverUrl(item));
    setLiked(Boolean(item.isLiked));
    setLikesCount(item.likesCount);
    likeFill.setValue(item.isLiked ? 1 : 0);
  }, [item, likeFill]);

  const onLikePress = () => {
    const nextLiked = !liked;
    setLiked(nextLiked);
    setLikesCount((prev) => Math.max(0, prev + (nextLiked ? 1 : -1)));

    Vibration.vibrate(10);
    likePulse.value = withSequence(
      withTiming(1.12, {
        duration: 140,
        easing: ReanimatedEasing.out(ReanimatedEasing.quad),
      }),
      withTiming(1, {
        duration: 180,
        easing: ReanimatedEasing.out(ReanimatedEasing.quad),
      }),
    );

    Animated.timing(likeFill, {
      toValue: nextLiked ? 1 : 0,
      duration: 240,
      easing: Easing.inOut(Easing.ease),
      useNativeDriver: false,
    }).start();
  };

  return (
    <View style={styles.card}>
      <Pressable onPress={() => onOpenPost(item)}>
        <FeedCardHeader
          avatarUrl={item.author.avatarUrl}
          displayName={item.author.displayName}
        />
        <FeedCardCover
          coverUri={coverUri}
          blur={isPaidPost ? 52 : 0}
          paid={isPaidPost}
          onError={() => {
            setCoverUri(`https://i.pravatar.cc/900?u=${item.author.id}-cover`);
          }}
        />
        <FeedCardBody
          title={item.title}
          collapsedText={collapsedText}
          expandedText={expandedText}
          expanded={expanded}
          canExpand={canExpand}
          onShowMore={() => setExpanded(true)}
          isPaid={isPaidPost}
        />
      </Pressable>
      {!isPaidPost ? (
        <FeedCardActions
          likeBg={likeBg}
          likeFg={likeFg}
          likePulseStyle={likePulseStyle}
          likesCountLabel={formatCount(likesCount)}
          commentsCountLabel={formatCount(item.commentsCount)}
          onLikePress={onLikePress}
          onCommentsPress={() => onToggleComments(item)}
        />
      ) : null}
      {!isPaidPost ? commentsSection || null : null}
    </View>
  );
}

function ScrollNewsPageImpl() {
  const { width: winWidth } = useWindowDimensions();
  const { scrollNewsUi } = useRootStore();
  const activeTab = scrollNewsUi.activeTab as PostsFilterTab;
  const selectedPostId = scrollNewsUi.selectedPostId;
  const openedPost = scrollNewsUi.openedPost;
  const commentsNewestFirst = scrollNewsUi.commentsNewestFirst;

  const postsQuery = useScrollNewsPostsInfinite(activeTab);
  const commentsQuery = useScrollNewsComments(selectedPostId);
  const createComment = useCreateScrollNewsComment();

  const items = useMemo(
    () => (postsQuery.data as any)?.flatPosts ?? [],
    [postsQuery.data],
  );
  const comments = useMemo(
    () => commentsQuery.data?.comments ?? [],
    [commentsQuery.data],
  );
  const commentsError = commentsQuery.isError ? COMMENTS_ERROR_MESSAGE : null;
  const commentsLoading = commentsQuery.isLoading;
  const commentDraft = selectedPostId
    ? scrollNewsUi.getCommentDraft(selectedPostId)
    : "";
  const sendingComment = createComment.isPending;

  const [commentUi, setCommentUi] = useState<Record<string, CommentUiState>>(
    {},
  );

  const commentsRef = useRef<ScrollNewsComment[]>([]);
  const selectedPostIdRef = useRef<string | null>(null);
  const pendingCommentEchoRef = useRef<PendingCommentSignature[]>([]);

  const errorIllustrationWidth = Math.round(
    (winWidth - 16 * 2 - 16 * 2) * 0.45,
  );
  const errorIllustrationHeight = Math.round(
    (errorIllustrationWidth * 81) / 112,
  );
  const filteredItems = items;
  const sortedComments = useMemo(() => {
    const next = [...comments];
    next.sort((a, b) => {
      const at = new Date(a.createdAt).getTime();
      const bt = new Date(b.createdAt).getTime();
      return commentsNewestFirst ? bt - at : at - bt;
    });
    return next;
  }, [comments, commentsNewestFirst]);
  const selectedPostCommentsCount = useMemo(() => {
    if (!selectedPostId) {
      return comments.length;
    }
    const matched = items.find((item) => item.id === selectedPostId);
    return matched?.commentsCount ?? comments.length;
  }, [comments.length, items, selectedPostId]);

  useEffect(() => {
    commentsRef.current = comments;
  }, [comments]);

  useEffect(() => {
    selectedPostIdRef.current = selectedPostId;
  }, [selectedPostId]);

  const ensureCommentUiState = useCallback((commentId: string) => {
    setCommentUi((prev) => {
      if (prev[commentId]) {
        return prev;
      }
      return {
        ...prev,
        [commentId]: buildCommentUiStats(commentId),
      };
    });
  }, []);

  const addCommentToFeed = useCallback((postId: string, delta: number) => {
    if (delta === 0) {
      return;
    }
    setItems((prev) =>
      prev.map((post) =>
        post.id === postId
          ? { ...post, commentsCount: Math.max(0, post.commentsCount + delta) }
          : post,
      ),
    );
  }, []);

  const addCommentToPanel = useCallback(
    (incoming: ScrollNewsComment) => {
      const selectedId = selectedPostIdRef.current;
      if (!selectedId || selectedId !== incoming.postId) {
        return false;
      }
      const exists = commentsRef.current.some(
        (comment) => comment.id === incoming.id,
      );
      if (exists) {
        return false;
      }
      setComments((prev) => [incoming, ...prev]);
      ensureCommentUiState(incoming.id);
      return true;
    },
    [ensureCommentUiState],
  );

  const toggleCommentsForPost = useCallback(
    async (post: ScrollNewsPost) => {
      scrollNewsUi.toggleComments(post.id);
    },
    [scrollNewsUi],
  );

  const onSubmitComment = useCallback(async () => {
    const postId = selectedPostIdRef.current;
    const trimmed = commentDraft.trim();
    if (!postId || !trimmed || sendingComment) {
      return;
    }

    try {
      pendingCommentEchoRef.current.push({
        postId,
        text: normalizeCommentText(trimmed),
        createdAtMs: Date.now(),
      });
      const created = await createComment.mutateAsync({
        postId,
        text: trimmed,
      });
      const inserted = addCommentToPanel(created);
      if (!inserted) {
        ensureCommentUiState(created.id);
      }
      scrollNewsUi.clearCommentDraft(postId);
    } catch {
      // react-query exposes errors; keep UI simple here
    }
  }, [
    addCommentToPanel,
    commentDraft,
    createComment,
    ensureCommentUiState,
    sendingComment,
    scrollNewsUi,
  ]);

  const toggleCommentLike = useCallback((commentId: string) => {
    setCommentUi((prev) => {
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

  const loadFirstPage = useCallback(async () => {
    await postsQuery.refetch();
  }, [postsQuery]);

  useEffect(() => {
    let socket: WebSocket | null = null;
    try {
      socket = new WebSocket(WS_EVENTS_URL);
      socket.onopen = () => {
        // Debug WS lifecycle/events in RN DevTools console.
        console.log("[ScrollNews][WS] open", WS_EVENTS_URL);
      };
      socket.onerror = (event) => {
        console.log("[ScrollNews][WS] error", event);
      };
      socket.onclose = (event) => {
        console.log("[ScrollNews][WS] close", {
          code: event.code,
          reason: event.reason,
        });
      };
      socket.onmessage = (event) => {
        console.log("[ScrollNews][WS] message", String(event.data));
        try {
          const payload = JSON.parse(String(event.data)) as {
            type?: string;
            postId?: string;
            comment?: ScrollNewsComment;
          };
          if (
            payload.type === "comment_added" &&
            payload.postId &&
            payload.comment
          ) {
            const now = Date.now();
            pendingCommentEchoRef.current =
              pendingCommentEchoRef.current.filter(
                (pending) => now - pending.createdAtMs < 12_000,
              );
            const normalizedIncomingText = normalizeCommentText(
              payload.comment.text,
            );
            const pendingIdx = pendingCommentEchoRef.current.findIndex(
              (pending) =>
                pending.postId === payload.postId &&
                pending.text === normalizedIncomingText,
            );
            if (pendingIdx >= 0) {
              pendingCommentEchoRef.current.splice(pendingIdx, 1);
              return;
            }
            const isDuplicateInOpenPost =
              selectedPostIdRef.current === payload.postId &&
              commentsRef.current.some(
                (comment) => comment.id === payload.comment?.id,
              );
            const inserted = addCommentToPanel(payload.comment);
            if (inserted) {
              return;
            }
            if (!isDuplicateInOpenPost) {
              // cache will update on next refetch; skip manual mutation here
            }
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
  }, [addCommentToFeed, addCommentToPanel]);

  const onRefresh = useCallback(async () => {
    await postsQuery.refetch();
  }, [postsQuery]);

  const onEndReached = useCallback(async () => {
    if (postsQuery.isFetchingNextPage || !postsQuery.hasNextPage) {
      return;
    }
    await postsQuery.fetchNextPage();
  }, [postsQuery]);

  const listFooter = useMemo(() => {
    if (!postsQuery.isFetchingNextPage) {
      return <View style={styles.footerSpacer} />;
    }
    return (
      <View style={styles.footerLoader}>
        <SkeletonBone
          pulse={new Animated.Value(0.75)}
          style={styles.skeletonFooter}
        />
      </View>
    );
  }, [postsQuery.isFetchingNextPage]);

  const onOpenPost = useCallback(
    (post: ScrollNewsPost) => {
      scrollNewsUi.openPost(post);
    },
    [scrollNewsUi],
  );

  if (openedPost) {
    return (
      <ScrollNewsPostPage
        post={openedPost}
        onBackPress={() => scrollNewsUi.closePost()}
      />
    );
  }

  if (FORCE_SKELETONS || (postsQuery.isLoading && items.length === 0)) {
    return (
      <SafeAreaView style={styles.safe} edges={["top"]}>
        <ScrollNewsFeedSkeleton />
      </SafeAreaView>
    );
  }

  const error =
    postsQuery.isError && items.length === 0 ? API_UNAVAILABLE_MESSAGE : null;

  if (error && items.length === 0) {
    return (
      <SafeAreaView style={styles.errorSafe} edges={["top"]}>
        <View style={styles.errorCard}>
          <View style={styles.errorAuthorRow}>
            <Image
              source={{ uri: ERROR_PREVIEW_AUTHOR_AVATAR }}
              style={styles.errorAvatar}
            />
            <Text style={styles.errorAuthorName} numberOfLines={1}>
              {ERROR_PREVIEW_AUTHOR_NAME}
            </Text>
          </View>
          <View style={styles.errorBody}>
            <View
              style={[
                styles.errorIllustration,
                {
                  width: errorIllustrationWidth,
                  height: errorIllustrationHeight,
                  borderRadius: 14,
                  backgroundColor: "#E7E9ED",
                },
              ]}
            />
            <Text style={styles.errorTitle}>{error}</Text>
            <Pressable onPress={loadFirstPage} style={styles.errorRetryButton}>
              <Text style={styles.errorRetryLabel}>Повторить</Text>
            </Pressable>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <View style={styles.tabsWrap}>
        <View style={styles.tabsTrack}>
          {FILTER_TABS.map((tab) => {
            const isActive = tab.key === activeTab;
            return (
              <Pressable
                key={tab.key}
                style={[styles.tabItem, isActive && styles.tabItemActive]}
                onPress={() => scrollNewsUi.setActiveTab(tab.key)}
              >
                <Text
                  style={[styles.tabLabel, isActive && styles.tabLabelActive]}
                >
                  {tab.label}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>
      <FlatList
        data={filteredItems}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => {
          const isCommentsOpen = selectedPostId === item.id;
          return (
            <FeedCard
              item={item}
              onOpenPost={onOpenPost}
              onToggleComments={toggleCommentsForPost}
              commentsSection={
                isCommentsOpen ? (
                  <InlineCommentsSection
                    title={`${selectedPostCommentsCount} комментария`}
                    sortLabel={
                      commentsNewestFirst
                        ? SCROLL_NEWS_TEXT.sortNewFirst
                        : SCROLL_NEWS_TEXT.sortOldFirst
                    }
                    onToggleSort={() =>
                      scrollNewsUi.setCommentsNewestFirst(!commentsNewestFirst)
                    }
                    error={commentsError}
                    loading={commentsLoading}
                    commentsEmpty={sortedComments.length === 0}
                    list={
                      <FeedInlineCommentsList>
                        {sortedComments.map((comment) => {
                          const stats =
                            commentUi[comment.id] ||
                            buildCommentUiStats(comment.id);
                          return (
                            <FeedCommentRow
                              key={comment.id}
                              comment={comment}
                              liked={stats.liked}
                              likesCount={stats.likesCount}
                              onToggleLike={() => toggleCommentLike(comment.id)}
                            />
                          );
                        })}
                      </FeedInlineCommentsList>
                    }
                    input={
                      <View style={styles.commentInputBar}>
                        <TextInput
                          value={commentDraft}
                          onChangeText={(text) => {
                            if (selectedPostIdRef.current) {
                              scrollNewsUi.setCommentDraft(
                                selectedPostIdRef.current,
                                text,
                              );
                            }
                          }}
                          placeholder="Ваш комментарий"
                          placeholderTextColor="#9CA3AF"
                          style={styles.commentInput}
                          maxLength={500}
                        />
                        <Pressable
                          style={styles.commentSendButton}
                          onPress={onSubmitComment}
                          disabled={sendingComment || !commentDraft.trim()}
                        >
                          <Text
                            style={[
                              styles.commentSendIcon,
                              sendingComment || !commentDraft.trim()
                                ? styles.commentSendIconDisabled
                                : styles.commentSendIconActive,
                            ]}
                          >
                            ➤
                          </Text>
                        </Pressable>
                      </View>
                    }
                  />
                ) : undefined
              }
            />
          );
        }}
        contentContainerStyle={styles.listContent}
        onEndReachedThreshold={0.4}
        onEndReached={onEndReached}
        ListFooterComponent={listFooter}
        refreshControl={
          <RefreshControl
            refreshing={postsQuery.isRefetching}
            onRefresh={onRefresh}
            tintColor={t.colors.paidAccent}
          />
        }
      />
    </SafeAreaView>
  );
}

export const ScrollNewsPage = observer(ScrollNewsPageImpl);

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: t.colors.pageBackground,
  },
  errorSafe: {
    flex: 1,
    backgroundColor: t.colors.errorScreenBackground,
  },
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  listContent: {
    paddingBottom: 12,
  },
  tabsWrap: {
    paddingHorizontal: 16,
    marginBottom: 5,
  },
  tabsTrack: {
    flexDirection: "row",
    backgroundColor: "#F4F6F8",
    borderWidth: 1.5,
    borderColor: "#D3D9E1",
    borderRadius: 40,
    padding: 3,
  },
  tabItem: {
    flex: 1,
    height: 38,
    borderRadius: 32,
    alignItems: "center",
    justifyContent: "center",
  },
  tabItemActive: {
    backgroundColor: t.colors.paidAccent,
  },
  tabLabel: {
    color: "#5A6778",
    fontSize: 13,
    lineHeight: 18,
    fontFamily: t.fontFamily.base,
    fontWeight: "500",
  },
  tabLabelActive: {
    color: t.colors.textOnAccent,
    fontWeight: "700",
  },
  inlineCommentsWrap: {
    backgroundColor: "#FFFFFF",
    paddingTop: 8,
    alignSelf: "stretch",
  },
  commentsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  commentsTitle: {
    color: "#667085",
    fontFamily: t.fontFamily.base,
    fontWeight: "500",
    fontSize: 15,
    lineHeight: 20,
  },
  commentsSort: {
    color: t.colors.paidAccent,
    fontFamily: t.fontFamily.base,
    fontWeight: "500",
    fontSize: 15,
    lineHeight: 22,
  },
  commentsListContent: {
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  commentsScrollableArea: {
    height: 245,
    backgroundColor: "#FFFFFF",
    overflow: "hidden",
  },
  commentsScrollView: {
    flex: 1,
  },
  commentsLoadingWrap: {
    paddingVertical: 26,
    alignItems: "center",
  },
  commentsLoadingText: {
    color: "#6B7280",
    fontFamily: t.fontFamily.base,
    fontSize: 15,
  },
  commentsErrorText: {
    color: "#DC2626",
    paddingHorizontal: 16,
    paddingBottom: 8,
    fontFamily: t.fontFamily.base,
    fontSize: 14,
  },
  commentsEmptyText: {
    textAlign: "center",
    color: "#6B7280",
    fontFamily: t.fontFamily.base,
    fontSize: 15,
    paddingVertical: 20,
  },
  commentRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    paddingVertical: 8,
  },
  commentAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: t.colors.avatarPlaceholder,
  },
  commentBodyWrap: {
    flex: 1,
    marginLeft: 12,
    marginRight: 16,
    maxWidth: "72%",
  },
  commentAuthor: {
    color: "#111827",
    fontFamily: t.fontFamily.base,
    fontWeight: "700",
    fontSize: 16,
    lineHeight: 22,
  },
  commentText: {
    color: "#1F2937",
    fontFamily: t.fontFamily.base,
    fontSize: 15,
    lineHeight: 21,
    flexShrink: 1,
  },
  commentLikeWrap: {
    width: 44,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    marginTop: 8,
  },
  commentLikeIcon: {
    fontSize: 20,
    color: "#667085",
    lineHeight: 20,
  },
  commentLikeIconActive: {
    color: "#F72585",
  },
  commentLikeCount: {
    marginLeft: 6,
    marginBottom: 4,
    color: "#4B5563",
    fontFamily: t.fontFamily.base,
    fontWeight: "700",
    fontSize: 13,
  },
  commentInputBar: {
    marginTop: 0,
    marginBottom: Platform.OS === "ios" ? 16 : 12,
    marginHorizontal: 0,
    paddingTop: 8,
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
  },
  commentInput: {
    flex: 1,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#D7DEE8",
    paddingHorizontal: 18,
    color: "#111827",
    fontFamily: t.fontFamily.base,
    fontSize: 15,
  },
  commentSendButton: {
    width: 46,
    height: 46,
    borderRadius: 23,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 6,
  },
  commentSendIcon: {
    fontSize: 32,
    lineHeight: 32,
  },
  commentSendIconActive: {
    color: "#6115CD",
  },
  commentSendIconDisabled: {
    color: "#C9B6FF",
  },
  card: {
    marginHorizontal: 0,
    marginBottom: 14,
    backgroundColor: t.colors.cardBackground,
    borderRadius: 0,
    overflow: "hidden",
  },
  authorRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  avatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    marginRight: 12,
    backgroundColor: t.colors.avatarPlaceholder,
  },
  authorName: {
    flex: 1,
    color: t.colors.textPrimary,
    fontSize: 18,
    fontFamily: t.fontFamily.base,
    fontWeight: "700",
  },
  cover: {
    width: "100%",
    aspectRatio: 1,
    backgroundColor: t.colors.coverPlaceholder,
  },
  coverWrap: {
    position: "relative",
  },
  paidDimmer: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: t.colors.paidDimmer,
  },
  paidOverlay: {
    position: "absolute",
    left: 0,
    right: 0,
    top: "25%",
    marginHorizontal: 18,
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 14,
    alignItems: "center",
  },
  paidIconBadge: {
    width: 56,
    height: 56,
    borderRadius: 14,
    backgroundColor: t.colors.paidAccent,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
  },
  paidTitle: {
    color: t.colors.textOnDark,
    textAlign: "center",
    fontSize: 15,
    lineHeight: 22,
    fontFamily: t.fontFamily.base,
    fontWeight: "700",
    marginBottom: 10,
  },
  paidButton: {
    height: 44,
    borderRadius: 14,
    width: "80%",
    backgroundColor: t.colors.paidAccent,
    alignItems: "center",
    justifyContent: "center",
  },
  paidButtonText: {
    color: t.colors.textOnAccent,
    fontSize: 16,
    lineHeight: 20,
    fontFamily: t.fontFamily.base,
    fontWeight: "700",
  },
  paidTextSkeletonWrap: {
    gap: 10,
    paddingBottom: 12,
  },
  paidTextSkeletonLineLg: {
    height: 26,
    width: "72%",
    borderRadius: 22,
    backgroundColor: t.colors.skeleton,
  },
  paidTextSkeletonLineMd: {
    height: 40,
    width: "46%",
    borderRadius: 22,
    backgroundColor: t.colors.skeleton,
  },
  contentBlock: {
    paddingHorizontal: 16,
    paddingTop: 10,
  },
  title: {
    color: t.colors.textPrimary,
    fontSize: 18,
    fontFamily: t.fontFamily.base,
    fontWeight: "700",
    lineHeight: 26,
  },
  excerpt: {
    paddingTop: 10,
    color: t.colors.textBody,
    fontSize: 15,
    fontFamily: t.fontFamily.base,
    lineHeight: 20,
  },
  excerptWrap: {
    position: "relative",
  },
  excerptCollapsed: {
    paddingRight: 50,
  },
  showMorePress: {
    position: "absolute",
    right: 0,
    bottom: 0,
    backgroundColor: t.colors.cardBackground,
    paddingLeft: 6,
  },
  showMoreText: {
    color: t.colors.showMore,
    fontFamily: t.fontFamily.base,
    fontWeight: "500",
    fontSize: 15,
    lineHeight: 20,
  },
  actionsRow: {
    flexDirection: "row",
    gap: 12,
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 18,
  },
  likePill: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 21,
    paddingHorizontal: 10,
    height: 36,
    backgroundColor: t.colors.pillNeutralBg,
  },
  likeIcon: {
    color: t.colors.textMuted,
    fontSize: 22,
    lineHeight: 22,
    marginRight: 7,
  },
  likePillText: {
    color: t.colors.textMuted,
    fontSize: 16,
    fontFamily: t.fontFamily.base,
    fontWeight: "700",
  },
  commentPill: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 21,
    paddingHorizontal: 10,
    height: 36,
    backgroundColor: t.colors.pillNeutralBg,
  },
  commentPillText: {
    color: t.colors.textMuted,
    fontSize: 16,
    fontFamily: t.fontFamily.base,
    fontWeight: "700",
    marginLeft: 8,
  },
  footerLoader: {
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  footerSpacer: {
    height: 8,
  },
  skeletonBone: {
    backgroundColor: t.colors.skeleton,
  },
  skeletonAvatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    marginRight: 12,
  },
  skeletonAuthorName: {
    height: 24,
    width: 120,
    borderRadius: 12,
  },
  skeletonCover: {
    width: "100%",
    aspectRatio: 1,
  },
  skeletonTitle: {
    height: 26,
    width: "40%",
    borderRadius: 11,
    marginBottom: 10,
  },
  skeletonText: {
    height: 20,
    width: "94%",
    borderRadius: 8,
  },
  skeletonPill: {
    width: 64,
    height: 36,
    borderRadius: 24,
  },
  skeletonFooter: {
    width: 120,
    height: 22,
    borderRadius: 11,
  },
  errorText: {
    color: t.colors.error,
    textAlign: "center",
    marginBottom: 12,
  },
  errorCard: {
    marginTop: 16,
    backgroundColor: t.colors.cardBackground,
    borderRadius: 18,
    padding: 16,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 10,
      },
      android: {
        elevation: 4,
      },
      default: {},
    }),
  },
  errorAuthorRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  errorAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
    backgroundColor: t.colors.avatarPlaceholder,
  },
  errorAuthorName: {
    flex: 1,
    color: t.colors.textPrimary,
    fontSize: 15,
    lineHeight: 20,
    fontFamily: t.fontFamily.base,
    fontWeight: "700",
  },
  errorBody: {
    alignItems: "center",
    alignSelf: "stretch",
    width: "100%",
  },
  errorIllustration: {
    marginTop: 28,
    marginBottom: 28,
  },
  errorTitle: {
    color: t.colors.textPrimary,
    fontFamily: t.fontFamily.base,
    fontWeight: "700",
    fontSize: 18,
    lineHeight: 26,
    textAlign: "center",
    marginBottom: 18,
    paddingHorizontal: 4,
  },
  errorRetryButton: {
    height: 50,
    borderRadius: 12,
    width: "100%",
    backgroundColor: t.colors.errorRetryBg,
    alignItems: "center",
    justifyContent: "center",
  },
  errorRetryLabel: {
    color: t.colors.textOnAccent,
    fontFamily: t.fontFamily.base,
    fontWeight: "700",
    fontSize: 16,
  },
  retryButton: {
    backgroundColor: t.colors.retryBg,
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  retryText: {
    color: t.colors.retryText,
    fontFamily: t.fontFamily.base,
    fontWeight: "600",
  },
});
