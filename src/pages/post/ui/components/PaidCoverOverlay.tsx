import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { scrollNewsTokens as t } from '@/shared/theme/scrollNewsTokens';

const styles = StyleSheet.create({
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
});

export function PaidCoverOverlay() {
  return (
    <>
      <View style={styles.paidDimmer} />
      <View style={styles.paidOverlay}>
        <View style={styles.paidIconBadge}>
          <Text style={{ color: '#fff', fontSize: 22, fontWeight: '800' }}>
            ⊖
          </Text>
        </View>
        <Text style={styles.paidTitle}>
          Контент скрыт пользователем.{'\n'}Доступ откроется после доната.
        </Text>
        <Pressable style={styles.paidButton} onPress={() => {}}>
          <Text style={styles.paidButtonText}>Отправить донат</Text>
        </Pressable>
      </View>
    </>
  );
}

