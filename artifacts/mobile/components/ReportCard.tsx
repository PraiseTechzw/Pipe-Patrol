import { Feather } from "@expo/vector-icons";
import React from "react";
import {
  Image,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { SeverityBadge } from "@/components/SeverityBadge";
import { StatusBadge } from "@/components/StatusBadge";
import { useColors } from "@/hooks/useColors";
import { formatDistance, formatRelative } from "@/lib/format";
import type { Report, Severity } from "@/types";

type Props = {
  report: Report;
  distanceMeters?: number | null;
  onPress?: () => void;
};

const STRIPE_COLOR: Record<Severity, string> = {
  low: "#06b6d4",
  medium: "#f59e0b",
  high: "#dc2626",
};

export function ReportCard({ report, distanceMeters, onPress }: Props) {
  const colors = useColors();

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        {
          backgroundColor: colors.card,
          borderColor: colors.border,
          borderRadius: colors.radius,
          opacity: pressed ? 0.94 : 1,
          ...softShadow(),
        },
      ]}
    >
      <View
        style={[
          styles.stripe,
          { backgroundColor: STRIPE_COLOR[report.severity] },
        ]}
      />
      <View style={styles.body}>
        <View style={styles.row}>
          <View style={styles.headerLeft}>
            <Text style={[styles.ticket, { color: colors.primary }]}>
              {report.ticketId}
            </Text>
            <Text
              style={[styles.dot, { color: colors.mutedForeground }]}
            >
              ·
            </Text>
            <Text
              style={[styles.timestamp, { color: colors.mutedForeground }]}
              numberOfLines={1}
            >
              {formatRelative(report.createdAt)}
            </Text>
          </View>
          <StatusBadge status={report.status} size="sm" />
        </View>

        <Text
          style={[styles.description, { color: colors.foreground }]}
          numberOfLines={2}
        >
          {report.description}
        </Text>

        <View style={styles.metaRow}>
          <View style={styles.metaItem}>
            <Feather name="map-pin" size={13} color={colors.primary} />
            <Text
              style={[styles.metaText, { color: colors.mutedForeground }]}
              numberOfLines={1}
            >
              {report.location.address || "Manual location"}
            </Text>
          </View>
          {distanceMeters != null && (
            <View style={styles.metaItem}>
              <Feather
                name="navigation"
                size={13}
                color={colors.accent}
              />
              <Text
                style={[
                  styles.metaText,
                  { color: colors.mutedForeground, fontFamily: "Inter_600SemiBold" },
                ]}
              >
                {formatDistance(distanceMeters)}
              </Text>
            </View>
          )}
        </View>

        <View style={styles.footer}>
          <SeverityBadge severity={report.severity} size="sm" />
          {report.imageUri ? (
            <View style={styles.thumbWrap}>
              <Image
                source={{ uri: report.imageUri }}
                style={styles.thumb}
                resizeMode="cover"
              />
              <View style={styles.thumbBadge}>
                <Feather name="camera" size={9} color="#ffffff" />
              </View>
            </View>
          ) : (
            <View style={styles.viewArrow}>
              <Text
                style={[styles.viewText, { color: colors.primary }]}
              >
                View
              </Text>
              <Feather name="chevron-right" size={14} color={colors.primary} />
            </View>
          )}
        </View>
      </View>
    </Pressable>
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
    overflow: "hidden",
    flexDirection: "row",
  },
  stripe: {
    width: 4,
  },
  body: {
    flex: 1,
    padding: 14,
    gap: 8,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 8,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    flexShrink: 1,
  },
  ticket: {
    fontFamily: "Inter_700Bold",
    fontSize: 12.5,
    letterSpacing: 0.5,
  },
  dot: {
    fontFamily: "Inter_400Regular",
    fontSize: 12.5,
  },
  timestamp: {
    fontFamily: "Inter_400Regular",
    fontSize: 12.5,
  },
  description: {
    fontFamily: "Inter_500Medium",
    fontSize: 15,
    lineHeight: 21,
  },
  metaRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  metaItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    flexShrink: 1,
  },
  metaText: {
    fontFamily: "Inter_400Regular",
    fontSize: 12.5,
    flexShrink: 1,
  },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 2,
  },
  thumbWrap: {
    width: 44,
    height: 44,
    borderRadius: 10,
    overflow: "hidden",
    position: "relative",
  },
  thumb: {
    width: "100%",
    height: "100%",
  },
  thumbBadge: {
    position: "absolute",
    bottom: 2,
    right: 2,
    backgroundColor: "rgba(0,0,0,0.55)",
    width: 14,
    height: 14,
    borderRadius: 7,
    alignItems: "center",
    justifyContent: "center",
  },
  viewArrow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
  },
  viewText: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 12.5,
  },
});
