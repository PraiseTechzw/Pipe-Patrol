import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React, { useMemo, useState } from "react";
import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { EmptyState } from "@/components/EmptyState";
import { NoticeCard } from "@/components/NoticeCard";
import { useReports } from "@/context/ReportsContext";
import { useColors } from "@/hooks/useColors";
import type { NoticeType } from "@/types";

const FILTERS: { id: NoticeType | "all"; label: string; icon: keyof typeof Feather.glyphMap }[] = [
  { id: "all", label: "All", icon: "list" },
  { id: "disruption", label: "Disruptions", icon: "alert-triangle" },
  { id: "maintenance", label: "Maintenance", icon: "tool" },
  { id: "restoration", label: "Restorations", icon: "check-circle" },
];

export default function NoticesScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { notices } = useReports();
  const [filter, setFilter] = useState<NoticeType | "all">("all");

  const filtered = useMemo(() => {
    const sorted = [...notices].sort((a, b) => b.createdAt - a.createdAt);
    if (filter === "all") return sorted;
    return sorted.filter((n) => n.type === filter);
  }, [notices, filter]);

  const counts = useMemo(() => {
    return {
      disruption: notices.filter((n) => n.type === "disruption").length,
      maintenance: notices.filter((n) => n.type === "maintenance").length,
      restoration: notices.filter((n) => n.type === "restoration").length,
    };
  }, [notices]);

  const heroPad = Platform.OS === "web" ? Math.max(insets.top, 67) : insets.top;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        contentContainerStyle={{
          paddingBottom: 120,
        }}
        showsVerticalScrollIndicator={false}
      >
        <LinearGradient
          colors={[colors.primaryDeep, colors.primary] as const}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[
            styles.hero,
            { paddingTop: heroPad + 18, paddingBottom: 26 },
          ]}
        >
          <View pointerEvents="none" style={StyleSheet.absoluteFillObject}>
            <View style={[styles.blob, styles.blobA]} />
            <View style={[styles.blob, styles.blobB]} />
          </View>
          <View style={styles.eyebrowRow}>
            <Feather name="bell" size={11} color="#ffffff" />
            <Text style={styles.eyebrow}>Service updates</Text>
          </View>
          <Text style={styles.heading}>Area notices</Text>
          <Text style={styles.subhead}>
            Disruptions, scheduled maintenance and restoration updates from
            Harare's water department.
          </Text>

          <View style={styles.kpiRow}>
            <NoticeKpi
              label="Disruptions"
              value={counts.disruption}
              icon="alert-triangle"
            />
            <NoticeKpi
              label="Maintenance"
              value={counts.maintenance}
              icon="tool"
            />
            <NoticeKpi
              label="Restorations"
              value={counts.restoration}
              icon="check-circle"
            />
          </View>
        </LinearGradient>

        <View style={styles.filterSection}>
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
                  <Feather
                    name={f.icon}
                    size={13}
                    color={active ? colors.primaryForeground : colors.foreground}
                  />
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
              icon="bell-off"
              title="No notices in this category"
              message="When the municipality posts new alerts, they'll show up here."
            />
          ) : (
            <View style={{ gap: 12 }}>
              {filtered.map((n) => (
                <NoticeCard key={n.id} notice={n} />
              ))}
            </View>
          )}

          <View
            style={[
              styles.tipCard,
              {
                backgroundColor: colors.surfaceTint,
                borderColor: colors.border,
                borderRadius: colors.radius,
              },
            ]}
          >
            <View
              style={[
                styles.tipIcon,
                { backgroundColor: colors.accentSoft },
              ]}
            >
              <Feather name="info" size={14} color={colors.accentForeground} />
            </View>
            <Text style={[styles.tipText, { color: colors.foreground }]}>
              Notices are stored on this device. Pull-to-refresh from Home will
              update them when an internet connection becomes available.
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

function NoticeKpi({
  label,
  value,
  icon,
}: {
  label: string;
  value: number;
  icon: keyof typeof Feather.glyphMap;
}) {
  return (
    <View style={styles.kpi}>
      <View style={styles.kpiTop}>
        <Feather name={icon} size={12} color="#ffffff" />
        <Text style={styles.kpiLabel}>{label}</Text>
      </View>
      <Text style={styles.kpiValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  hero: {
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
    width: 100,
    height: 100,
    bottom: -40,
    left: -20,
    backgroundColor: "rgba(255,255,255,0.05)",
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
  kpiRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 18,
  },
  kpi: {
    flex: 1,
    backgroundColor: "rgba(255,255,255,0.13)",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 6,
  },
  kpiTop: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  kpiLabel: {
    fontFamily: "Inter_500Medium",
    fontSize: 11,
    color: "#ffffffd0",
  },
  kpiValue: {
    fontFamily: "Inter_700Bold",
    fontSize: 22,
    color: "#ffffff",
  },
  filterSection: {
    marginTop: 14,
  },
  filterRow: {
    paddingHorizontal: 16,
    paddingVertical: 4,
    gap: 8,
  },
  filterChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    borderWidth: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 999,
  },
  filterText: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 13,
  },
  body: {
    paddingHorizontal: 16,
    marginTop: 14,
    gap: 16,
  },
  tipCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    padding: 14,
    borderWidth: 1,
    marginTop: 4,
  },
  tipIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  tipText: {
    fontFamily: "Inter_400Regular",
    fontSize: 13,
    flex: 1,
    lineHeight: 19,
  },
});
