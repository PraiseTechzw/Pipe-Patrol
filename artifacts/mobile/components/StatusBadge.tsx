import { Feather } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

import { useColors } from "@/hooks/useColors";
import { STATUS_LABEL } from "@/lib/format";
import type { ReportStatus } from "@/types";

type Props = {
  status: ReportStatus;
  size?: "sm" | "md";
};

const ICON_BY_STATUS: Record<ReportStatus, keyof typeof Feather.glyphMap> = {
  submitted: "send",
  acknowledged: "eye",
  in_progress: "tool",
  resolved: "check",
};

export function StatusBadge({ status, size = "md" }: Props) {
  const colors = useColors();

  const palette: Record<ReportStatus, { bg: string; fg: string; ring: string }> = {
    submitted: {
      bg: colors.infoSoft,
      fg: "#0c3a6e",
      ring: colors.info,
    },
    acknowledged: {
      bg: colors.warningSoft,
      fg: "#7c4a03",
      ring: colors.warning,
    },
    in_progress: {
      bg: colors.accentSoft,
      fg: colors.accentForeground,
      ring: colors.accent,
    },
    resolved: {
      bg: colors.successSoft,
      fg: "#0f4322",
      ring: colors.success,
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
          paddingVertical: isSm ? 4 : 6,
          paddingHorizontal: isSm ? 9 : 11,
          borderRadius: 999,
          gap: isSm ? 5 : 6,
        },
      ]}
    >
      <View
        style={[
          styles.iconDot,
          {
            backgroundColor: c.ring,
            width: isSm ? 14 : 16,
            height: isSm ? 14 : 16,
            borderRadius: isSm ? 7 : 8,
          },
        ]}
      >
        <Feather
          name={ICON_BY_STATUS[status]}
          size={isSm ? 8 : 9}
          color="#ffffff"
        />
      </View>
      <Text
        style={[
          styles.label,
          {
            color: c.fg,
            fontSize: isSm ? 11 : 12.5,
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
  },
  iconDot: {
    alignItems: "center",
    justifyContent: "center",
  },
  label: {
    letterSpacing: 0.1,
  },
});
