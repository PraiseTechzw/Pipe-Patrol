import { Feather } from "@expo/vector-icons";
import { Link, router } from "expo-router";
import React, { useState } from "react";
import { StyleSheet, Text, View } from "react-native";

import { AuthField } from "@/components/AuthField";
import { AuthScaffold } from "@/components/AuthScaffold";
import { PrimaryButton } from "@/components/PrimaryButton";
import { useAuth } from "@/context/AuthContext";
import { useColors } from "@/hooks/useColors";

export default function StaffSignIn() {
  const colors = useColors();
  const { signInStaff } = useAuth();
  const [email, setEmail] = useState("chipo@harare.gov.zw");
  const [password, setPassword] = useState("password");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const onSubmit = async () => {
    setError(null);
    setSubmitting(true);
    try {
      await signInStaff(email, password);
      router.replace("/(tabs)/admin");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Sign-in failed.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthScaffold
      eyebrow="Municipality sign in"
      title="Control room access"
      subtitle="Triage tickets, dispatch crews, and post service notices."
      icon="briefcase"
      gradient={[colors.primaryDeep, colors.primary, colors.accent]}
    >
      <AuthField
        label="Work email"
        value={email}
        onChangeText={setEmail}
        placeholder="you@harare.gov.zw"
        icon="mail"
        autoCapitalize="none"
        keyboardType="email-address"
        autoComplete="email"
        textContentType="emailAddress"
      />
      <AuthField
        label="Password"
        value={password}
        onChangeText={setPassword}
        placeholder="Your password"
        icon="lock"
        secureTextEntry
        autoCapitalize="none"
        autoComplete="password"
        textContentType="password"
      />

      {error ? (
        <View
          style={[
            styles.errorBox,
            {
              backgroundColor: colors.destructiveSoft,
              borderColor: colors.destructive,
              borderRadius: 12,
            },
          ]}
        >
          <Feather name="alert-circle" size={14} color={colors.destructive} />
          <Text style={[styles.errorText, { color: colors.destructive }]}>
            {error}
          </Text>
        </View>
      ) : null}

      <PrimaryButton
        label={submitting ? "Signing in…" : "Sign in"}
        icon="log-in"
        onPress={onSubmit}
        loading={submitting}
        fullWidth
      />

      <View style={styles.footerRow}>
        <Text style={[styles.footerText, { color: colors.mutedForeground }]}>
          Need a staff account?{" "}
        </Text>
        <Link href="/(auth)/staff-sign-up" replace>
          <Text style={[styles.footerLink, { color: colors.primary }]}>
            Register with access code
          </Text>
        </Link>
      </View>

      <View
        style={[
          styles.swapRoleCard,
          {
            backgroundColor: colors.surfaceTint,
            borderColor: colors.border,
            borderRadius: 12,
          },
        ]}
      >
        <Feather name="user" size={14} color={colors.primary} />
        <Text style={[styles.swapText, { color: colors.mutedForeground }]}>
          Looking to report a burst?{" "}
        </Text>
        <Link href="/(auth)/sign-in" replace>
          <Text style={[styles.swapLink, { color: colors.primary }]}>
            Resident sign in
          </Text>
        </Link>
      </View>
    </AuthScaffold>
  );
}

const styles = StyleSheet.create({
  errorBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    padding: 10,
    borderWidth: 1,
    marginBottom: 12,
  },
  errorText: {
    flex: 1,
    fontFamily: "Inter_500Medium",
    fontSize: 13,
  },
  footerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 14,
    flexWrap: "wrap",
  },
  footerText: {
    fontFamily: "Inter_400Regular",
    fontSize: 13,
  },
  footerLink: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 13,
  },
  swapRoleCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    padding: 12,
    borderWidth: 1,
    marginTop: 14,
    flexWrap: "wrap",
  },
  swapText: {
    fontFamily: "Inter_400Regular",
    fontSize: 12,
  },
  swapLink: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 12,
  },
});
