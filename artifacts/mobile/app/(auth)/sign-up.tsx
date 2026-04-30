import { Feather } from "@expo/vector-icons";
import { Link, router } from "expo-router";
import React, { useState } from "react";
import { StyleSheet, Text, View } from "react-native";

import { AuthField } from "@/components/AuthField";
import { AuthScaffold } from "@/components/AuthScaffold";
import { PrimaryButton } from "@/components/PrimaryButton";
import { useAuth } from "@/context/AuthContext";
import { useColors } from "@/hooks/useColors";

export default function ResidentSignUp() {
  const colors = useColors();
  const { signUpResident } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [suburb, setSuburb] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const onSubmit = async () => {
    setError(null);
    setSubmitting(true);
    try {
      await signUpResident({ name, email, phone, suburb, password });
      router.replace("/(tabs)");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Sign-up failed.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthScaffold
      eyebrow="Create resident account"
      title="Join your community"
      subtitle="Help your neighbourhood by reporting bursts and tracking repairs."
      icon="user-plus"
    >
      <AuthField
        label="Full name"
        value={name}
        onChangeText={setName}
        placeholder="e.g. Tendai Moyo"
        icon="user"
        autoCapitalize="words"
        autoComplete="name"
        textContentType="name"
      />
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
        label="Phone (optional)"
        value={phone}
        onChangeText={setPhone}
        placeholder="+263 77 000 0000"
        icon="phone"
        keyboardType="phone-pad"
        autoCapitalize="none"
        autoComplete="tel"
        textContentType="telephoneNumber"
      />
      <AuthField
        label="Suburb (optional)"
        value={suburb}
        onChangeText={setSuburb}
        placeholder="e.g. Avondale"
        icon="map-pin"
        autoCapitalize="words"
      />
      <AuthField
        label="Password"
        value={password}
        onChangeText={setPassword}
        placeholder="At least 6 characters"
        icon="lock"
        secureTextEntry
        autoCapitalize="none"
        autoComplete="new-password"
        textContentType="newPassword"
        hint="Used only for this device — no data leaves the app."
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
        label={submitting ? "Creating account…" : "Create account"}
        icon="check"
        onPress={onSubmit}
        loading={submitting}
        fullWidth
      />

      <View style={styles.footerRow}>
        <Text style={[styles.footerText, { color: colors.mutedForeground }]}>
          Already have an account?{" "}
        </Text>
        <Link href="/(auth)/sign-in" replace>
          <Text style={[styles.footerLink, { color: colors.primary }]}>
            Sign in
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
});
