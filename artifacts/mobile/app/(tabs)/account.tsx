import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { AuthField } from "@/components/AuthField";
import { PrimaryButton } from "@/components/PrimaryButton";
import { useAuth } from "@/context/AuthContext";
import { useReports } from "@/context/ReportsContext";
import { useColors } from "@/hooks/useColors";

export default function AccountScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { user, signOut, updateProfile, isStaff } = useAuth();
  const { reports, drafts, resetSampleData } = useReports();
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(user?.name ?? "");
  const [phone, setPhone] = useState(user?.phone ?? "");
  const [suburb, setSuburb] = useState(user?.suburb ?? "");
  const [department, setDepartment] = useState(user?.staffDepartment ?? "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const heroPad =
    Platform.OS === "web" ? Math.max(insets.top, 67) : insets.top + 12;

  const myReportsCount = reports.filter(
    (r) =>
      r.reporterName.toLowerCase() === (user?.name ?? "").toLowerCase() ||
      (!isStaff && r.reporterName === "You"),
  ).length;
  const resolvedCount = reports.filter((r) => r.status === "resolved").length;
  const inProgressCount = reports.filter(
    (r) => r.status === "in_progress" || r.status === "acknowledged",
  ).length;

  const heroColors: [string, string, string] = isStaff
    ? [colors.primaryDeep, colors.primary, colors.accent]
    : colors.heroGradient;

  const handleSave = async () => {
    setError(null);
    setSaving(true);
    try {
      await updateProfile(
        isStaff
          ? { name: name.trim(), staffDepartment: department.trim() }
          : { name: name.trim(), phone: phone.trim(), suburb: suburb.trim() },
      );
      setEditing(false);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Couldn't save changes.");
    } finally {
      setSaving(false);
    }
  };

  const confirmSignOut = () => {
    if (Platform.OS === "web") {
      if (typeof window !== "undefined" && !window.confirm("Sign out of Harare Water?"))
        return;
      void signOut().then(() => router.replace("/(auth)/welcome"));
      return;
    }
    Alert.alert("Sign out", "Are you sure you want to sign out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Sign out",
        style: "destructive",
        onPress: async () => {
          await signOut();
          router.replace("/(auth)/welcome");
        },
      },
    ]);
  };

  const confirmReset = () => {
    if (Platform.OS === "web") {
      if (typeof window !== "undefined" && !window.confirm("Reset all sample data?"))
        return;
      void resetSampleData();
      return;
    }
    Alert.alert(
      "Reset sample data",
      "This restores sample reports and notices and clears drafts. Continue?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Reset",
          style: "destructive",
          onPress: () => {
            void resetSampleData();
          },
        },
      ],
    );
  };

  if (!user) return null;

  const initials = user.name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0])
    .join("")
    .toUpperCase();

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView
        contentContainerStyle={{ paddingBottom: 120 }}
        showsVerticalScrollIndicator={false}
      >
        <LinearGradient
          colors={heroColors}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.hero, { paddingTop: heroPad + 18 }]}
        >
          <View style={styles.heroBlobA} />
          <View style={styles.heroBlobB} />
          <View style={styles.rolePill}>
            <Feather
              name={isStaff ? "briefcase" : "user"}
              size={12}
              color="#fff"
            />
            <Text style={styles.rolePillText}>
              {isStaff ? "Municipality" : "Resident"}
            </Text>
          </View>
          <View style={styles.profileRow}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{initials || "?"}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.profileName}>{user.name}</Text>
              <Text style={styles.profileEmail}>{user.email}</Text>
              {isStaff && user.staffBadge ? (
                <View style={styles.badgeChip}>
                  <Feather name="hash" size={10} color="#fff" />
                  <Text style={styles.badgeChipText}>{user.staffBadge}</Text>
                </View>
              ) : null}
            </View>
          </View>
        </LinearGradient>

        <View style={styles.statsRow}>
          {isStaff ? (
            <>
              <StatTile
                label="Open"
                value={inProgressCount + reports.filter((r) => r.status === "submitted").length}
                icon="inbox"
                color={colors.primary}
              />
              <StatTile
                label="In progress"
                value={inProgressCount}
                icon="loader"
                color={colors.accent}
              />
              <StatTile
                label="Resolved"
                value={resolvedCount}
                icon="check-circle"
                color={colors.success}
              />
            </>
          ) : (
            <>
              <StatTile
                label="My reports"
                value={myReportsCount}
                icon="file-text"
                color={colors.primary}
              />
              <StatTile
                label="Drafts"
                value={drafts.length}
                icon="edit-3"
                color={colors.accent}
              />
              <StatTile
                label="Resolved"
                value={resolvedCount}
                icon="check-circle"
                color={colors.success}
              />
            </>
          )}
        </View>

        <View style={{ paddingHorizontal: 18 }}>
          <SectionLabel>Profile</SectionLabel>
          <View
            style={[
              styles.card,
              {
                backgroundColor: colors.card,
                borderColor: colors.border,
                borderRadius: colors.radius,
              },
            ]}
          >
            {editing ? (
              <>
                <AuthField
                  label="Full name"
                  value={name}
                  onChangeText={setName}
                  icon="user"
                  autoCapitalize="words"
                />
                {isStaff ? (
                  <AuthField
                    label="Department"
                    value={department}
                    onChangeText={setDepartment}
                    icon="layers"
                    autoCapitalize="words"
                  />
                ) : (
                  <>
                    <AuthField
                      label="Phone"
                      value={phone}
                      onChangeText={setPhone}
                      icon="phone"
                      keyboardType="phone-pad"
                      autoCapitalize="none"
                    />
                    <AuthField
                      label="Suburb"
                      value={suburb}
                      onChangeText={setSuburb}
                      icon="map-pin"
                      autoCapitalize="words"
                    />
                  </>
                )}
                {error ? (
                  <Text style={[styles.errorText, { color: colors.destructive }]}>
                    {error}
                  </Text>
                ) : null}
                <View style={{ flexDirection: "row", gap: 10 }}>
                  <PrimaryButton
                    label="Cancel"
                    variant="ghost"
                    onPress={() => {
                      setEditing(false);
                      setName(user.name);
                      setPhone(user.phone ?? "");
                      setSuburb(user.suburb ?? "");
                      setDepartment(user.staffDepartment ?? "");
                      setError(null);
                    }}
                  />
                  <PrimaryButton
                    label={saving ? "Saving…" : "Save"}
                    icon="check"
                    onPress={handleSave}
                    loading={saving}
                  />
                </View>
              </>
            ) : (
              <>
                <ProfileRow icon="user" label="Name" value={user.name} />
                <ProfileRow icon="mail" label="Email" value={user.email} />
                {isStaff ? (
                  <>
                    <ProfileRow
                      icon="hash"
                      label="Badge"
                      value={user.staffBadge ?? "—"}
                    />
                    <ProfileRow
                      icon="layers"
                      label="Department"
                      value={user.staffDepartment ?? "—"}
                      isLast
                    />
                  </>
                ) : (
                  <>
                    <ProfileRow
                      icon="phone"
                      label="Phone"
                      value={user.phone || "Not set"}
                    />
                    <ProfileRow
                      icon="map-pin"
                      label="Suburb"
                      value={user.suburb || "Not set"}
                      isLast
                    />
                  </>
                )}
                <PrimaryButton
                  label="Edit profile"
                  icon="edit-2"
                  variant="secondary"
                  onPress={() => setEditing(true)}
                  fullWidth
                />
              </>
            )}
          </View>

          <SectionLabel>Settings</SectionLabel>
          <View
            style={[
              styles.card,
              {
                backgroundColor: colors.card,
                borderColor: colors.border,
                borderRadius: colors.radius,
                padding: 0,
                overflow: "hidden",
              },
            ]}
          >
            <SettingRow
              icon="rotate-ccw"
              label="Reset sample data"
              hint="Restore sample reports and notices"
              onPress={confirmReset}
            />
            <SettingRow
              icon="log-out"
              label="Sign out"
              hint={`Signed in as ${user.email}`}
              destructive
              onPress={confirmSignOut}
              isLast
            />
          </View>

          <Text style={[styles.versionText, { color: colors.mutedForeground }]}>
            Harare Burst Pipe Reporter · v1.0
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

function StatTile({
  label,
  value,
  icon,
  color,
}: {
  label: string;
  value: number;
  icon: keyof typeof Feather.glyphMap;
  color: string;
}) {
  const colors = useColors();
  return (
    <View
      style={[
        styles.statTile,
        {
          backgroundColor: colors.card,
          borderColor: colors.border,
          borderRadius: colors.radius,
          ...softShadow(),
        },
      ]}
    >
      <View
        style={[styles.statIconWrap, { backgroundColor: color + "1a" }]}
      >
        <Feather name={icon} size={14} color={color} />
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

function ProfileRow({
  icon,
  label,
  value,
  isLast,
}: {
  icon: keyof typeof Feather.glyphMap;
  label: string;
  value: string;
  isLast?: boolean;
}) {
  const colors = useColors();
  return (
    <View
      style={[
        styles.profileRowItem,
        !isLast && { borderBottomWidth: 1, borderBottomColor: colors.border },
      ]}
    >
      <View
        style={[
          styles.profileIconWrap,
          { backgroundColor: colors.surfaceTint, borderRadius: 10 },
        ]}
      >
        <Feather name={icon} size={14} color={colors.primary} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={[styles.profileLabel, { color: colors.mutedForeground }]}>
          {label}
        </Text>
        <Text style={[styles.profileValue, { color: colors.foreground }]}>
          {value}
        </Text>
      </View>
    </View>
  );
}

function SettingRow({
  icon,
  label,
  hint,
  onPress,
  destructive,
  isLast,
}: {
  icon: keyof typeof Feather.glyphMap;
  label: string;
  hint?: string;
  onPress: () => void;
  destructive?: boolean;
  isLast?: boolean;
}) {
  const colors = useColors();
  const tint = destructive ? colors.destructive : colors.primary;
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.settingRow,
        !isLast && {
          borderBottomWidth: 1,
          borderBottomColor: colors.border,
        },
        { opacity: pressed ? 0.7 : 1 },
      ]}
    >
      <View
        style={[
          styles.settingIconWrap,
          {
            backgroundColor: destructive ? colors.destructiveSoft : colors.surfaceTint,
            borderRadius: 10,
          },
        ]}
      >
        <Feather name={icon} size={15} color={tint} />
      </View>
      <View style={{ flex: 1 }}>
        <Text
          style={[
            styles.settingLabel,
            { color: destructive ? colors.destructive : colors.foreground },
          ]}
        >
          {label}
        </Text>
        {hint ? (
          <Text style={[styles.settingHint, { color: colors.mutedForeground }]}>
            {hint}
          </Text>
        ) : null}
      </View>
      <Feather name="chevron-right" size={18} color={colors.mutedForeground} />
    </Pressable>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  const colors = useColors();
  return (
    <Text
      style={[
        styles.sectionLabel,
        { color: colors.mutedForeground },
      ]}
    >
      {children}
    </Text>
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
    paddingBottom: 56,
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
  rolePill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.18)",
    marginBottom: 14,
  },
  rolePillText: {
    color: "#fff",
    fontFamily: "Inter_600SemiBold",
    fontSize: 11,
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },
  profileRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.22)",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.35)",
  },
  avatarText: {
    color: "#fff",
    fontFamily: "Inter_700Bold",
    fontSize: 22,
  },
  profileName: {
    color: "#fff",
    fontFamily: "Inter_700Bold",
    fontSize: 19,
    marginBottom: 2,
  },
  profileEmail: {
    color: "rgba(255,255,255,0.85)",
    fontFamily: "Inter_400Regular",
    fontSize: 13,
  },
  badgeChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.18)",
    alignSelf: "flex-start",
    marginTop: 6,
  },
  badgeChipText: {
    color: "#fff",
    fontFamily: "Inter_600SemiBold",
    fontSize: 11,
  },
  statsRow: {
    flexDirection: "row",
    gap: 10,
    paddingHorizontal: 18,
    marginTop: -32,
    marginBottom: 8,
  },
  statTile: {
    flex: 1,
    padding: 14,
    borderWidth: 1,
    alignItems: "flex-start",
  },
  statIconWrap: {
    width: 28,
    height: 28,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  statValue: {
    fontFamily: "Inter_700Bold",
    fontSize: 22,
    lineHeight: 26,
  },
  statLabel: {
    fontFamily: "Inter_500Medium",
    fontSize: 11,
    marginTop: 2,
  },
  sectionLabel: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 12,
    letterSpacing: 0.6,
    textTransform: "uppercase",
    marginTop: 18,
    marginBottom: 10,
  },
  card: {
    padding: 16,
    borderWidth: 1,
  },
  profileRowItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 12,
  },
  profileIconWrap: {
    width: 32,
    height: 32,
    alignItems: "center",
    justifyContent: "center",
  },
  profileLabel: {
    fontFamily: "Inter_500Medium",
    fontSize: 11,
    letterSpacing: 0.4,
    textTransform: "uppercase",
    marginBottom: 2,
  },
  profileValue: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 14,
  },
  settingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 14,
  },
  settingIconWrap: {
    width: 34,
    height: 34,
    alignItems: "center",
    justifyContent: "center",
  },
  settingLabel: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 14,
  },
  settingHint: {
    fontFamily: "Inter_400Regular",
    fontSize: 12,
    marginTop: 2,
  },
  errorText: {
    fontFamily: "Inter_500Medium",
    fontSize: 13,
    marginBottom: 10,
  },
  versionText: {
    fontFamily: "Inter_400Regular",
    fontSize: 11,
    textAlign: "center",
    marginTop: 24,
  },
});
