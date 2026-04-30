import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import { Platform, StyleSheet, Text, View } from "react-native";

import { useColors } from "@/hooks/useColors";
import { formatCoords } from "@/lib/format";

type Props = {
  latitude: number | null;
  longitude: number | null;
  address?: string;
  label?: string;
  height?: number;
};

const PIN_INNER_OFFSET = 1;

export function MapPreviewCard({
  latitude,
  longitude,
  address,
  label = "Reported location",
  height = 130,
}: Props) {
  const colors = useColors();
  const hasCoords = latitude !== null && longitude !== null;

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors.card,
          borderColor: colors.border,
          borderRadius: colors.radius,
          ...softShadow(),
        },
      ]}
    >
      <View style={[styles.mapWrap, { height }]}>
        <LinearGradient
          colors={["#dbeafe", "#cffafe", "#e0f7fa"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFillObject}
        />
        {/* Grid lines to mimic a map tile */}
        <View pointerEvents="none" style={StyleSheet.absoluteFillObject}>
          {[0, 1, 2, 3, 4].map((i) => (
            <View
              key={`h-${i}`}
              style={[
                styles.gridLineH,
                { top: `${(i + 1) * 16}%`, backgroundColor: "#ffffff60" },
              ]}
            />
          ))}
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <View
              key={`v-${i}`}
              style={[
                styles.gridLineV,
                { left: `${(i + 1) * 14}%`, backgroundColor: "#ffffff60" },
              ]}
            />
          ))}
          {/* Curved water route */}
          <View
            style={[
              styles.waterRoute,
              { backgroundColor: colors.accent + "55" },
            ]}
          />
          <View
            style={[
              styles.waterRouteAlt,
              { backgroundColor: colors.primary + "33" },
            ]}
          />
        </View>

        {/* Center pin */}
        <View style={styles.pinWrap} pointerEvents="none">
          <View
            style={[
              styles.pinPulse,
              { backgroundColor: colors.primary + "33" },
            ]}
          />
          <View
            style={[styles.pinOuter, { backgroundColor: colors.primary }]}
          >
            <View
              style={[
                styles.pinInner,
                {
                  backgroundColor: "#ffffff",
                  marginTop: PIN_INNER_OFFSET,
                },
              ]}
            />
          </View>
        </View>

        {/* Top-right chip */}
        <View
          style={[
            styles.topChip,
            {
              backgroundColor: hasCoords
                ? "#ffffffee"
                : colors.warningSoft + "ee",
            },
          ]}
        >
          <Feather
            name={hasCoords ? "crosshair" : "edit-3"}
            size={11}
            color={hasCoords ? colors.primary : "#7c4a03"}
          />
          <Text
            style={[
              styles.topChipText,
              { color: hasCoords ? colors.primary : "#7c4a03" },
            ]}
          >
            {hasCoords ? "GPS pinned" : "Manual entry"}
          </Text>
        </View>
      </View>

      <View style={styles.footer}>
        <View style={styles.footerHead}>
          <Feather name="map-pin" size={13} color={colors.primary} />
          <Text style={[styles.footerLabel, { color: colors.mutedForeground }]}>
            {label}
          </Text>
        </View>
        <Text
          style={[styles.address, { color: colors.foreground }]}
          numberOfLines={2}
        >
          {address && address.trim()
            ? address
            : hasCoords
              ? "Pinned coordinates only"
              : "Location not set"}
        </Text>
        <Text style={[styles.coords, { color: colors.mutedForeground }]}>
          {formatCoords(latitude, longitude)}
        </Text>
      </View>
    </View>
  );
}

function softShadow() {
  if (Platform.OS === "web") {
    return {
      boxShadow: "0 6px 18px -10px rgba(3, 105, 161, 0.25)",
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
    borderWidth: 1,
    overflow: "hidden",
  },
  mapWrap: {
    width: "100%",
    overflow: "hidden",
    position: "relative",
  },
  gridLineH: {
    position: "absolute",
    left: 0,
    right: 0,
    height: 1,
  },
  gridLineV: {
    position: "absolute",
    top: 0,
    bottom: 0,
    width: 1,
  },
  waterRoute: {
    position: "absolute",
    height: 3,
    left: "-10%",
    right: "55%",
    top: "62%",
    transform: [{ rotate: "-12deg" }],
    borderRadius: 2,
  },
  waterRouteAlt: {
    position: "absolute",
    height: 3,
    left: "30%",
    right: "-10%",
    top: "30%",
    transform: [{ rotate: "10deg" }],
    borderRadius: 2,
  },
  pinWrap: {
    position: "absolute",
    top: "50%",
    left: "50%",
    width: 38,
    height: 38,
    marginLeft: -19,
    marginTop: -19,
    alignItems: "center",
    justifyContent: "center",
  },
  pinPulse: {
    position: "absolute",
    width: 38,
    height: 38,
    borderRadius: 19,
  },
  pinOuter: {
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 3,
    borderColor: "#ffffff",
  },
  pinInner: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  topChip: {
    position: "absolute",
    top: 10,
    right: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
  },
  topChipText: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 10.5,
    letterSpacing: 0.3,
  },
  footer: {
    padding: 14,
    gap: 4,
  },
  footerHead: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  footerLabel: {
    fontFamily: "Inter_500Medium",
    fontSize: 11,
    letterSpacing: 0.6,
    textTransform: "uppercase",
  },
  address: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 14.5,
    lineHeight: 20,
  },
  coords: {
    fontFamily: "Inter_400Regular",
    fontSize: 12,
  },
});
