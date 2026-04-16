import React from 'react';
import { Image, StyleSheet, View } from 'react-native';
import { scrollNewsTokens as t } from '@/components/theme/scrollNewsTokens';

const styles = StyleSheet.create({
  coverWrap: {
    position: 'relative',
  },
  cover: {
    width: '100%',
    aspectRatio: 1,
    backgroundColor: t.colors.coverPlaceholder,
  },
});

export function PostCover(props: {
  coverUri: string;
  blur: number;
  onCoverError: () => void;
  paidOverlay: React.ReactNode;
}) {
  const { coverUri, blur, onCoverError, paidOverlay } = props;
  return (
    <View style={styles.coverWrap}>
      <Image
        source={{ uri: coverUri }}
        style={styles.cover}
        blurRadius={blur}
        onError={onCoverError}
      />
      {paidOverlay}
    </View>
  );
}

