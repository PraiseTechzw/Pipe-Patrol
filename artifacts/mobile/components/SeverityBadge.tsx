import { Feather } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

import { SEVERITY_LABEL } from "@/lib/format";
import type { Severity } from "@/types";

type Props = {
  severity: Severity;
  size?: "sm" | "md";
};

const palette: Record<
  Severity,
  { bg: string; fg: string; icon: keyof typeof Feather.glyphMap }
> = {
  low: { bg: "#e0f7fa", fg: "#0e6d7c", icon: "droplet" },
  medium: { bg: "#fef3c7", fg: "#78350f", icon: "alert-circle" },
  high: { bg: "#fee2e2", fg: "#7f1d1d", icon: "alert-triangle" },
};

export function SeverityBadge({ severity, size = "md" }: Props) {
  const c = palette[severity];
  const isSm = size === "sm";
  return (
    <View
      style={[
        styles.badge,
        {
          backgroundColor: c.bg,
          paddingVertical: isSm ? 4 : 5,
          paddingHorizontal: isSm ? 8 : 10,
          gap: isSm ? 4 : 5,
        },
      ]}
    >
      <Feather name={c.icon} size={isSm ? 10 : 12} color={c.fg} />
      <Text
        style={{
          color: c.fg,
          fontSize: isSm ? 10.5 : 11.5,
          fontFamily: "Inter_700Bold",
          letterSpacing: 0.6,
          textTransform: "uppercase",
        }}
      >
        {SEVERITY_LABEL[severity]}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 999,
  },
});
