import React from 'react';
import { Ionicons } from '@expo/vector-icons';

type IconProps = {
  size?: number;
  color?: string;
};

export function IconChevronBack({ size = 24, color = '#11181C' }: IconProps) {
  return <Ionicons name="chevron-back" size={size} color={color} />;
}

export function IconChatBubbleOutline({
  size = 20,
  color = '#11181C',
}: IconProps) {
  return <Ionicons name="chatbubble-outline" size={size} color={color} />;
}

