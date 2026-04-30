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

type Props = {
  eyebrow: string;
  title: string;
  subtitle: string;
  icon: keyof typeof Feather.glyphMap;
  gradient?: [string, string, string];
  children: React.ReactNode;
  onBack?: () => void;
};

export function AuthScaffold({
  eyebrow,
  title,
  subtitle,
  icon,
  gradient,
  children,
  onBack,
}: Props) {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const topPad =
    Platform.OS === "web" ? Math.max(insets.top, 67) : insets.top + 12;
  const heroColors = gradient ?? colors.heroGradient;

  const handleBack = () => {
    if (onBack) return onBack();
    if (router.canGoBack()) router.back();
    else router.replace("/(auth)/welcome");
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <LinearGradient
        colors={heroColors}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.hero, { paddingTop: topPad + 6 }]}
      >
        <View style={styles.heroBlobA} />
        <View style={styles.heroBlobB} />
        <Pressable
          onPress={handleBack}
          hitSlop={10}
          style={({ pressed }) => [
            styles.backBtn,
            { opacity: pressed ? 0.7 : 1 },
          ]}
        >
          <Feather name="arrow-left" size={20} color="#fff" />
        </Pressable>
        <View style={styles.iconBubble}>
          <Feather name={icon} size={22} color="#fff" />
        </View>
        <Text style={styles.eyebrow}>{eyebrow}</Text>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.subtitle}>{subtitle}</Text>
      </LinearGradient>

      <ScrollView
        contentContainerStyle={{
          padding: 18,
          paddingBottom: 48,
        }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View
          style={[
            styles.formCard,
            {
              backgroundColor: colors.card,
              borderColor: colors.border,
              borderRadius: colors.radius,
              ...softShadow(),
            },
          ]}
        >
          {children}
        </View>
      </ScrollView>
    </View>
  );
}

function softShadow() {
  if (Platform.OS === "web") {
    return { boxShadow: "0 12px 28px rgba(3,105,161,0.10)" } as const;
  }
  return {
    shadowColor: "#0369a1",
    shadowOpacity: 0.12,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 8 },
    elevation: 3,
  } as const;
}

const styles = StyleSheet.create({
  hero: {
    paddingHorizontal: 22,
    paddingBottom: 40,
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
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.18)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  iconBubble: {
    width: 46,
    height: 46,
    borderRadius: 14,
    backgroundColor: "rgba(255,255,255,0.18)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14,
  },
  eyebrow: {
    color: "rgba(255,255,255,0.82)",
    fontFamily: "Inter_600SemiBold",
    fontSize: 12,
    letterSpacing: 0.6,
    textTransform: "uppercase",
    marginBottom: 8,
  },
  title: {
    color: "#fff",
    fontFamily: "Inter_700Bold",
    fontSize: 26,
    lineHeight: 32,
    marginBottom: 8,
  },
  subtitle: {
    color: "rgba(255,255,255,0.85)",
    fontFamily: "Inter_400Regular",
    fontSize: 14,
    lineHeight: 20,
  },
  formCard: {
    borderWidth: 1,
    padding: 18,
    marginTop: -22,
  },
});
