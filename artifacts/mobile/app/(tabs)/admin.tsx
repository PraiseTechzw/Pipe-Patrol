import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
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
import { useAuth } from "@/context/AuthContext";
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
  const { user, isStaff } = useAuth();
  const [filter, setFilter] = useState<ReportStatus | "all">("all");
  const staffFirstName = user?.name?.split(" ")[0] ?? "team";

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

  React.useEffect(() => {
    if (!isStaff) {
      router.replace("/(tabs)");
    }
  }, [isStaff, router]);

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
          paddingBottom: 120,
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* Gradient header */}
        <LinearGradient
          colors={[colors.primaryDeep, colors.primary, colors.accent] as const}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[
            styles.headerHero,
            { paddingTop: heroPad + 18, paddingBottom: 28 },
          ]}
        >
          <View pointerEvents="none" style={StyleSheet.absoluteFillObject}>
            <View style={[styles.blob, styles.blobA]} />
            <View style={[styles.blob, styles.blobB]} />
          </View>

          <View style={styles.headerWrap}>
            <View style={{ flex: 1 }}>
              <View style={styles.eyebrowRow}>
                <Feather name="shield" size={11} color="#ffffff" />
                <Text style={styles.eyebrow}>Municipal dashboard</Text>
              </View>
              <Text style={styles.heading}>Repair queue</Text>
              <Text style={styles.subhead}>
                Welcome back, {staffFirstName}. Triage incoming citizen reports
                and update repair status in real time.
              </Text>
            </View>
            <Pressable
              onPress={onReset}
              style={({ pressed }) => [
                styles.resetBtn,
                {
                  backgroundColor: "rgba(255,255,255,0.16)",
                  opacity: pressed ? 0.7 : 1,
                },
              ]}
              hitSlop={6}
            >
              <Feather name="refresh-cw" size={14} color="#ffffff" />
            </Pressable>
          </View>
        </LinearGradient>

        {/* KPI cards */}
        <View style={styles.statsGrid}>
          <KpiCard
            label="Open tickets"
            value={counts.open}
            icon="inbox"
            tint={colors.primary}
            tintSoft="#dbeafe"
            accent="primary"
          />
          <KpiCard
            label="High severity"
            value={counts.high}
            icon="alert-triangle"
            tint={colors.destructive}
            tintSoft="#fee2e2"
            accent="warning"
          />
          <KpiCard
            label="Resolved"
            value={counts.resolved}
            icon="check-circle"
            tint={colors.success}
            tintSoft={colors.successSoft}
            accent="success"
          />
          <KpiCard
            label="Total"
            value={counts.total}
            icon="layers"
            tint={colors.accent}
            tintSoft={colors.accentSoft}
            accent="info"
          />
        </View>

        {/* Filter chips */}
        <View style={styles.filterSection}>
          <Text style={[styles.filterLabel, { color: colors.mutedForeground }]}>
            Filter by status
          </Text>
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
        </View>

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

function KpiCard({
  label,
  value,
  icon,
  tint,
  tintSoft,
}: {
  label: string;
  value: number;
  icon: keyof typeof Feather.glyphMap;
  tint: string;
  tintSoft: string;
  accent: "primary" | "warning" | "success" | "info";
}) {
  const colors = useColors();
  return (
    <View
      style={[
        styles.kpiCard,
        {
          backgroundColor: colors.card,
          borderColor: colors.border,
          borderRadius: colors.radius,
          ...softShadow(),
        },
      ]}
    >
      <View style={styles.kpiTopRow}>
        <View
          style={[
            styles.kpiIconWrap,
            { backgroundColor: tintSoft },
          ]}
        >
          <Feather name={icon} size={16} color={tint} />
        </View>
        <Text
          style={[styles.kpiLabel, { color: colors.mutedForeground }]}
          numberOfLines={1}
        >
          {label}
        </Text>
      </View>
      <Text style={[styles.kpiValue, { color: colors.foreground }]}>
        {value}
      </Text>
      <View style={[styles.kpiBar, { backgroundColor: colors.muted }]}>
        <View
          style={[
            styles.kpiBarFill,
            {
              backgroundColor: tint,
              width: value > 0 ? `${Math.min(100, value * 20)}%` : "8%",
            },
          ]}
        />
      </View>
    </View>
  );
}

function softShadow() {
  if (Platform.OS === "web") {
    return {
      boxShadow: "0 6px 18px -10px rgba(3, 105, 161, 0.2)",
    } as const;
  }
  return {
    shadowColor: "#0369a1",
    shadowOpacity: 0.08,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 6 },
    elevation: 2,
  } as const;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerHero: {
    paddingHorizontal: 22,
    overflow: "hidden",
  },
  blob: {
    position: "absolute",
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.07)",
  },
  blobA: {
    width: 180,
    height: 180,
    top: -70,
    right: -50,
  },
  blobB: {
    width: 120,
    height: 120,
    bottom: -50,
    left: -30,
    backgroundColor: "rgba(255,255,255,0.05)",
  },
  headerWrap: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
  },
  eyebrowRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(255,255,255,0.18)",
    alignSelf: "flex-start",
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 999,
  },
  eyebrow: {
    fontFamily: "Inter_700Bold",
    fontSize: 11,
    letterSpacing: 0.5,
    textTransform: "uppercase",
    color: "#ffffff",
  },
  heading: {
    fontFamily: "Inter_700Bold",
    fontSize: 28,
    color: "#ffffff",
    marginTop: 10,
    letterSpacing: -0.4,
  },
  subhead: {
    fontFamily: "Inter_400Regular",
    fontSize: 14,
    lineHeight: 20,
    marginTop: 6,
    color: "rgba(255,255,255,0.92)",
  },
  resetBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  statsGrid: {
    paddingHorizontal: 16,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginTop: -16,
  },
  kpiCard: {
    flexBasis: "48%",
    flexGrow: 1,
    borderWidth: 1,
    padding: 14,
    gap: 8,
  },
  kpiTopRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  kpiIconWrap: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  kpiLabel: {
    fontFamily: "Inter_500Medium",
    fontSize: 12.5,
    flex: 1,
  },
  kpiValue: {
    fontFamily: "Inter_700Bold",
    fontSize: 28,
    letterSpacing: -0.5,
  },
  kpiBar: {
    height: 4,
    borderRadius: 2,
    overflow: "hidden",
    marginTop: 2,
  },
  kpiBarFill: {
    height: "100%",
    borderRadius: 2,
  },
  filterSection: {
    marginTop: 22,
    gap: 8,
  },
  filterLabel: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 11,
    letterSpacing: 0.6,
    textTransform: "uppercase",
    paddingHorizontal: 22,
  },
  filterRow: {
    paddingHorizontal: 16,
    paddingVertical: 4,
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
    paddingHorizontal: 16,
    marginTop: 14,
  },
});
