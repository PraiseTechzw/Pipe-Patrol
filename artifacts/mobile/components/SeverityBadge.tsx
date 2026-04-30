import React from "react";
import { StyleSheet, Text, View } from "react-native";

import { SEVERITY_LABEL } from "@/lib/format";
import type { Severity } from "@/types";

type Props = {
  severity: Severity;
  size?: "sm" | "md";
};

const palette: Record<Severity, { bg: string; fg: string }> = {
  low: { bg: "#e0f2fe", fg: "#0c4a6e" },
  medium: { bg: "#fef3c7", fg: "#78350f" },
  high: { bg: "#fee2e2", fg: "#7f1d1d" },
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
          paddingVertical: isSm ? 3 : 5,
          paddingHorizontal: isSm ? 8 : 10,
        },
      ]}
    >
      <Text
        style={{
          color: c.fg,
          fontSize: isSm ? 11 : 12,
          fontFamily: "Inter_600SemiBold",
          letterSpacing: 0.4,
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
    borderRadius: 999,
  },
});
