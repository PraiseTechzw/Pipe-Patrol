import { Feather } from "@expo/vector-icons";
import { Link, router } from "expo-router";
import React, { useState } from "react";
import { StyleSheet, Text, View } from "react-native";

import { AuthField } from "@/components/AuthField";
import { AuthScaffold } from "@/components/AuthScaffold";
import { PrimaryButton } from "@/components/PrimaryButton";
import { STAFF_ACCESS_CODE_HINT, useAuth } from "@/context/AuthContext";
import { useColors } from "@/hooks/useColors";

export default function StaffSignUp() {
  const colors = useColors();
  const { signUpStaff } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [staffBadge, setStaffBadge] = useState("");
  const [staffDepartment, setStaffDepartment] = useState(
    "Water & Sewerage Control Room",
  );
  const [accessCode, setAccessCode] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const onSubmit = async () => {
    setError(null);
    setSubmitting(true);
    try {
      await signUpStaff({
        name,
        email,
        staffBadge,
        staffDepartment,
        password,
        accessCode,
      });
      router.replace("/(tabs)/admin");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Sign-up failed.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthScaffold
      eyebrow="Municipality registration"
      title="Register staff account"
      subtitle="Use the access code provided by the control room supervisor."
      icon="shield"
      gradient={[colors.primaryDeep, colors.primary, colors.accent]}
    >
      <View
        style={[
          styles.codeHint,
          {
            backgroundColor: colors.accentSoft,
            borderColor: colors.accent,
            borderRadius: 12,
          },
        ]}
      >
        <Feather name="key" size={14} color={colors.accentForeground} />
        <Text style={[styles.codeHintText, { color: colors.accentForeground }]}>
          Demo access code:{" "}
          <Text style={{ fontFamily: "Inter_700Bold" }}>
            {STAFF_ACCESS_CODE_HINT}
          </Text>
        </Text>
      </View>

      <AuthField
        label="Access code"
        value={accessCode}
        onChangeText={setAccessCode}
        placeholder="Enter staff access code"
        icon="key"
        autoCapitalize="characters"
        autoComplete="off"
      />
      <AuthField
        label="Full name"
        value={name}
        onChangeText={setName}
        placeholder="e.g. Chipo Dube"
        icon="user"
        autoCapitalize="words"
        autoComplete="name"
      />
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
        label="Staff badge"
        value={staffBadge}
        onChangeText={setStaffBadge}
        placeholder="e.g. HW-2041"
        icon="hash"
        autoCapitalize="characters"
      />
      <AuthField
        label="Department"
        value={staffDepartment}
        onChangeText={setStaffDepartment}
        placeholder="Department / unit"
        icon="layers"
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
        label={submitting ? "Creating account…" : "Create staff account"}
        icon="check"
        onPress={onSubmit}
        loading={submitting}
        fullWidth
      />

      <View style={styles.footerRow}>
        <Text style={[styles.footerText, { color: colors.mutedForeground }]}>
          Already registered?{" "}
        </Text>
        <Link href="/(auth)/staff-sign-in" replace>
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
  codeHint: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    padding: 10,
    borderWidth: 1,
    marginBottom: 14,
  },
  codeHintText: {
    flex: 1,
    fontFamily: "Inter_500Medium",
    fontSize: 12,
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
