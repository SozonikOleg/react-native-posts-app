import React from 'react';
import {
  Animated,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import Reanimated from 'react-native-reanimated';
import { IconChatBubbleOutline } from '@/components/ui/icons';
import { scrollNewsTokens as t } from '@/components/theme/scrollNewsTokens';
import { SCROLL_NEWS_TEXT } from '../constants/texts';

const styles = StyleSheet.create({
  authorRow: {
    flexDirection: 'row',
    alignItems: 'center',
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
    fontWeight: '700',
  },
  coverWrap: {
    position: 'relative',
  },
  cover: {
    width: '100%',
    aspectRatio: 1,
    backgroundColor: t.colors.coverPlaceholder,
  },
  paidDimmer: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: t.colors.paidDimmer,
  },
  paidOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: '25%',
    marginHorizontal: 18,
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 14,
    alignItems: 'center',
  },
  paidIconBadge: {
    width: 56,
    height: 56,
    borderRadius: 14,
    backgroundColor: t.colors.paidAccent,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  paidTitle: {
    color: t.colors.textOnDark,
    textAlign: 'center',
    fontSize: 15,
    lineHeight: 22,
    fontFamily: t.fontFamily.base,
    fontWeight: '700',
    marginBottom: 10,
  },
  paidButton: {
    height: 44,
    borderRadius: 14,
    width: '80%',
    backgroundColor: t.colors.paidAccent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  paidButtonText: {
    color: t.colors.textOnAccent,
    fontSize: 16,
    lineHeight: 20,
    fontFamily: t.fontFamily.base,
    fontWeight: '700',
  },
  contentBlock: {
    paddingHorizontal: 16,
    paddingTop: 10,
  },
  paidTextSkeletonWrap: {
    gap: 10,
    paddingBottom: 12,
  },
  paidTextSkeletonLineLg: {
    height: 26,
    width: '72%',
    borderRadius: 22,
    backgroundColor: t.colors.skeleton,
  },
  paidTextSkeletonLineMd: {
    height: 40,
    width: '46%',
    borderRadius: 22,
    backgroundColor: t.colors.skeleton,
  },
  title: {
    color: t.colors.textPrimary,
    fontSize: 18,
    fontFamily: t.fontFamily.base,
    fontWeight: '700',
    lineHeight: 26,
  },
  excerptWrap: {
    position: 'relative',
  },
  excerpt: {
    paddingTop: 10,
    color: t.colors.textBody,
    fontSize: 15,
    fontFamily: t.fontFamily.base,
    lineHeight: 20,
  },
  excerptCollapsed: {
    paddingRight: 50,
  },
  showMorePress: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    backgroundColor: t.colors.cardBackground,
    paddingLeft: 6,
  },
  showMoreText: {
    color: t.colors.showMore,
    fontFamily: t.fontFamily.base,
    fontWeight: '500',
    fontSize: 15,
    lineHeight: 20,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 18,
  },
  likePill: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 21,
    paddingHorizontal: 10,
    height: 36,
    backgroundColor: t.colors.pillNeutralBg,
  },
  likeIcon: {
    fontSize: 22,
    lineHeight: 22,
    marginRight: 7,
  },
  likePillText: {
    fontSize: 16,
    fontFamily: t.fontFamily.base,
    fontWeight: '700',
  },
  commentPill: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 21,
    paddingHorizontal: 10,
    height: 36,
    backgroundColor: t.colors.pillNeutralBg,
  },
  commentPillText: {
    color: t.colors.textMuted,
    fontSize: 16,
    fontFamily: t.fontFamily.base,
    fontWeight: '700',
    marginLeft: 8,
  },
  commentsScrollView: {
    flex: 1,
  },
  commentsListContent: {
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
});

export function FeedCardHeader(props: { avatarUrl: string; displayName: string }) {
  const { avatarUrl, displayName } = props;
  return (
    <View style={styles.authorRow}>
      <Image source={{ uri: avatarUrl }} style={styles.avatar} />
      <Text style={styles.authorName} numberOfLines={1}>
        {displayName}
      </Text>
    </View>
  );
}

export function PaidOverlay() {
  return (
    <>
      <View style={styles.paidDimmer} />
      <View style={styles.paidOverlay}>
        <View style={styles.paidIconBadge}>
          <Text style={{ color: '#fff', fontSize: 22, fontWeight: '800' }}>
            ⊖
          </Text>
        </View>
        <Text style={styles.paidTitle}>{SCROLL_NEWS_TEXT.paidTitle}</Text>
        <Pressable style={styles.paidButton} onPress={() => {}}>
          <Text style={styles.paidButtonText}>{SCROLL_NEWS_TEXT.sendDonate}</Text>
        </Pressable>
      </View>
    </>
  );
}

export function FeedCardCover(props: {
  coverUri: string;
  blur: number;
  onError: () => void;
  paid: boolean;
}) {
  const { coverUri, blur, onError, paid } = props;
  return (
    <View style={styles.coverWrap}>
      <Image
        source={{ uri: coverUri }}
        style={styles.cover}
        blurRadius={blur}
        onError={onError}
      />
      {paid ? <PaidOverlay /> : null}
    </View>
  );
}

export function FeedCardBody(props: {
  title: string;
  collapsedText: string;
  expandedText: string;
  expanded: boolean;
  canExpand: boolean;
  onShowMore: () => void;
  isPaid: boolean;
}) {
  const {
    title,
    collapsedText,
    expandedText,
    expanded,
    canExpand,
    onShowMore,
    isPaid,
  } = props;

  return (
    <View style={styles.contentBlock}>
      {isPaid ? (
        <View style={styles.paidTextSkeletonWrap}>
          <View style={styles.paidTextSkeletonLineLg} />
          <View style={styles.paidTextSkeletonLineMd} />
        </View>
      ) : (
        <>
          <Text style={styles.title} numberOfLines={2}>
            {title}
          </Text>
          {collapsedText ? (
            <View style={styles.excerptWrap}>
              <Text
                style={[
                  styles.excerpt,
                  !expanded && canExpand && styles.excerptCollapsed,
                ]}
                numberOfLines={expanded ? undefined : 2}
              >
                {expanded ? expandedText : collapsedText}
              </Text>
              {!expanded && canExpand ? (
                <Pressable
                  style={styles.showMorePress}
                  onPress={onShowMore}
                  hitSlop={8}
                >
                  <Text style={styles.showMoreText}>
                    {SCROLL_NEWS_TEXT.showMore}
                  </Text>
                </Pressable>
              ) : null}
            </View>
          ) : null}
        </>
      )}
    </View>
  );
}

export function FeedCardActions(props: {
  likeBg: any;
  likeFg: any;
  likePulseStyle: object;
  likesCountLabel: string;
  commentsCountLabel: string;
  onLikePress: () => void;
  onCommentsPress: () => void;
}) {
  const {
    likeBg,
    likeFg,
    likePulseStyle,
    likesCountLabel,
    commentsCountLabel,
    onLikePress,
    onCommentsPress,
  } = props;

  return (
    <View style={styles.actionsRow}>
      <Pressable onPress={onLikePress} hitSlop={8}>
        <Reanimated.View style={likePulseStyle}>
          <Animated.View
            style={[
              styles.likePill,
              {
                backgroundColor: likeBg,
              },
            ]}
          >
            <Animated.Text style={[styles.likeIcon, { color: likeFg }]}>
              ♥
            </Animated.Text>
            <Animated.Text style={[styles.likePillText, { color: likeFg }]}>
              {likesCountLabel}
            </Animated.Text>
          </Animated.View>
        </Reanimated.View>
      </Pressable>
      <Pressable style={styles.commentPill} onPress={onCommentsPress}>
        <IconChatBubbleOutline size={19} color={t.colors.commentIcon} />
        <Text style={styles.commentPillText}>{commentsCountLabel}</Text>
      </Pressable>
    </View>
  );
}

export function FeedInlineCommentsList(props: { children: React.ReactNode }) {
  const { children } = props;
  return (
    <ScrollView
      style={styles.commentsScrollView}
      contentContainerStyle={styles.commentsListContent}
      nestedScrollEnabled
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
      {children}
    </ScrollView>
  );
}

