import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { scrollNewsTokens as t } from '@/shared/theme/scrollNewsTokens';

const styles = StyleSheet.create({
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
});

export function CommentsHeaderRow(props: {
  title: string;
  sortLabel: string;
  onToggleSort: () => void;
}) {
  const { title, sortLabel, onToggleSort } = props;
  return (
    <View style={styles.commentsHeader}>
      <Text style={styles.commentsTitle}>{title}</Text>
      <Pressable onPress={onToggleSort} hitSlop={8}>
        <Text style={styles.commentsSort}>{sortLabel}</Text>
      </Pressable>
    </View>
  );
}

