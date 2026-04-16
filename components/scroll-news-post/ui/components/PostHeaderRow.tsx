import React from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { IconChevronBack } from '@/components/ui/icons';
import { scrollNewsTokens as t } from '@/components/theme/scrollNewsTokens';

const styles = StyleSheet.create({
  authorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 14,
    backgroundColor: t.colors.cardBackground,
  },
  backButton: {
    width: 40,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 4,
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
});

export function PostHeaderRow(props: {
  authorAvatarUrl: string;
  authorDisplayName: string;
  onBackPress: () => void;
}) {
  const { authorAvatarUrl, authorDisplayName, onBackPress } = props;
  return (
    <View style={styles.authorRow}>
      <Pressable style={styles.backButton} onPress={onBackPress} hitSlop={12}>
        <IconChevronBack size={26} color={t.colors.textPrimary} />
      </Pressable>
      <Image source={{ uri: authorAvatarUrl }} style={styles.avatar} />
      <Text style={styles.authorName}>{authorDisplayName}</Text>
    </View>
  );
}

