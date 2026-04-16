import React from "react";
import {
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { scrollNewsTokens as t } from "@/components/theme/scrollNewsTokens";

const styles = StyleSheet.create({
  commentInputDock: {
    backgroundColor: "#FFFFFF",
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    paddingBottom: 5,
  },
  commentInputBar: {
    paddingTop: 5,
    paddingHorizontal: 12,
    paddingBottom: Platform.OS === "ios" ? 16 : 12,
    backgroundColor: "#FFFFFF",
    flexDirection: "row",
    alignItems: "center",
  },
  commentInput: {
    flex: 1,
    height: 40,
    borderRadius: 20,

    backgroundColor: "#FFFFFF",
    paddingHorizontal: 18,
    color: "#111827",
    fontFamily: t.fontFamily.base,
    fontSize: 15,
  },
  commentSendButton: {
    width: 46,
    height: 46,
    borderRadius: 23,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 6,
  },
  commentSendIcon: {
    fontSize: 32,
    lineHeight: 32,
  },
  commentSendIconActive: {
    color: "#6115CD",
  },
  commentSendIconDisabled: {
    color: "#C9B6FF",
  },
});

export function CommentInputDock(props: {
  value: string;
  onChangeText: (text: string) => void;
  onSend: () => void;
  disabled: boolean;
}) {
  const { value, onChangeText, onSend, disabled } = props;
  return (
    <View style={styles.commentInputDock}>
      <View style={styles.commentInputBar}>
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder="Ваш комментарий"
          placeholderTextColor="#9CA3AF"
          style={styles.commentInput}
          maxLength={500}
        />
        <Pressable
          style={styles.commentSendButton}
          onPress={onSend}
          disabled={disabled}
        >
          <Text
            style={[
              styles.commentSendIcon,
              disabled
                ? styles.commentSendIconDisabled
                : styles.commentSendIconActive,
            ]}
          >
            ➤
          </Text>
        </Pressable>
      </View>
    </View>
  );
}
