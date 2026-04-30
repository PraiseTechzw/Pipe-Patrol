import { Feather } from "@expo/vector-icons";
import { Link, router } from "expo-router";
import React, { useState } from "react";
import { StyleSheet, Text, View } from "react-native";

import { AuthField } from "@/components/AuthField";
import { AuthScaffold } from "@/components/AuthScaffold";
import { PrimaryButton } from "@/components/PrimaryButton";
import { useAuth } from "@/context/AuthContext";
import { useColors } from "@/hooks/useColors";

export default function ResidentSignIn() {
  const colors = useColors();
  const { signInResident } = useAuth();
  const [email, setEmail] = useState("tendai@example.com");
  const [password, setPassword] = useState("password");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const onSubmit = async () => {
    setError(null);
    setSubmitting(true);
    try {
      await signInResident(email, password);
      router.replace("/(tabs)");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Sign-in failed.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthScaffold
      eyebrow="Resident sign in"
      title="Welcome back"
      subtitle="Sign in to report new bursts and follow your tickets."
      icon="user"
    >
      <AuthField
        label="Email"
        value={email}
        onChangeText={setEmail}
        placeholder="you@example.com"
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
          New to Harare Water?{" "}
        </Text>
        <Link href="/(auth)/sign-up" replace>
          <Text style={[styles.footerLink, { color: colors.primary }]}>
            Create an account
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
        <Feather name="briefcase" size={14} color={colors.accent} />
        <Text style={[styles.swapText, { color: colors.mutedForeground }]}>
          Municipality staff?{" "}
        </Text>
        <Link href="/(auth)/staff-sign-in" replace>
          <Text style={[styles.swapLink, { color: colors.primary }]}>
            Sign in here
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
