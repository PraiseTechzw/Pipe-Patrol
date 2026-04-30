import { Feather } from "@expo/vector-icons";
import React from "react";
import { Platform, StyleSheet, Text, View } from "react-native";

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

const ACCENTS: Record<
  Notice["type"],
  { bg: string; fg: string; stripe: string; soft: string }
> = {
  disruption: {
    bg: "#fee2e2",
    fg: "#7f1d1d",
    stripe: "#dc2626",
    soft: "#fef2f2",
  },
  maintenance: {
    bg: "#fef3c7",
    fg: "#78350f",
    stripe: "#d97706",
    soft: "#fffbeb",
  },
  restoration: {
    bg: "#dcfce7",
    fg: "#0f4322",
    stripe: "#0f9d58",
    soft: "#f0fdf4",
  },
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
          ...softShadow(),
        },
      ]}
    >
      <View style={[styles.stripe, { backgroundColor: accent.stripe }]} />
      <View style={styles.body}>
        <View style={styles.headerRow}>
          <View
            style={[styles.iconWrap, { backgroundColor: accent.bg }]}
          >
            <Feather name={ICONS[notice.type]} size={17} color={accent.fg} />
          </View>
          <View style={styles.headerText}>
            <Text style={[styles.type, { color: accent.fg }]}>
              {NOTICE_TYPE_LABEL[notice.type]}
            </Text>
            <View style={styles.metaRow}>
              <Feather
                name="map-pin"
                size={11}
                color={colors.mutedForeground}
              />
              <Text
                style={[styles.area, { color: colors.mutedForeground }]}
                numberOfLines={1}
              >
                {notice.area}
              </Text>
              <Text style={[styles.areaDot, { color: colors.mutedForeground }]}>
                ·
              </Text>
              <Text style={[styles.area, { color: colors.mutedForeground }]}>
                {formatRelative(notice.createdAt)}
              </Text>
            </View>
          </View>
        </View>

        <Text style={[styles.title, { color: colors.foreground }]}>
          {notice.title}
        </Text>
        <Text style={[styles.bodyText, { color: colors.mutedForeground }]}>
          {notice.body}
        </Text>
      </View>
    </View>
  );
}

function softShadow() {
  if (Platform.OS === "web") {
    return {
      boxShadow: "0 4px 14px -8px rgba(3, 105, 161, 0.18)",
    } as const;
  }
  return {
    shadowColor: "#0369a1",
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 5 },
    elevation: 2,
  } as const;
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    flexDirection: "row",
    overflow: "hidden",
  },
  stripe: {
    width: 4,
  },
  body: {
    flex: 1,
    padding: 14,
    gap: 8,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  iconWrap: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: "center",
    justifyContent: "center",
  },
  headerText: {
    flex: 1,
    gap: 2,
  },
  type: {
    fontFamily: "Inter_700Bold",
    fontSize: 12,
    letterSpacing: 0.6,
    textTransform: "uppercase",
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    flexWrap: "wrap",
  },
  area: {
    fontFamily: "Inter_500Medium",
    fontSize: 12,
  },
  areaDot: {
    fontFamily: "Inter_400Regular",
    fontSize: 12,
  },
  title: {
    fontFamily: "Inter_700Bold",
    fontSize: 16,
    marginTop: 2,
    lineHeight: 22,
  },
  bodyText: {
    fontFamily: "Inter_400Regular",
    fontSize: 14,
    lineHeight: 20,
  },
});
