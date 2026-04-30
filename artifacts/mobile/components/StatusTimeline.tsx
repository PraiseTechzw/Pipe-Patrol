import React from "react";
import { StyleSheet, Text, View } from "react-native";

import { useColors } from "@/hooks/useColors";
import { STATUS_LABEL, STATUS_ORDER, formatDateTime } from "@/lib/format";
import type { Report, ReportStatus } from "@/types";

type Props = {
  report: Report;
};

export function StatusTimeline({ report }: Props) {
  const colors = useColors();
  const reachedIndex = STATUS_ORDER.indexOf(report.status);

  return (
    <View style={styles.container}>
      {STATUS_ORDER.map((s, i) => {
        const reached = i <= reachedIndex;
        const event = [...report.history]
          .reverse()
          .find((h) => h.status === s);
        return (
          <View key={s} style={styles.row}>
            <View style={styles.indicatorColumn}>
              <View
                style={[
                  styles.dot,
                  {
                    backgroundColor: reached ? colors.primary : colors.border,
                    borderColor: reached ? colors.primary : colors.border,
                  },
                ]}
              />
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
                  },
                ]}
              >
                {STATUS_LABEL[s as ReportStatus]}
              </Text>
              {event ? (
                <Text
                  style={[styles.timestamp, { color: colors.mutedForeground }]}
                >
                  {formatDateTime(event.at)}
                  {event.note ? ` · ${event.note}` : ""}
                </Text>
              ) : (
                <Text
                  style={[styles.pending, { color: colors.mutedForeground }]}
                >
                  Pending
                </Text>
              )}
            </View>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 0,
  },
  row: {
    flexDirection: "row",
    gap: 12,
  },
  indicatorColumn: {
    alignItems: "center",
    width: 18,
  },
  dot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 2,
    marginTop: 3,
  },
  line: {
    flex: 1,
    width: 2,
    marginTop: 4,
    marginBottom: 4,
  },
  contentColumn: {
    flex: 1,
    paddingBottom: 18,
  },
  label: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 14,
  },
  timestamp: {
    fontFamily: "Inter_400Regular",
    fontSize: 12.5,
    marginTop: 2,
    lineHeight: 17,
  },
  pending: {
    fontFamily: "Inter_400Regular",
    fontSize: 12.5,
    marginTop: 2,
    fontStyle: "italic",
  },
});
