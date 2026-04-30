import { Feather } from "@expo/vector-icons";
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

const FILTERS: { id: NoticeType | "all"; label: string }[] = [
  { id: "all", label: "All" },
  { id: "disruption", label: "Disruptions" },
  { id: "maintenance", label: "Maintenance" },
  { id: "restoration", label: "Restorations" },
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

  const heroPad = Platform.OS === "web" ? Math.max(insets.top, 67) : insets.top;

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
          <Text style={[styles.heading, { color: colors.foreground }]}>
            Area notices
          </Text>
          <Text style={[styles.subhead, { color: colors.mutedForeground }]}>
            Service updates from Harare's water department
          </Text>
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
                backgroundColor: colors.card,
                borderColor: colors.border,
                borderRadius: colors.radius,
              },
            ]}
          >
            <Feather name="info" size={16} color={colors.primary} />
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerWrap: {
    paddingHorizontal: 20,
    gap: 4,
  },
  heading: {
    fontFamily: "Inter_700Bold",
    fontSize: 26,
  },
  subhead: {
    fontFamily: "Inter_400Regular",
    fontSize: 14,
    lineHeight: 20,
  },
  filterRow: {
    paddingHorizontal: 20,
    paddingVertical: 16,
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
  tipText: {
    fontFamily: "Inter_400Regular",
    fontSize: 13,
    flex: 1,
    lineHeight: 19,
  },
});
