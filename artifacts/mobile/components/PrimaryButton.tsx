import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import React from "react";
import {
  ActivityIndicator,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { useColors } from "@/hooks/useColors";

type Variant = "primary" | "secondary" | "ghost" | "destructive";

type Props = {
  label: string;
  onPress: () => void;
  variant?: Variant;
  icon?: keyof typeof Feather.glyphMap;
  loading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  size?: "md" | "sm";
};

export function PrimaryButton({
  label,
  onPress,
  variant = "primary",
  icon,
  loading,
  disabled,
  fullWidth,
  size = "md",
}: Props) {
  const colors = useColors();

  const styleByVariant = {
    primary: { bg: colors.primary, fg: colors.primaryForeground, border: "transparent" as const },
    secondary: {
      bg: colors.secondary,
      fg: colors.secondaryForeground,
      border: colors.border,
    },
    ghost: { bg: "transparent", fg: colors.foreground, border: colors.border },
    destructive: {
      bg: colors.destructive,
      fg: colors.destructiveForeground,
      border: "transparent" as const,
    },
  }[variant];

  const isDisabled = disabled || loading;

  const handlePress = () => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    }
    onPress();
  };

  const padV = size === "sm" ? 9 : 13;
  const padH = size === "sm" ? 14 : 18;
  const fontSize = size === "sm" ? 14 : 15;

  return (
    <Pressable
      onPress={handlePress}
      disabled={isDisabled}
      style={({ pressed }) => [
        styles.button,
        {
          backgroundColor: styleByVariant.bg,
          borderColor: styleByVariant.border,
          borderRadius: 12,
          paddingVertical: padV,
          paddingHorizontal: padH,
          opacity: isDisabled ? 0.55 : pressed ? 0.88 : 1,
          alignSelf: fullWidth ? "stretch" : "flex-start",
        },
      ]}
    >
      <View style={styles.content}>
        {loading ? (
          <ActivityIndicator size="small" color={styleByVariant.fg} />
        ) : icon ? (
          <Feather name={icon} size={size === "sm" ? 15 : 17} color={styleByVariant.fg} />
        ) : null}
        <Text
          style={[
            styles.label,
            { color: styleByVariant.fg, fontSize, fontFamily: "Inter_600SemiBold" },
          ]}
          numberOfLines={1}
        >
          {label}
        </Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  content: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  label: {
    letterSpacing: 0.1,
  },
});
