import React from "react";
import { StyleSheet, Text, View } from "react-native";

import { useColors } from "@/hooks/useColors";
import { STATUS_LABEL } from "@/lib/format";
import type { ReportStatus } from "@/types";

type Props = {
  status: ReportStatus;
  size?: "sm" | "md";
};

export function StatusBadge({ status, size = "md" }: Props) {
  const colors = useColors();

  const palette: Record<
    ReportStatus,
    { bg: string; fg: string; dot: string }
  > = {
    submitted: {
      bg: "#e6eef2",
      fg: "#0b3a4a",
      dot: colors.info,
    },
    acknowledged: {
      bg: "#fef3c7",
      fg: "#7c4a03",
      dot: colors.warning,
    },
    in_progress: {
      bg: "#dbeafe",
      fg: "#0c2f6b",
      dot: colors.info,
    },
    resolved: {
      bg: "#dcfce7",
      fg: "#0f4322",
      dot: colors.success,
    },
  };

  const c = palette[status];
  const isSm = size === "sm";

  return (
    <View
      style={[
        styles.badge,
        {
          backgroundColor: c.bg,
          paddingVertical: isSm ? 3 : 5,
          paddingHorizontal: isSm ? 8 : 10,
          borderRadius: 999,
        },
      ]}
    >
      <View style={[styles.dot, { backgroundColor: c.dot }]} />
      <Text
        style={[
          styles.label,
          {
            color: c.fg,
            fontSize: isSm ? 11 : 12,
            fontFamily: "Inter_600SemiBold",
          },
        ]}
      >
        {STATUS_LABEL[status]}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    gap: 6,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  label: {
    letterSpacing: 0.1,
  },
});
