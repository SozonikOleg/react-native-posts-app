import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { scrollNewsTokens as t } from '@/components/theme/scrollNewsTokens';

const styles = StyleSheet.create({
  contentBlock: {
    backgroundColor: '#FFFFFF',
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
    paddingBottom: 10,
  },
  excerpt: {
    color: t.colors.textBody,
    fontSize: 15,
    fontFamily: t.fontFamily.base,
    lineHeight: 20,
  },
});

export function PostTextBlock(props: {
  isPaid: boolean;
  title: string;
  text: string;
}) {
  const { isPaid, title, text } = props;
  return (
    <View style={styles.contentBlock}>
      {isPaid ? (
        <View style={styles.paidTextSkeletonWrap}>
          <View style={styles.paidTextSkeletonLineLg} />
          <View style={styles.paidTextSkeletonLineMd} />
        </View>
      ) : (
        <>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.excerpt}>{text}</Text>
        </>
      )}
    </View>
  );
}

