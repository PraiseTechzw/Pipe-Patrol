import { Feather } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

import { useColors } from "@/hooks/useColors";
import { NOTICE_TYPE_LABEL, formatRelative } from "@/lib/format";
import type { Notice } from "@/types";

type Props = {
  notice: Notice;
};

const ICONS: Record<Notice["type"], keyof typeof Feather.glyphMap> = {
  disruption: "alert-triangle",
  maintenance: "tool",
  restoration: "check-circle",
};

const ACCENTS: Record<Notice["type"], { bg: string; fg: string }> = {
  disruption: { bg: "#fee2e2", fg: "#7f1d1d" },
  maintenance: { bg: "#fef3c7", fg: "#78350f" },
  restoration: { bg: "#dcfce7", fg: "#0f4322" },
};

export function NoticeCard({ notice }: Props) {
  const colors = useColors();
  const accent = ACCENTS[notice.type];

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: colors.card,
          borderColor: colors.border,
          borderRadius: colors.radius,
        },
      ]}
    >
      <View style={styles.headerRow}>
        <View style={[styles.iconWrap, { backgroundColor: accent.bg }]}>
          <Feather name={ICONS[notice.type]} size={16} color={accent.fg} />
        </View>
        <View style={styles.headerText}>
          <Text style={[styles.type, { color: accent.fg }]}>
            {NOTICE_TYPE_LABEL[notice.type]}
          </Text>
          <Text style={[styles.area, { color: colors.mutedForeground }]}>
            {notice.area} · {formatRelative(notice.createdAt)}
          </Text>
        </View>
      </View>

      <Text style={[styles.title, { color: colors.foreground }]}>
        {notice.title}
      </Text>
      <Text style={[styles.body, { color: colors.mutedForeground }]}>
        {notice.body}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    padding: 14,
    gap: 8,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  iconWrap: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  headerText: {
    flex: 1,
  },
  type: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 12,
    letterSpacing: 0.4,
    textTransform: "uppercase",
  },
  area: {
    fontFamily: "Inter_400Regular",
    fontSize: 12.5,
    marginTop: 1,
  },
  title: {
    fontFamily: "Inter_700Bold",
    fontSize: 16,
    marginTop: 2,
  },
  body: {
    fontFamily: "Inter_400Regular",
    fontSize: 14,
    lineHeight: 20,
  },
});
