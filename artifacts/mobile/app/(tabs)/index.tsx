import { Feather } from "@expo/vector-icons";
import * as Location from "expo-location";
import { useRouter } from "expo-router";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Platform,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { EmptyState } from "@/components/EmptyState";
import { PrimaryButton } from "@/components/PrimaryButton";
import { ReportCard } from "@/components/ReportCard";
import { SectionHeader } from "@/components/SectionHeader";
import { useReports } from "@/context/ReportsContext";
import { useColors } from "@/hooks/useColors";
import { formatDistance, haversineMeters } from "@/lib/format";

const NEARBY_RADIUS_M = 8000;

export default function HomeScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { reports, drafts, defaultLocation, reporterName } = useReports();

  const [coords, setCoords] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const [locationStatus, setLocationStatus] = useState<
    "idle" | "loading" | "granted" | "denied" | "fallback"
  >("idle");
  const [refreshing, setRefreshing] = useState(false);

  const fetchLocation = useCallback(async () => {
    setLocationStatus("loading");
    try {
      if (Platform.OS === "web") {
        if (typeof navigator !== "undefined" && navigator.geolocation) {
          await new Promise<void>((resolve) => {
            navigator.geolocation.getCurrentPosition(
              (pos) => {
                setCoords({
                  latitude: pos.coords.latitude,
                  longitude: pos.coords.longitude,
                });
                setLocationStatus("granted");
                resolve();
              },
              () => {
                setCoords(defaultLocation);
                setLocationStatus("fallback");
                resolve();
              },
              { enableHighAccuracy: true, timeout: 8000 },
            );
          });
        } else {
          setCoords(defaultLocation);
          setLocationStatus("fallback");
        }
        return;
      }

      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        setCoords(defaultLocation);
        setLocationStatus("denied");
        return;
      }
      const pos = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      setCoords({
        latitude: pos.coords.latitude,
        longitude: pos.coords.longitude,
      });
      setLocationStatus("granted");
    } catch {
      setCoords(defaultLocation);
      setLocationStatus("fallback");
    }
  }, [defaultLocation]);

  useEffect(() => {
    fetchLocation();
  }, [fetchLocation]);

  const myReports = useMemo(
    () => reports.filter((r) => !r.isSeed),
    [reports],
  );

  const activeReports = useMemo(
    () => reports.filter((r) => r.status !== "resolved"),
    [reports],
  );

  const nearbyReports = useMemo(() => {
    if (!coords) return [];
    return activeReports
      .filter(
        (r) => r.location.latitude !== null && r.location.longitude !== null,
      )
      .map((r) => ({
        report: r,
        distance: haversineMeters(
          coords.latitude,
          coords.longitude,
          r.location.latitude as number,
          r.location.longitude as number,
        ),
      }))
      .filter((x) => x.distance <= NEARBY_RADIUS_M)
      .sort((a, b) => a.distance - b.distance)
      .slice(0, 5);
  }, [activeReports, coords]);

  const greeting = useMemo(() => {
    const h = new Date().getHours();
    if (h < 12) return "Good morning";
    if (h < 17) return "Good afternoon";
    return "Good evening";
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchLocation();
    setRefreshing(false);
  }, [fetchLocation]);

  const heroPad = Platform.OS === "web" ? Math.max(insets.top, 67) : insets.top;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        contentContainerStyle={{
          paddingBottom: 120,
          paddingTop: heroPad + 8,
        }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={styles.header}>
          <View style={{ flex: 1 }}>
            <Text
              style={[styles.greeting, { color: colors.mutedForeground }]}
            >
              {greeting}
            </Text>
            <Text style={[styles.heading, { color: colors.foreground }]}>
              {reporterName ? reporterName : "Harare Water"}
            </Text>
          </View>
          <View
            style={[
              styles.locChip,
              {
                backgroundColor: colors.card,
                borderColor: colors.border,
              },
            ]}
          >
            <Feather name="map-pin" size={13} color={colors.primary} />
            <Text style={[styles.locChipText, { color: colors.foreground }]}>
              {locationStatus === "loading"
                ? "Locating…"
                : locationStatus === "granted"
                  ? "GPS active"
                  : locationStatus === "denied"
                    ? "GPS off"
                    : "Harare CBD"}
            </Text>
          </View>
        </View>

        <View
          style={[
            styles.heroCard,
            {
              backgroundColor: colors.primary,
              borderRadius: colors.radius + 4,
            },
          ]}
        >
          <View style={styles.heroTop}>
            <Feather name="droplet" size={22} color={colors.primaryForeground} />
            <Text
              style={[
                styles.heroLabel,
                { color: colors.primaryForeground },
              ]}
            >
              Spotted a burst pipe?
            </Text>
          </View>
          <Text style={[styles.heroBody, { color: colors.primaryForeground }]}>
            Tag the location, snap a photo, and the right crew is alerted in
            under a minute.
          </Text>
          <View style={styles.heroActions}>
            <Pressable
              onPress={() => router.push("/report")}
              style={({ pressed }) => [
                styles.heroBtn,
                {
                  backgroundColor: colors.primaryForeground,
                  opacity: pressed ? 0.85 : 1,
                },
              ]}
            >
              <Feather name="plus" size={16} color={colors.primary} />
              <Text style={[styles.heroBtnText, { color: colors.primary }]}>
                New report
              </Text>
            </Pressable>
            <Pressable
              onPress={() => router.push("/notices")}
              style={({ pressed }) => [
                styles.heroBtnGhost,
                { opacity: pressed ? 0.6 : 1 },
              ]}
            >
              <Feather
                name="bell"
                size={16}
                color={colors.primaryForeground}
              />
              <Text
                style={[
                  styles.heroBtnGhostText,
                  { color: colors.primaryForeground },
                ]}
              >
                Area notices
              </Text>
            </Pressable>
          </View>
        </View>

        <View style={styles.statsRow}>
          <StatTile
            label="Open"
            value={activeReports.length}
            icon="alert-circle"
            tint={colors.warning}
          />
          <StatTile
            label="My reports"
            value={myReports.length}
            icon="file-text"
            tint={colors.primary}
          />
          <StatTile
            label="Drafts"
            value={drafts.length}
            icon="edit-3"
            tint={colors.mutedForeground}
          />
        </View>

        <View style={styles.section}>
          <SectionHeader
            title="Nearby active incidents"
            subtitle={
              coords
                ? `Within ${formatDistance(NEARBY_RADIUS_M)} of you`
                : "Locating…"
            }
          />
          {nearbyReports.length === 0 ? (
            <View
              style={[
                styles.emptyMini,
                { backgroundColor: colors.card, borderColor: colors.border, borderRadius: colors.radius },
              ]}
            >
              <Feather
                name="check-circle"
                size={18}
                color={colors.success}
              />
              <Text
                style={[styles.emptyMiniText, { color: colors.foreground }]}
              >
                No active bursts reported nearby. Stay alert.
              </Text>
            </View>
          ) : (
            <View style={styles.cards}>
              {nearbyReports.map(({ report, distance }) => (
                <ReportCard
                  key={report.id}
                  report={report}
                  distanceMeters={distance}
                  onPress={() => router.push(`/report/${report.id}`)}
                />
              ))}
            </View>
          )}
        </View>

        <View style={styles.section}>
          <SectionHeader
            title="My reports"
            subtitle="Tickets you've submitted"
            actionLabel={drafts.length > 0 ? `${drafts.length} drafts` : undefined}
            actionIcon={drafts.length > 0 ? "edit-3" : undefined}
            onActionPress={drafts.length > 0 ? () => router.push("/report") : undefined}
          />
          {myReports.length === 0 ? (
            <EmptyState
              icon="inbox"
              title="No reports yet"
              message="When you submit a burst pipe report, it will appear here so you can track its progress."
            >
              <PrimaryButton
                label="Submit your first report"
                icon="plus"
                onPress={() => router.push("/report")}
              />
            </EmptyState>
          ) : (
            <View style={styles.cards}>
              {myReports.map((report) => (
                <ReportCard
                  key={report.id}
                  report={report}
                  onPress={() => router.push(`/report/${report.id}`)}
                />
              ))}
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

function StatTile({
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
        styles.stat,
        {
          backgroundColor: colors.card,
          borderColor: colors.border,
          borderRadius: colors.radius,
        },
      ]}
    >
      <Feather name={icon} size={16} color={tint} />
      <Text style={[styles.statValue, { color: colors.foreground }]}>
        {value}
      </Text>
      <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  greeting: {
    fontFamily: "Inter_500Medium",
    fontSize: 13,
    letterSpacing: 0.2,
  },
  heading: {
    fontFamily: "Inter_700Bold",
    fontSize: 24,
    marginTop: 2,
  },
  locChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  locChipText: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 12,
  },
  heroCard: {
    marginHorizontal: 20,
    marginTop: 18,
    padding: 18,
    gap: 12,
    overflow: "hidden",
  },
  heroTop: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  heroLabel: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 14,
    letterSpacing: 0.2,
    opacity: 0.9,
  },
  heroBody: {
    fontFamily: "Inter_500Medium",
    fontSize: 18,
    lineHeight: 25,
  },
  heroActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginTop: 4,
  },
  heroBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
  },
  heroBtnText: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 14,
  },
  heroBtnGhost: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  heroBtnGhostText: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 14,
    opacity: 0.95,
  },
  statsRow: {
    flexDirection: "row",
    gap: 10,
    paddingHorizontal: 20,
    marginTop: 16,
  },
  stat: {
    flex: 1,
    borderWidth: 1,
    padding: 12,
    gap: 4,
  },
  statValue: {
    fontFamily: "Inter_700Bold",
    fontSize: 22,
    marginTop: 2,
  },
  statLabel: {
    fontFamily: "Inter_500Medium",
    fontSize: 12,
  },
  section: {
    marginTop: 22,
    paddingHorizontal: 20,
    gap: 12,
  },
  cards: {
    gap: 10,
  },
  emptyMini: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    padding: 14,
    borderWidth: 1,
  },
  emptyMiniText: {
    fontFamily: "Inter_500Medium",
    fontSize: 13.5,
    flex: 1,
  },
});
