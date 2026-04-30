import { Feather } from "@expo/vector-icons";
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { useColors } from "@/hooks/useColors";

type Props = {
  title: string;
  subtitle?: string;
  actionLabel?: string;
  onActionPress?: () => void;
  actionIcon?: keyof typeof Feather.glyphMap;
};

export function SectionHeader({
  title,
  subtitle,
  actionLabel,
  onActionPress,
  actionIcon,
}: Props) {
  const colors = useColors();
  return (
    <View style={styles.container}>
      <View style={{ flex: 1 }}>
        <Text style={[styles.title, { color: colors.foreground }]}>
          {title}
        </Text>
        {subtitle ? (
          <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>
            {subtitle}
          </Text>
        ) : null}
      </View>
      {actionLabel && onActionPress ? (
        <Pressable
          onPress={onActionPress}
          style={({ pressed }) => [styles.action, { opacity: pressed ? 0.6 : 1 }]}
          hitSlop={8}
        >
          <Text style={[styles.actionLabel, { color: colors.primary }]}>
            {actionLabel}
          </Text>
          {actionIcon ? (
            <Feather name={actionIcon} size={14} color={colors.primary} />
          ) : null}
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  title: {
    fontFamily: "Inter_700Bold",
    fontSize: 18,
  },
  subtitle: {
    fontFamily: "Inter_400Regular",
    fontSize: 13,
    marginTop: 2,
  },
  action: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  actionLabel: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 14,
  },
});
