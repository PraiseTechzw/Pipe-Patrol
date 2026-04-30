import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
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
import { useAuth } from "@/context/AuthContext";
import { useReports } from "@/context/ReportsContext";
import { useColors } from "@/hooks/useColors";
import { formatDistance, haversineMeters } from "@/lib/format";

const NEARBY_RADIUS_M = 8000;

export default function HomeScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { reports, drafts, defaultLocation } = useReports();
  const { user } = useAuth();
  const reporterName = user?.name ?? "";

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

  const resolvedToday = useMemo(() => {
    const dayMs = 24 * 60 * 60 * 1000;
    const cutoff = Date.now() - dayMs;
    return reports.filter(
      (r) => r.status === "resolved" && r.updatedAt >= cutoff,
    ).length;
  }, [reports]);

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
        }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Gradient hero */}
        <LinearGradient
          colors={colors.heroGradient}
          start={colors.heroGradientStart}
          end={colors.heroGradientEnd}
          style={[
            styles.hero,
            { paddingTop: heroPad + 16, paddingBottom: 28 },
          ]}
        >
          {/* Decorative water blobs */}
          <View pointerEvents="none" style={StyleSheet.absoluteFillObject}>
            <View style={[styles.blob, styles.blobA]} />
            <View style={[styles.blob, styles.blobB]} />
            <View style={[styles.blob, styles.blobC]} />
          </View>

          <View style={styles.heroTopRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.heroGreeting}>{greeting}</Text>
              <Text style={styles.heroName}>
                {reporterName ? reporterName : "Harare Water"}
              </Text>
            </View>
            <View style={styles.locChip}>
              <View
                style={[
                  styles.locDot,
                  {
                    backgroundColor:
                      locationStatus === "granted"
                        ? "#34d399"
                        : locationStatus === "loading"
                          ? "#fbbf24"
                          : "#fbbf24",
                  },
                ]}
              />
              <Text style={styles.locChipText}>
                {locationStatus === "loading"
                  ? "Locating"
                  : locationStatus === "granted"
                    ? "GPS active"
                    : locationStatus === "denied"
                      ? "GPS off"
                      : "Harare CBD"}
              </Text>
            </View>
          </View>

          <View style={styles.heroBadge}>
            <Feather name="droplet" size={12} color="#ffffff" />
            <Text style={styles.heroBadgeText}>
              Burst Pipe Reporting · Harare
            </Text>
          </View>

          <Text style={styles.heroTitle}>
            Report a burst.{"\n"}Track the repair.
          </Text>
          <Text style={styles.heroSubtitle}>
            A simple, fast way for Harare citizens to report burst pipes,
            follow repair progress, and stay ahead of disruptions, scheduled
            maintenance, and restoration updates.
          </Text>

          <View style={styles.heroActions}>
            <Pressable
              onPress={() => router.push("/report")}
              style={({ pressed }) => [
                styles.heroBtnPrimary,
                {
                  backgroundColor: "#ffffff",
                  opacity: pressed ? 0.9 : 1,
                },
              ]}
            >
              <Feather name="plus" size={16} color={colors.primary} />
              <Text
                style={[styles.heroBtnPrimaryText, { color: colors.primary }]}
              >
                New report
              </Text>
            </Pressable>
            <Pressable
              onPress={() => router.push("/notices")}
              style={({ pressed }) => [
                styles.heroBtnGhost,
                { opacity: pressed ? 0.75 : 1 },
              ]}
            >
              <Feather name="bell" size={16} color="#ffffff" />
              <Text style={styles.heroBtnGhostText}>Area notices</Text>
            </Pressable>
          </View>
        </LinearGradient>

        {/* Floating stats card */}
        <View style={styles.statsFloat}>
          <View
            style={[
              styles.statsCard,
              {
                backgroundColor: colors.card,
                borderColor: colors.border,
                borderRadius: colors.radius,
                ...softShadow(),
              },
            ]}
          >
            <StatTile
              label="Open"
              value={activeReports.length}
              icon="alert-circle"
              tint={colors.warning}
            />
            <Divider />
            <StatTile
              label="Fixed today"
              value={resolvedToday}
              icon="check-circle"
              tint={colors.success}
            />
            <Divider />
            <StatTile
              label="My reports"
              value={myReports.length}
              icon="file-text"
              tint={colors.primary}
            />
            <Divider />
            <StatTile
              label="Drafts"
              value={drafts.length}
              icon="edit-3"
              tint={colors.mutedForeground}
            />
          </View>
        </View>

        {/* Nearby */}
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
                {
                  backgroundColor: colors.card,
                  borderColor: colors.border,
                  borderRadius: colors.radius,
                  ...softShadow(),
                },
              ]}
            >
              <View
                style={[
                  styles.emptyIcon,
                  { backgroundColor: colors.successSoft },
                ]}
              >
                <Feather
                  name="check-circle"
                  size={16}
                  color={colors.success}
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text
                  style={[styles.emptyMiniTitle, { color: colors.foreground }]}
                >
                  All clear nearby
                </Text>
                <Text
                  style={[
                    styles.emptyMiniSub,
                    { color: colors.mutedForeground },
                  ]}
                >
                  No active bursts reported within {formatDistance(NEARBY_RADIUS_M)}.
                </Text>
              </View>
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

        {/* My reports */}
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

        {/* Why it matters */}
        <View style={styles.section}>
          <View
            style={[
              styles.infoCard,
              {
                backgroundColor: colors.card,
                borderColor: colors.border,
                borderRadius: colors.radius,
                ...softShadow(),
              },
            ]}
          >
            <View
              style={[
                styles.infoIcon,
                { backgroundColor: colors.accentSoft },
              ]}
            >
              <Feather name="map-pin" size={18} color={colors.accentForeground} />
            </View>
            <View style={{ flex: 1, gap: 4 }}>
              <Text style={[styles.infoTitle, { color: colors.foreground }]}>
                GPS tagging helps crews respond faster
              </Text>
              <Text
                style={[styles.infoBody, { color: colors.mutedForeground }]}
              >
                Each report you submit pins the burst on a precise location so
                authorities can dispatch the right team and manage repairs more
                efficiently.
              </Text>
            </View>
          </View>
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
    <View style={styles.stat}>
      <View
        style={[
          styles.statIconWrap,
          { backgroundColor: tint + "1a" },
        ]}
      >
        <Feather name={icon} size={14} color={tint} />
      </View>
      <Text style={[styles.statValue, { color: colors.foreground }]}>
        {value}
      </Text>
      <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>
        {label}
      </Text>
    </View>
  );
}

function Divider() {
  const colors = useColors();
  return <View style={[styles.divider, { backgroundColor: colors.border }]} />;
}

function softShadow() {
  if (Platform.OS === "web") {
    return {
      boxShadow: "0 8px 22px -12px rgba(3, 105, 161, 0.22)",
    } as const;
  }
  return {
    shadowColor: "#0369a1",
    shadowOpacity: 0.1,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 3,
  } as const;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  hero: {
    paddingHorizontal: 22,
    paddingBottom: 28,
    overflow: "hidden",
  },
  blob: {
    position: "absolute",
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.08)",
  },
  blobA: {
    width: 220,
    height: 220,
    top: -90,
    right: -70,
  },
  blobB: {
    width: 140,
    height: 140,
    bottom: -50,
    left: -40,
    backgroundColor: "rgba(255,255,255,0.06)",
  },
  blobC: {
    width: 80,
    height: 80,
    top: 90,
    right: 70,
    backgroundColor: "rgba(255,255,255,0.05)",
  },
  heroTopRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  heroGreeting: {
    fontFamily: "Inter_500Medium",
    fontSize: 13,
    color: "rgba(255,255,255,0.85)",
    letterSpacing: 0.2,
  },
  heroName: {
    fontFamily: "Inter_700Bold",
    fontSize: 22,
    color: "#ffffff",
    marginTop: 2,
  },
  locChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(255,255,255,0.16)",
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  locDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  locChipText: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 11.5,
    color: "#ffffff",
    letterSpacing: 0.3,
  },
  heroBadge: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    gap: 6,
    backgroundColor: "rgba(255,255,255,0.18)",
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 5,
    marginTop: 22,
  },
  heroBadgeText: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 11,
    color: "#ffffff",
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },
  heroTitle: {
    fontFamily: "Inter_700Bold",
    fontSize: 30,
    lineHeight: 36,
    color: "#ffffff",
    marginTop: 12,
    letterSpacing: -0.4,
  },
  heroSubtitle: {
    fontFamily: "Inter_400Regular",
    fontSize: 14.5,
    lineHeight: 21,
    color: "rgba(255,255,255,0.92)",
    marginTop: 10,
  },
  heroActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginTop: 18,
  },
  heroBtnPrimary: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 11,
    borderRadius: 12,
  },
  heroBtnPrimaryText: {
    fontFamily: "Inter_700Bold",
    fontSize: 14,
  },
  heroBtnGhost: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 11,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.45)",
  },
  heroBtnGhostText: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 14,
    color: "#ffffff",
  },
  statsFloat: {
    paddingHorizontal: 16,
    marginTop: -22,
  },
  statsCard: {
    flexDirection: "row",
    alignItems: "stretch",
    borderWidth: 1,
    paddingVertical: 14,
    paddingHorizontal: 6,
  },
  stat: {
    flex: 1,
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 4,
  },
  statIconWrap: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 2,
  },
  statValue: {
    fontFamily: "Inter_700Bold",
    fontSize: 19,
  },
  statLabel: {
    fontFamily: "Inter_500Medium",
    fontSize: 11,
    textAlign: "center",
  },
  divider: {
    width: 1,
    alignSelf: "stretch",
    opacity: 0.7,
  },
  section: {
    marginTop: 24,
    paddingHorizontal: 16,
    gap: 12,
  },
  cards: {
    gap: 10,
  },
  emptyMini: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 14,
    borderWidth: 1,
  },
  emptyIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyMiniTitle: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 14,
  },
  emptyMiniSub: {
    fontFamily: "Inter_400Regular",
    fontSize: 12.5,
    marginTop: 1,
    lineHeight: 17,
  },
  infoCard: {
    flexDirection: "row",
    gap: 12,
    padding: 14,
    borderWidth: 1,
  },
  infoIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  infoTitle: {
    fontFamily: "Inter_700Bold",
    fontSize: 14.5,
    lineHeight: 20,
  },
  infoBody: {
    fontFamily: "Inter_400Regular",
    fontSize: 13,
    lineHeight: 19,
  },
});
