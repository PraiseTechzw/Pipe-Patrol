import { Feather } from "@expo/vector-icons";
import React from "react";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";

import { SeverityBadge } from "@/components/SeverityBadge";
import { StatusBadge } from "@/components/StatusBadge";
import { useColors } from "@/hooks/useColors";
import { formatDistance, formatRelative } from "@/lib/format";
import type { Report } from "@/types";

type Props = {
  report: Report;
  distanceMeters?: number | null;
  onPress?: () => void;
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
          opacity: pressed ? 0.92 : 1,
        },
      ]}
    >
      <View style={styles.row}>
        <View style={styles.headerLeft}>
          <Text style={[styles.ticket, { color: colors.mutedForeground }]}>
            {report.ticketId}
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
          <Feather name="map-pin" size={13} color={colors.mutedForeground} />
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
              color={colors.mutedForeground}
            />
            <Text style={[styles.metaText, { color: colors.mutedForeground }]}>
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
          </View>
        ) : null}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 14,
    borderWidth: 1,
    gap: 10,
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
    gap: 8,
    flexShrink: 1,
  },
  ticket: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 12,
    letterSpacing: 0.5,
  },
  timestamp: {
    fontFamily: "Inter_400Regular",
    fontSize: 12,
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
    borderRadius: 8,
    overflow: "hidden",
  },
  thumb: {
    width: "100%",
    height: "100%",
  },
});
