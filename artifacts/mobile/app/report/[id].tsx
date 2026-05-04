import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import React, { useMemo } from "react";
import {
  Alert,
  Image,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { EmptyState } from "@/components/EmptyState";
import { MapPreviewCard } from "@/components/MapPreviewCard";
import { PrimaryButton } from "@/components/PrimaryButton";
import { SeverityBadge } from "@/components/SeverityBadge";
import { StatusBadge } from "@/components/StatusBadge";
import { StatusTimeline } from "@/components/StatusTimeline";
import { useAuth } from "@/context/AuthContext";
import { useReports } from "@/context/ReportsContext";
import { useColors } from "@/hooks/useColors";
import { STATUS_LABEL, STATUS_ORDER, formatDateTime } from "@/lib/format";
import type { ReportStatus } from "@/types";

export default function ReportDetailScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { reports, advanceStatus } = useReports();
  const { isStaff } = useAuth();

  const report = useMemo(
    () => reports.find((r) => r.id === id),
    [reports, id],
  );

  if (!report) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Stack.Screen options={{ title: "Report" }} />
        <View style={{ paddingTop: insets.top + 40 }}>
          <EmptyState
            icon="alert-circle"
            title="Report not found"
            message="This report may have been removed."
          >
            <PrimaryButton
              label="Back to home"
              icon="arrow-left"
              onPress={() => router.replace("/")}
            />
          </EmptyState>
        </View>
      </View>
    );
  }

  const currentIdx = STATUS_ORDER.indexOf(report.status);
  const nextStatus: ReportStatus | null =
    currentIdx >= 0 && currentIdx < STATUS_ORDER.length - 1
      ? STATUS_ORDER[currentIdx + 1] ?? null
      : null;

  const onAdvance = async () => {
    if (!nextStatus) return;
    const note = `Updated to ${STATUS_LABEL[nextStatus]} by control room`;
    await advanceStatus(report.id, nextStatus, note);
    if (Platform.OS === "web" && typeof window !== "undefined") {
      // no toast on web; the screen updates immediately
    }
  };

  const onReopen = () => {
    const doReopen = async () => {
      await advanceStatus(
        report.id,
        "in_progress",
        "Reopened — issue persists",
      );
    };
    if (Platform.OS === "web") {
      if (
        typeof window !== "undefined" &&
        window.confirm("Reopen this report?")
      ) {
        void doReopen();
      }
      return;
    }
    Alert.alert("Reopen report?", "It will move back to crew dispatched.", [
      { text: "Cancel", style: "cancel" },
      { text: "Reopen", onPress: () => void doReopen() },
    ]);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Stack.Screen options={{ title: report.ticketId }} />
      <ScrollView
        contentContainerStyle={{
          paddingBottom: 60 + insets.bottom,
        }}
      >
        <View
          style={[
            styles.headerCard,
            {
              backgroundColor: colors.card,
              borderColor: colors.border,
              borderRadius: colors.radius,
              margin: 16,
            },
          ]}
        >
          <View style={styles.headerRow}>
            <View style={{ flex: 1 }}>
              <Text style={[styles.ticketLabel, { color: colors.mutedForeground }]}>
                Ticket
              </Text>
              <Text style={[styles.ticketId, { color: colors.foreground }]}>
                {report.ticketId}
              </Text>
            </View>
            <StatusBadge status={report.status} />
          </View>

          <View style={styles.metaInline}>
            <SeverityBadge severity={report.severity} size="sm" />
            <Text style={[styles.metaInlineText, { color: colors.mutedForeground }]}>
              Reported {formatDateTime(report.createdAt)} · {report.reporterName}
            </Text>
          </View>

          <Text style={[styles.description, { color: colors.foreground }]}>
            {report.description}
          </Text>

          {report.imageUri ? (
            <Image
              source={{ uri: report.imageUri }}
              style={styles.image}
              resizeMode="cover"
            />
          ) : null}
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
            Location
          </Text>
          <MapPreviewCard
            latitude={report.location.latitude}
            longitude={report.location.longitude}
            address={report.location.address}
          />
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
            Repair progress
          </Text>
          <View
            style={[
              styles.timelineCard,
              {
                backgroundColor: colors.card,
                borderColor: colors.border,
                borderRadius: colors.radius,
              },
            ]}
          >
            <StatusTimeline report={report} />
          </View>
        </View>

        <View style={[styles.section, { marginBottom: 8 }]}>
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
            {isStaff ? "Update status" : "Municipal updates"}
          </Text>
          <View
            style={[
              styles.actionsCard,
              {
                backgroundColor: colors.card,
                borderColor: colors.border,
                borderRadius: colors.radius,
              },
            ]}
          >
            <Text style={[styles.actionsHint, { color: colors.mutedForeground }]}>
              {isStaff
                ? "Move the ticket through its repair lifecycle."
                : "This ticket updates as the control room acknowledges, dispatches, and resolves the repair."}
            </Text>
            {isStaff ? (
              <View style={styles.actionsRow}>
                {nextStatus ? (
                  <PrimaryButton
                    label={`Mark as ${STATUS_LABEL[nextStatus]}`}
                    icon="arrow-right"
                    onPress={onAdvance}
                  />
                ) : (
                  <PrimaryButton
                    label="Reopen"
                    icon="rotate-ccw"
                    variant="ghost"
                    onPress={onReopen}
                  />
                )}
              </View>
            ) : null}
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
  headerCard: {
    borderWidth: 1,
    padding: 16,
    gap: 12,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
  },
  ticketLabel: {
    fontFamily: "Inter_500Medium",
    fontSize: 11,
    letterSpacing: 0.6,
    textTransform: "uppercase",
  },
  ticketId: {
    fontFamily: "Inter_700Bold",
    fontSize: 18,
    letterSpacing: 0.4,
    marginTop: 2,
  },
  metaInline: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    gap: 8,
  },
  metaInlineText: {
    fontFamily: "Inter_400Regular",
    fontSize: 12.5,
    flexShrink: 1,
  },
  description: {
    fontFamily: "Inter_500Medium",
    fontSize: 16,
    lineHeight: 24,
  },
  image: {
    width: "100%",
    aspectRatio: 16 / 10,
    borderRadius: 10,
  },
  section: {
    marginHorizontal: 16,
    marginTop: 8,
    marginBottom: 12,
    gap: 10,
  },
  sectionTitle: {
    fontFamily: "Inter_700Bold",
    fontSize: 16,
  },
  timelineCard: {
    borderWidth: 1,
    padding: 16,
  },
  actionsCard: {
    borderWidth: 1,
    padding: 14,
    gap: 10,
  },
  actionsHint: {
    fontFamily: "Inter_400Regular",
    fontSize: 13,
    lineHeight: 19,
  },
  actionsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
});
