import { tokens } from './tokens';

export const scrollNewsTokens = {
  colors: {
    pageBackground: tokens.color.bgCanvas,
    /** Фон экрана ошибки ленты (как в макете). */
    errorScreenBackground: tokens.color.bgSurfaceMuted,
    cardBackground: tokens.color.bgSurface,
    textPrimary: tokens.color.textPrimary,
    textBody: tokens.color.textBody,
    textMuted: tokens.color.textMuted,
    commentIcon: tokens.color.iconMuted,
    textOnDark: tokens.color.textOnDark,
    textOnAccent: tokens.color.textOnAccent,
    showMore: '#5B21B6',
    coverPlaceholder: tokens.color.placeholderCover,
    avatarPlaceholder: tokens.color.placeholderAvatar,
    skeleton: tokens.color.skeleton,
    pillNeutralBg: tokens.color.pillNeutral,
    likeActiveBg: tokens.color.like,
    paidAccent: tokens.color.accent,
    /** Кнопка «Повторить» на экране ошибки. */
    errorRetryBg: tokens.color.accent2,
    paidDimmer: tokens.color.dimmer,
    error: tokens.color.danger,
    retryText: '#111827',
    retryBg: '#E5E7EB',
  },
  fontFamily: {
    base: tokens.font.family.base,
  },
} as const;
