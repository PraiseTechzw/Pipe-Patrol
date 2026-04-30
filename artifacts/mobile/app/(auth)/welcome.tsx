import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React from "react";
import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useColors } from "@/hooks/useColors";

type Href = "/(auth)/sign-in" | "/(auth)/staff-sign-in";

export default function WelcomeScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const topPad =
    Platform.OS === "web" ? Math.max(insets.top, 67) : insets.top + 12;

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <LinearGradient
        colors={colors.heroGradient}
        start={colors.heroGradientStart}
        end={colors.heroGradientEnd}
        style={[styles.hero, { paddingTop: topPad + 12 }]}
      >
        <View style={styles.heroBlobA} />
        <View style={styles.heroBlobB} />
        <View style={styles.brandRow}>
          <View style={styles.brandIcon}>
            <Feather name="droplet" size={20} color="#fff" />
          </View>
          <Text style={styles.brandText}>Harare Water</Text>
        </View>
        <Text style={styles.headline}>
          Welcome to the Burst Pipe Reporter
        </Text>
        <Text style={styles.subhead}>
          A simple, fast way for Harare citizens to report burst pipes,
          and for the municipality to triage and resolve them in real
          time.
        </Text>
      </LinearGradient>

      <ScrollView
        contentContainerStyle={{ padding: 18, paddingBottom: 32 }}
        showsVerticalScrollIndicator={false}
      >
        <Text
          style={[
            styles.sectionLabel,
            { color: colors.mutedForeground },
          ]}
        >
          Choose how you'll use the app
        </Text>

        <RoleCard
          icon="user"
          title="I'm a resident"
          subtitle="Report bursts, follow repairs, and stay ahead of disruptions in your area."
          accent={colors.primary}
          accentSoft={colors.infoSoft}
          href="/(auth)/sign-in"
        />

        <RoleCard
          icon="briefcase"
          title="I'm with the municipality"
          subtitle="Triage incoming tickets, dispatch crews, and post service notices."
          accent={colors.accent}
          accentSoft={colors.accentSoft}
          href="/(auth)/staff-sign-in"
        />

        <View
          style={[
            styles.tip,
            {
              backgroundColor: colors.surfaceTint,
              borderColor: colors.border,
              borderRadius: colors.radius,
            },
          ]}
        >
          <Feather name="info" size={14} color={colors.primary} />
          <Text style={[styles.tipText, { color: colors.mutedForeground }]}>
            Demo accounts: resident{" "}
            <Text style={{ fontFamily: "Inter_600SemiBold" }}>
              tendai@example.com
            </Text>
            , municipality{" "}
            <Text style={{ fontFamily: "Inter_600SemiBold" }}>
              chipo@harare.gov.zw
            </Text>
            . Password{" "}
            <Text style={{ fontFamily: "Inter_600SemiBold" }}>password</Text>.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

function RoleCard({
  icon,
  title,
  subtitle,
  accent,
  accentSoft,
  href,
}: {
  icon: keyof typeof Feather.glyphMap;
  title: string;
  subtitle: string;
  accent: string;
  accentSoft: string;
  href: Href;
}) {
  const colors = useColors();
  return (
    <Pressable
      onPress={() => router.push(href)}
      style={({ pressed }) => [
        styles.roleCard,
        {
          backgroundColor: colors.card,
          borderColor: colors.border,
          borderRadius: colors.radius,
          opacity: pressed ? 0.92 : 1,
          ...softShadow(),
        },
      ]}
    >
      <View
        style={[
          styles.roleIconWrap,
          { backgroundColor: accentSoft, borderRadius: 14 },
        ]}
      >
        <Feather name={icon} size={20} color={accent} />
      </View>
      <View style={styles.roleTextWrap}>
        <Text style={[styles.roleTitle, { color: colors.foreground }]}>
          {title}
        </Text>
        <Text style={[styles.roleSubtitle, { color: colors.mutedForeground }]}>
          {subtitle}
        </Text>
      </View>
      <Feather name="chevron-right" size={20} color={colors.mutedForeground} />
    </Pressable>
  );
}

function softShadow() {
  if (Platform.OS === "web") {
    return { boxShadow: "0 8px 24px rgba(3,105,161,0.10)" } as const;
  }
  return {
    shadowColor: "#0369a1",
    shadowOpacity: 0.1,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 6 },
    elevation: 2,
  } as const;
}

const styles = StyleSheet.create({
  hero: {
    paddingHorizontal: 22,
    paddingBottom: 32,
    overflow: "hidden",
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
  },
  heroBlobA: {
    position: "absolute",
    top: -50,
    right: -60,
    width: 220,
    height: 220,
    borderRadius: 220,
    backgroundColor: "rgba(255,255,255,0.10)",
  },
  heroBlobB: {
    position: "absolute",
    bottom: -70,
    left: -40,
    width: 180,
    height: 180,
    borderRadius: 180,
    backgroundColor: "rgba(255,255,255,0.07)",
  },
  brandRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 18,
  },
  brandIcon: {
    width: 34,
    height: 34,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.18)",
    alignItems: "center",
    justifyContent: "center",
  },
  brandText: {
    color: "#fff",
    fontFamily: "Inter_600SemiBold",
    fontSize: 14,
    letterSpacing: 0.4,
  },
  headline: {
    color: "#fff",
    fontFamily: "Inter_700Bold",
    fontSize: 28,
    lineHeight: 34,
    marginBottom: 10,
  },
  subhead: {
    color: "rgba(255,255,255,0.86)",
    fontFamily: "Inter_400Regular",
    fontSize: 14,
    lineHeight: 20,
  },
  sectionLabel: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 12,
    letterSpacing: 0.6,
    textTransform: "uppercase",
    marginTop: 4,
    marginBottom: 12,
  },
  roleCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    padding: 16,
    borderWidth: 1,
    marginBottom: 12,
  },
  roleIconWrap: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
  },
  roleTextWrap: {
    flex: 1,
    minWidth: 0,
  },
  roleTitle: {
    fontFamily: "Inter_700Bold",
    fontSize: 16,
    marginBottom: 2,
  },
  roleSubtitle: {
    fontFamily: "Inter_400Regular",
    fontSize: 13,
    lineHeight: 18,
  },
  tip: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    padding: 12,
    borderWidth: 1,
    marginTop: 16,
  },
  tipText: {
    flex: 1,
    fontFamily: "Inter_400Regular",
    fontSize: 12,
    lineHeight: 17,
  },
});
