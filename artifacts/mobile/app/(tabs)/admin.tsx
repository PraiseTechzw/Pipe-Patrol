import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useMemo, useState } from "react";
import {
  Alert,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { EmptyState } from "@/components/EmptyState";
import { ReportCard } from "@/components/ReportCard";
import { useReports } from "@/context/ReportsContext";
import { useColors } from "@/hooks/useColors";
import type { ReportStatus } from "@/types";

const FILTERS: { id: ReportStatus | "all"; label: string }[] = [
  { id: "all", label: "All" },
  { id: "submitted", label: "New" },
  { id: "acknowledged", label: "Acknowledged" },
  { id: "in_progress", label: "Crew dispatched" },
  { id: "resolved", label: "Resolved" },
];

export default function AdminScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { reports, resetSampleData } = useReports();
  const [filter, setFilter] = useState<ReportStatus | "all">("all");

  const filtered = useMemo(() => {
    const sorted = [...reports].sort((a, b) => {
      const sevWeight: Record<string, number> = { high: 3, medium: 2, low: 1 };
      const sevDiff = sevWeight[b.severity]! - sevWeight[a.severity]!;
      if (sevDiff !== 0 && filter !== "resolved") return sevDiff;
      return b.createdAt - a.createdAt;
    });
    if (filter === "all") return sorted;
    return sorted.filter((r) => r.status === filter);
  }, [reports, filter]);

  const counts = useMemo(() => {
    return {
      total: reports.length,
      open: reports.filter((r) => r.status !== "resolved").length,
      high: reports.filter(
        (r) => r.severity === "high" && r.status !== "resolved",
      ).length,
      resolved: reports.filter((r) => r.status === "resolved").length,
    };
  }, [reports]);

  const heroPad = Platform.OS === "web" ? Math.max(insets.top, 67) : insets.top;

  const onReset = () => {
    const doReset = async () => {
      await resetSampleData();
    };
    if (Platform.OS === "web") {
      if (
        typeof window !== "undefined" &&
        window.confirm("Reset to sample data? Your local reports and drafts will be cleared.")
      ) {
        void doReset();
      }
      return;
    }
    Alert.alert(
      "Reset sample data?",
      "This clears your local reports and drafts and reloads sample incidents.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Reset",
          style: "destructive",
          onPress: () => {
            void doReset();
          },
        },
      ],
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        contentContainerStyle={{
          paddingTop: heroPad + 8,
          paddingBottom: 120,
        }}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.headerWrap}>
          <View style={{ flex: 1 }}>
            <Text style={[styles.eyebrow, { color: colors.primary }]}>
              Municipal dashboard
            </Text>
            <Text style={[styles.heading, { color: colors.foreground }]}>
              Repair queue
            </Text>
            <Text
              style={[styles.subhead, { color: colors.mutedForeground }]}
            >
              Triage incoming reports and update repair status.
            </Text>
          </View>
          <Pressable
            onPress={onReset}
            style={({ pressed }) => [
              styles.resetBtn,
              {
                backgroundColor: colors.card,
                borderColor: colors.border,
                opacity: pressed ? 0.7 : 1,
              },
            ]}
            hitSlop={6}
          >
            <Feather
              name="refresh-cw"
              size={14}
              color={colors.mutedForeground}
            />
          </Pressable>
        </View>

        <View style={styles.statsGrid}>
          <DashStat
            label="Open tickets"
            value={counts.open}
            icon="inbox"
            tint={colors.primary}
          />
          <DashStat
            label="High severity"
            value={counts.high}
            icon="alert-triangle"
            tint={colors.destructive}
          />
          <DashStat
            label="Resolved"
            value={counts.resolved}
            icon="check-circle"
            tint={colors.success}
          />
          <DashStat
            label="Total"
            value={counts.total}
            icon="layers"
            tint={colors.mutedForeground}
          />
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterRow}
        >
          {FILTERS.map((f) => {
            const active = filter === f.id;
            return (
              <Pressable
                key={f.id}
                onPress={() => setFilter(f.id)}
                style={({ pressed }) => [
                  styles.filterChip,
                  {
                    backgroundColor: active ? colors.primary : colors.card,
                    borderColor: active ? colors.primary : colors.border,
                    opacity: pressed ? 0.85 : 1,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.filterText,
                    {
                      color: active
                        ? colors.primaryForeground
                        : colors.foreground,
                    },
                  ]}
                >
                  {f.label}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>

        <View style={styles.body}>
          {filtered.length === 0 ? (
            <EmptyState
              icon="check-circle"
              title="Nothing in this queue"
              message="Reports matching this filter will appear here."
            />
          ) : (
            <View style={{ gap: 10 }}>
              {filtered.map((r) => (
                <ReportCard
                  key={r.id}
                  report={r}
                  onPress={() => router.push(`/report/${r.id}`)}
                />
              ))}
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

function DashStat({
  label,
  value,
  icon,
  tint,
}: {
  label: string;
  value: number;
  icon: keyof typeof Feather.glyphMap;
  tint: string;
}) {
  const colors = useColors();
  return (
    <View
      style={[
        styles.dashStat,
        {
          backgroundColor: colors.card,
          borderColor: colors.border,
          borderRadius: colors.radius,
        },
      ]}
    >
      <View style={styles.dashStatTop}>
        <Feather name={icon} size={15} color={tint} />
        <Text style={[styles.dashLabel, { color: colors.mutedForeground }]}>
          {label}
        </Text>
      </View>
      <Text style={[styles.dashValue, { color: colors.foreground }]}>
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerWrap: {
    paddingHorizontal: 20,
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
  },
  eyebrow: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 12,
    letterSpacing: 0.6,
    textTransform: "uppercase",
  },
  heading: {
    fontFamily: "Inter_700Bold",
    fontSize: 26,
    marginTop: 2,
  },
  subhead: {
    fontFamily: "Inter_400Regular",
    fontSize: 14,
    lineHeight: 20,
    marginTop: 2,
  },
  resetBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  statsGrid: {
    paddingHorizontal: 20,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginTop: 18,
  },
  dashStat: {
    flexBasis: "48%",
    flexGrow: 1,
    borderWidth: 1,
    padding: 14,
    gap: 8,
  },
  dashStatTop: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  dashLabel: {
    fontFamily: "Inter_500Medium",
    fontSize: 12.5,
  },
  dashValue: {
    fontFamily: "Inter_700Bold",
    fontSize: 24,
  },
  filterRow: {
    paddingHorizontal: 20,
    paddingVertical: 18,
    gap: 8,
  },
  filterChip: {
    borderWidth: 1,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 999,
  },
  filterText: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 13,
  },
  body: {
    paddingHorizontal: 20,
  },
});
