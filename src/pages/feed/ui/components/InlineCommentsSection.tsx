import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { scrollNewsTokens as t } from '@/shared/theme/scrollNewsTokens';
import { SCROLL_NEWS_TEXT } from '../constants/texts';

const styles = StyleSheet.create({
  inlineCommentsWrap: {
    marginTop: 12,
    backgroundColor: '#FFFFFF',
    paddingTop: 8,
    alignSelf: 'stretch',
  },
  commentsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  commentsTitle: {
    color: '#667085',
    fontFamily: t.fontFamily.base,
    fontWeight: '700',
    fontSize: 15,
    lineHeight: 20,
  },
  commentsSort: {
    color: t.colors.paidAccent,
    fontFamily: t.fontFamily.base,
    fontWeight: '600',
    fontSize: 15,
    lineHeight: 20,
  },
  commentsErrorText: {
    color: '#DC2626',
    paddingHorizontal: 16,
    paddingBottom: 8,
    fontFamily: t.fontFamily.base,
    fontSize: 14,
  },
  commentsScrollableArea: {
    height: 245,
    backgroundColor: '#FFFFFF',
    overflow: 'hidden',
  },
  commentsLoadingWrap: {
    paddingVertical: 26,
    alignItems: 'center',
  },
  commentsLoadingText: {
    color: '#6B7280',
    fontFamily: t.fontFamily.base,
    fontSize: 15,
  },
  commentsEmptyText: {
    textAlign: 'center',
    color: '#6B7280',
    fontFamily: t.fontFamily.base,
    fontSize: 15,
    paddingVertical: 20,
  },
});

export function InlineCommentsSection(props: {
  title: string;
  sortLabel: string;
  onToggleSort: () => void;
  error: string | null;
  loading: boolean;
  commentsEmpty: boolean;
  list: React.ReactNode;
  input: React.ReactNode;
}) {
  const {
    title,
    sortLabel,
    onToggleSort,
    error,
    loading,
    commentsEmpty,
    list,
    input,
  } = props;

  return (
    <View style={styles.inlineCommentsWrap}>
      <View style={styles.commentsHeader}>
        <Text style={styles.commentsTitle}>{title}</Text>
        <Pressable onPress={onToggleSort} hitSlop={8}>
          <Text style={styles.commentsSort}>{sortLabel}</Text>
        </Pressable>
      </View>

      {error ? <Text style={styles.commentsErrorText}>{error}</Text> : null}

      <View style={styles.commentsScrollableArea}>
        {loading ? (
          <View style={styles.commentsLoadingWrap}>
            <Text style={styles.commentsLoadingText}>{SCROLL_NEWS_TEXT.loading}</Text>
          </View>
        ) : commentsEmpty ? (
          <Text style={styles.commentsEmptyText}>{SCROLL_NEWS_TEXT.emptyComments}</Text>
        ) : (
          list
        )}
      </View>
      {input}
    </View>
  );
}

