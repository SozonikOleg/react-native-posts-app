import React from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import type {
  ScrollNewsComment,
} from '../../../../features/scroll-news/model/types';
import { scrollNewsTokens as t } from '@/components/theme/scrollNewsTokens';

const styles = StyleSheet.create({
  commentRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
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
    maxWidth: '72%',
  },
  commentAuthor: {
    color: '#111827',
    fontFamily: t.fontFamily.base,
    fontWeight: '700',
    fontSize: 16,
    lineHeight: 22,
  },
  commentText: {
    color: '#1F2937',
    fontFamily: t.fontFamily.base,
    fontSize: 15,
    lineHeight: 21,
    flexShrink: 1,
  },
  commentLikeWrap: {
    width: 44,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginTop: 8,
  },
  commentLikeIcon: {
    fontSize: 20,
    color: '#667085',
    lineHeight: 20,
  },
  commentLikeIconActive: {
    color: '#F72585',
  },
  commentLikeCount: {
    marginLeft: 4,
    marginBottom: 4,
    color: '#4B5563',
    fontFamily: t.fontFamily.base,
    fontWeight: '700',
    fontSize: 13,
  },
});

export function FeedCommentRow(props: {
  comment: ScrollNewsComment;
  liked: boolean;
  likesCount: number;
  onToggleLike: () => void;
}) {
  const { comment, liked, likesCount, onToggleLike } = props;
  return (
    <View style={styles.commentRow} key={comment.id}>
      <Image
        source={{ uri: comment.author.avatarUrl }}
        style={styles.commentAvatar}
      />
      <View style={styles.commentBodyWrap}>
        <Text style={styles.commentAuthor} numberOfLines={1}>
          {comment.author.displayName}
        </Text>
        <Text style={styles.commentText}>{comment.text}</Text>
      </View>
      <Pressable style={styles.commentLikeWrap} onPress={onToggleLike} hitSlop={8}>
        <Text
          style={[
            styles.commentLikeIcon,
            liked && styles.commentLikeIconActive,
          ]}
        >
          {liked ? '♥' : '♡'}
        </Text>
        <Text style={styles.commentLikeCount}>{likesCount}</Text>
      </Pressable>
    </View>
  );
}

