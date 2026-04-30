import { Feather } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

import { useColors } from "@/hooks/useColors";
import { STATUS_LABEL, STATUS_ORDER, formatDateTime } from "@/lib/format";
import type { Report, ReportStatus } from "@/types";

type Props = {
  report: Report;
};

const STEP_ICON: Record<ReportStatus, keyof typeof Feather.glyphMap> = {
  submitted: "send",
  acknowledged: "eye",
  in_progress: "tool",
  resolved: "check-circle",
};

export function StatusTimeline({ report }: Props) {
  const colors = useColors();
  const reachedIndex = STATUS_ORDER.indexOf(report.status);
  const total = STATUS_ORDER.length - 1;
  const pct = Math.round((reachedIndex / total) * 100);

  return (
    <View style={styles.container}>
      <View style={styles.summaryRow}>
        <View style={{ flex: 1 }}>
          <Text style={[styles.summaryLabel, { color: colors.mutedForeground }]}>
            Repair progress
          </Text>
          <Text style={[styles.summaryValue, { color: colors.foreground }]}>
            {pct}%{" "}
            <Text
              style={[styles.summarySub, { color: colors.mutedForeground }]}
            >
              · {STATUS_LABEL[report.status]}
            </Text>
          </Text>
        </View>
      </View>

      <View
        style={[styles.bar, { backgroundColor: colors.muted }]}
      >
        <View
          style={[
            styles.barFill,
            {
              width: `${pct}%`,
              backgroundColor:
                report.status === "resolved" ? colors.success : colors.accent,
            },
          ]}
        />
      </View>

      <View style={styles.stepsWrap}>
        {STATUS_ORDER.map((s, i) => {
          const reached = i <= reachedIndex;
          const isCurrent = i === reachedIndex;
          const event = [...report.history].reverse().find((h) => h.status === s);
          const ringColor = reached
            ? s === "resolved" && reached
              ? colors.success
              : colors.primary
            : colors.border;

          return (
            <View key={s} style={styles.row}>
              <View style={styles.indicatorColumn}>
                <View
                  style={[
                    styles.iconRing,
                    {
                      backgroundColor: reached ? ringColor : colors.card,
                      borderColor: ringColor,
                    },
                    isCurrent && styles.iconRingActive,
                  ]}
                >
                  <Feather
                    name={STEP_ICON[s as ReportStatus]}
                    size={13}
                    color={reached ? "#ffffff" : colors.mutedForeground}
                  />
                </View>
                {i < STATUS_ORDER.length - 1 ? (
                  <View
                    style={[
                      styles.line,
                      {
                        backgroundColor:
                          i < reachedIndex ? colors.primary : colors.border,
                      },
                    ]}
                  />
                ) : null}
              </View>
              <View style={styles.contentColumn}>
                <Text
                  style={[
                    styles.label,
                    {
                      color: reached ? colors.foreground : colors.mutedForeground,
                      fontFamily: isCurrent
                        ? "Inter_700Bold"
                        : "Inter_600SemiBold",
                    },
                  ]}
                >
                  {STATUS_LABEL[s as ReportStatus]}
                </Text>
                {event ? (
                  <>
                    <Text
                      style={[
                        styles.timestamp,
                        { color: colors.mutedForeground },
                      ]}
                    >
                      {formatDateTime(event.at)}
                    </Text>
                    {event.note ? (
                      <Text
                        style={[styles.note, { color: colors.foreground }]}
                      >
                        {event.note}
                      </Text>
                    ) : null}
                  </>
                ) : (
                  <Text
                    style={[styles.pending, { color: colors.mutedForeground }]}
                  >
                    Awaiting update
                  </Text>
                )}
              </View>
            </View>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 14,
  },
  summaryRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  summaryLabel: {
    fontFamily: "Inter_500Medium",
    fontSize: 11,
    letterSpacing: 0.6,
    textTransform: "uppercase",
  },
  summaryValue: {
    fontFamily: "Inter_700Bold",
    fontSize: 18,
    marginTop: 2,
  },
  summarySub: {
    fontFamily: "Inter_500Medium",
    fontSize: 13,
  },
  bar: {
    height: 8,
    borderRadius: 4,
    overflow: "hidden",
  },
  barFill: {
    height: "100%",
    borderRadius: 4,
  },
  stepsWrap: {
    marginTop: 6,
  },
  row: {
    flexDirection: "row",
    gap: 12,
  },
  indicatorColumn: {
    alignItems: "center",
    width: 28,
  },
  iconRing: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
  },
  iconRingActive: {
    transform: [{ scale: 1.08 }],
  },
  line: {
    flex: 1,
    width: 2,
    marginTop: 4,
    marginBottom: 4,
    minHeight: 14,
  },
  contentColumn: {
    flex: 1,
    paddingBottom: 18,
    gap: 2,
  },
  label: {
    fontSize: 14.5,
  },
  timestamp: {
    fontFamily: "Inter_400Regular",
    fontSize: 12.5,
    marginTop: 1,
    lineHeight: 17,
  },
  note: {
    fontFamily: "Inter_500Medium",
    fontSize: 13,
    marginTop: 2,
    lineHeight: 18,
  },
  pending: {
    fontFamily: "Inter_400Regular",
    fontSize: 12.5,
    marginTop: 1,
    fontStyle: "italic",
  },
});
