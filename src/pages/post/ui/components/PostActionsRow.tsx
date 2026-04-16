import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated from 'react-native-reanimated';
import { IconChatBubbleOutline } from '@/shared/ui/icons';
import { scrollNewsTokens as t } from '@/shared/theme/scrollNewsTokens';

const styles = StyleSheet.create({
  actionsRow: {
    flexDirection: 'row',
    gap: 12,
    backgroundColor: t.colors.cardBackground,
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 10,
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
    color: t.colors.textMuted,
    fontSize: 22,
    lineHeight: 22,
    marginRight: 7,
  },
  likeIconActive: {
    color: '#F72585',
  },
  likePillText: {
    color: t.colors.textMuted,
    fontSize: 16,
    fontFamily: t.fontFamily.base,
    fontWeight: '700',
  },
  likePillTextActive: {
    color: '#F72585',
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
});

export function PostActionsRow(props: {
  liked: boolean;
  likesCountLabel: string;
  commentsCountLabel: string;
  onLikePress: () => void;
  likePulseStyle: object;
}) {
  const {
    liked,
    likesCountLabel,
    commentsCountLabel,
    onLikePress,
    likePulseStyle,
  } = props;

  return (
    <View style={styles.actionsRow}>
      <Pressable onPress={onLikePress} hitSlop={8}>
        <Animated.View style={[styles.likePill, likePulseStyle]}>
          <Text style={[styles.likeIcon, liked && styles.likeIconActive]}>
            {liked ? '♥' : '♡'}
          </Text>
          <Text
            style={[styles.likePillText, liked && styles.likePillTextActive]}
          >
            {likesCountLabel}
          </Text>
        </Animated.View>
      </Pressable>
      <View style={styles.commentPill}>
        <IconChatBubbleOutline size={19} color={t.colors.commentIcon} />
        <Text style={styles.commentPillText}>{commentsCountLabel}</Text>
      </View>
    </View>
  );
}

