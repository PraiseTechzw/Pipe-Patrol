import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import * as ImagePicker from "expo-image-picker";
import * as Location from "expo-location";
import { useRouter } from "expo-router";
import React, { useCallback, useMemo, useState } from "react";
import {
  Alert,
  Image,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { EmptyState } from "@/components/EmptyState";
import { KeyboardAwareScrollViewCompat } from "@/components/KeyboardAwareScrollViewCompat";
import { MapPreviewCard } from "@/components/MapPreviewCard";
import { PrimaryButton } from "@/components/PrimaryButton";
import { useReports } from "@/context/ReportsContext";
import { useColors } from "@/hooks/useColors";
import { SEVERITY_LABEL, formatCoords, formatRelative } from "@/lib/format";
import type { Draft, LocationInfo, Severity } from "@/types";

type Mode = "form" | "drafts";

const SEVERITIES: Severity[] = ["low", "medium", "high"];

const EMPTY_LOCATION: LocationInfo = {
  latitude: null,
  longitude: null,
  address: "",
};

export default function ReportScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const {
    drafts,
    submitReport,
    saveDraft,
    deleteDraft,
    reporterName,
    setReporterName,
  } = useReports();

  const [mode, setMode] = useState<Mode>("form");

  const [editingDraftId, setEditingDraftId] = useState<string | null>(null);
  const [description, setDescription] = useState("");
  const [severity, setSeverity] = useState<Severity>("medium");
  const [location, setLocation] = useState<LocationInfo>(EMPTY_LOCATION);
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [name, setName] = useState(reporterName);

  const [gpsLoading, setGpsLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [savingDraft, setSavingDraft] = useState(false);
  const [submittedTicket, setSubmittedTicket] = useState<string | null>(null);

  const resetForm = useCallback(() => {
    setEditingDraftId(null);
    setDescription("");
    setSeverity("medium");
    setLocation(EMPTY_LOCATION);
    setImageUri(null);
    setSubmittedTicket(null);
  }, []);

  const captureGps = useCallback(async () => {
    setGpsLoading(true);
    try {
      if (Platform.OS === "web") {
        if (typeof navigator !== "undefined" && navigator.geolocation) {
          await new Promise<void>((resolve) => {
            navigator.geolocation.getCurrentPosition(
              (pos) => {
                setLocation((prev) => ({
                  ...prev,
                  latitude: pos.coords.latitude,
                  longitude: pos.coords.longitude,
                }));
                resolve();
              },
              () => {
                Alert.alert(
                  "Location unavailable",
                  "We couldn't get your location. Enable GPS in your browser or enter the address manually.",
                );
                resolve();
              },
              { enableHighAccuracy: true, timeout: 10000 },
            );
          });
        }
        return;
      }

      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Location permission needed",
          "Allow location access so we can pin the burst pipe accurately. You can also enter the address manually below.",
        );
        return;
      }
      const pos = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });
      setLocation((prev) => ({
        ...prev,
        latitude: pos.coords.latitude,
        longitude: pos.coords.longitude,
      }));
      try {
        const places = await Location.reverseGeocodeAsync({
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
        });
        if (places.length > 0 && !location.address) {
          const p = places[0];
          if (!p) return;
          const street = [p.name, p.street].filter(Boolean).join(" ");
          const city = [p.city, p.region].filter(Boolean).join(", ");
          const composed = [street, city].filter(Boolean).join(", ");
          if (composed) {
            setLocation((prev) => ({ ...prev, address: composed }));
          }
        }
      } catch {
        // reverse geocode is best-effort
      }
    } finally {
      setGpsLoading(false);
    }
  }, [location.address]);

  const pickImage = useCallback(async () => {
    const camPerm = await ImagePicker.requestCameraPermissionsAsync();
    const useCamera =
      camPerm.status === "granted" && Platform.OS !== "web";

    const result = useCamera
      ? await ImagePicker.launchCameraAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          allowsEditing: false,
          quality: 0.6,
        })
      : await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          allowsEditing: false,
          quality: 0.6,
        });
    if (!result.canceled && result.assets[0]) {
      setImageUri(result.assets[0].uri);
    }
  }, []);

  const isValid = description.trim().length >= 8 &&
    (location.latitude !== null || location.address.trim().length >= 4);

  const onSubmit = useCallback(async () => {
    if (!isValid || submitting) return;
    setSubmitting(true);
    try {
      if (name.trim() && name.trim() !== reporterName) {
        await setReporterName(name.trim());
      }
      const report = await submitReport({
        description,
        severity,
        location,
        imageUri,
        reporterName: name,
        fromDraftId: editingDraftId ?? undefined,
      });
      if (Platform.OS !== "web") {
        Haptics.notificationAsync(
          Haptics.NotificationFeedbackType.Success,
        ).catch(() => {});
      }
      setSubmittedTicket(report.ticketId);
      resetForm();
    } finally {
      setSubmitting(false);
    }
  }, [
    description,
    severity,
    location,
    imageUri,
    name,
    reporterName,
    editingDraftId,
    isValid,
    submitting,
    submitReport,
    setReporterName,
    resetForm,
  ]);

  const onSaveDraft = useCallback(async () => {
    if (savingDraft) return;
    if (
      !description.trim() &&
      !location.address.trim() &&
      location.latitude === null &&
      !imageUri
    ) {
      Alert.alert("Nothing to save", "Add a description, location, or photo first.");
      return;
    }
    setSavingDraft(true);
    try {
      const draft = await saveDraft({
        id: editingDraftId ?? undefined,
        description,
        severity,
        location,
        imageUri,
        reporterName: name,
      });
      setEditingDraftId(draft.id);
      if (Platform.OS !== "web") {
        Haptics.selectionAsync().catch(() => {});
      }
      Alert.alert("Draft saved", "You can finish and submit this report later.");
    } finally {
      setSavingDraft(false);
    }
  }, [
    description,
    severity,
    location,
    imageUri,
    name,
    editingDraftId,
    savingDraft,
    saveDraft,
  ]);

  const onLoadDraft = useCallback((draft: Draft) => {
    setEditingDraftId(draft.id);
    setDescription(draft.description);
    setSeverity(draft.severity);
    setLocation(draft.location);
    setImageUri(draft.imageUri);
    setName(draft.reporterName);
    setSubmittedTicket(null);
    setMode("form");
  }, []);

  const onDeleteDraft = useCallback(
    (draft: Draft) => {
      const remove = async () => {
        await deleteDraft(draft.id);
        if (editingDraftId === draft.id) {
          resetForm();
        }
      };
      if (Platform.OS === "web") {
        if (typeof window !== "undefined" && window.confirm("Delete this draft?")) {
          void remove();
        }
        return;
      }
      Alert.alert("Delete draft?", "This cannot be undone.", [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            void remove();
          },
        },
      ]);
    },
    [deleteDraft, editingDraftId, resetForm],
  );

  const heroPad = Platform.OS === "web" ? Math.max(insets.top, 67) : insets.top;

  const headerSubtitle = useMemo(() => {
    if (editingDraftId) return "Editing a saved draft";
    return "Tag the burst, snap a photo, send it in.";
  }, [editingDraftId]);

  if (submittedTicket) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <ScrollView
          contentContainerStyle={{
            paddingTop: heroPad + 24,
            paddingHorizontal: 20,
            paddingBottom: 120,
          }}
        >
          <View
            style={[
              styles.successCard,
              {
                backgroundColor: colors.card,
                borderColor: colors.border,
                borderRadius: colors.radius + 4,
              },
            ]}
          >
            <View style={[styles.successIcon, { backgroundColor: "#dcfce7" }]}>
              <Feather name="check" size={28} color="#15803d" />
            </View>
            <Text style={[styles.successTitle, { color: colors.foreground }]}>
              Report submitted
            </Text>
            <Text
              style={[styles.successBody, { color: colors.mutedForeground }]}
            >
              Your ticket has been logged with the municipal control room.
              Crews will be assigned based on severity and location.
            </Text>
            <View
              style={[
                styles.ticketBox,
                { backgroundColor: colors.muted, borderRadius: 12 },
              ]}
            >
              <Text style={[styles.ticketLabel, { color: colors.mutedForeground }]}>
                Ticket
              </Text>
              <Text style={[styles.ticketId, { color: colors.foreground }]}>
                {submittedTicket}
              </Text>
            </View>
            <View style={styles.successActions}>
              <PrimaryButton
                label="Track this report"
                icon="activity"
                onPress={() => {
                  router.push("/");
                }}
              />
              <PrimaryButton
                label="Submit another"
                icon="plus"
                variant="ghost"
                onPress={() => setSubmittedTicket(null)}
              />
            </View>
          </View>
        </ScrollView>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <KeyboardAwareScrollViewCompat
        contentContainerStyle={{
          paddingBottom: 160,
          paddingTop: heroPad + 8,
        }}
        keyboardShouldPersistTaps="handled"
        bottomOffset={120}
      >
        <View style={styles.headerWrap}>
          <Text style={[styles.heading, { color: colors.foreground }]}>
            Report a burst pipe
          </Text>
          <Text style={[styles.subhead, { color: colors.mutedForeground }]}>
            {headerSubtitle}
          </Text>

          <View
            style={[
              styles.modeRow,
              { backgroundColor: colors.muted, borderRadius: 12 },
            ]}
          >
            <ModePill
              label="New report"
              active={mode === "form"}
              onPress={() => setMode("form")}
            />
            <ModePill
              label={`Drafts${drafts.length ? ` · ${drafts.length}` : ""}`}
              active={mode === "drafts"}
              onPress={() => setMode("drafts")}
            />
          </View>
        </View>

        {mode === "drafts" ? (
          <View style={styles.section}>
            {drafts.length === 0 ? (
              <EmptyState
                icon="edit-3"
                title="No saved drafts"
                message="Drafts let you save partial reports — useful when you're offline or still gathering details."
              />
            ) : (
              <View style={{ gap: 10 }}>
                {drafts.map((draft) => (
                  <View
                    key={draft.id}
                    style={[
                      styles.draftCard,
                      {
                        backgroundColor: colors.card,
                        borderColor: colors.border,
                        borderRadius: colors.radius,
                      },
                    ]}
                  >
                    <View style={styles.draftHeader}>
                      <Feather
                        name="file-text"
                        size={14}
                        color={colors.mutedForeground}
                      />
                      <Text
                        style={[
                          styles.draftMeta,
                          { color: colors.mutedForeground },
                        ]}
                      >
                        Updated {formatRelative(draft.updatedAt)}
                      </Text>
                    </View>
                    <Text
                      style={[
                        styles.draftText,
                        { color: colors.foreground },
                      ]}
                      numberOfLines={3}
                    >
                      {draft.description.trim() || "(no description yet)"}
                    </Text>
                    <Text
                      style={[
                        styles.draftLoc,
                        { color: colors.mutedForeground },
                      ]}
                      numberOfLines={1}
                    >
                      {draft.location.address ||
                        formatCoords(
                          draft.location.latitude,
                          draft.location.longitude,
                        )}
                    </Text>
                    <View style={styles.draftActions}>
                      <PrimaryButton
                        label="Continue"
                        icon="edit-2"
                        size="sm"
                        onPress={() => onLoadDraft(draft)}
                      />
                      <PrimaryButton
                        label="Delete"
                        icon="trash-2"
                        variant="ghost"
                        size="sm"
                        onPress={() => onDeleteDraft(draft)}
                      />
                    </View>
                  </View>
                ))}
              </View>
            )}
          </View>
        ) : (
          <View style={styles.section}>
            <FieldGroup label="What's happening?">
              <TextInput
                value={description}
                onChangeText={setDescription}
                placeholder="e.g. Water gushing from the road outside the gate, has been going for an hour..."
                placeholderTextColor={colors.mutedForeground}
                multiline
                style={[
                  styles.textarea,
                  {
                    color: colors.foreground,
                    backgroundColor: colors.card,
                    borderColor: colors.border,
                    borderRadius: colors.radius,
                  },
                ]}
              />
            </FieldGroup>

            <FieldGroup label="Severity">
              <View style={styles.severityRow}>
                {SEVERITIES.map((s) => {
                  const active = severity === s;
                  return (
                    <Pressable
                      key={s}
                      onPress={() => setSeverity(s)}
                      style={({ pressed }) => [
                        styles.severityChip,
                        {
                          backgroundColor: active
                            ? colors.primary
                            : colors.card,
                          borderColor: active ? colors.primary : colors.border,
                          opacity: pressed ? 0.85 : 1,
                          borderRadius: 12,
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.severityLabel,
                          {
                            color: active
                              ? colors.primaryForeground
                              : colors.foreground,
                          },
                        ]}
                      >
                        {SEVERITY_LABEL[s]}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </FieldGroup>

            <FieldGroup
              label="Location"
              hint="Tap GPS for an exact pin, or type the nearest landmark."
            >
              <View style={styles.locationRow}>
                <Pressable
                  onPress={captureGps}
                  disabled={gpsLoading}
                  style={({ pressed }) => [
                    styles.gpsBtn,
                    {
                      backgroundColor: colors.primary,
                      opacity: gpsLoading ? 0.7 : pressed ? 0.85 : 1,
                      borderRadius: 12,
                    },
                  ]}
                >
                  <Feather
                    name="crosshair"
                    size={15}
                    color={colors.primaryForeground}
                  />
                  <Text
                    style={[
                      styles.gpsBtnText,
                      { color: colors.primaryForeground },
                    ]}
                  >
                    {gpsLoading ? "Locating…" : "Use GPS"}
                  </Text>
                </Pressable>
                {location.latitude !== null ? (
                  <View
                    style={[
                      styles.coordsChip,
                      {
                        backgroundColor: colors.muted,
                        borderRadius: 10,
                      },
                    ]}
                  >
                    <Feather name="map-pin" size={13} color={colors.primary} />
                    <Text
                      style={[
                        styles.coordsText,
                        { color: colors.foreground },
                      ]}
                    >
                      {formatCoords(location.latitude, location.longitude)}
                    </Text>
                    <Pressable
                      onPress={() =>
                        setLocation((prev) => ({
                          ...prev,
                          latitude: null,
                          longitude: null,
                        }))
                      }
                      hitSlop={8}
                    >
                      <Feather
                        name="x"
                        size={13}
                        color={colors.mutedForeground}
                      />
                    </Pressable>
                  </View>
                ) : null}
              </View>
              <TextInput
                value={location.address}
                onChangeText={(v) =>
                  setLocation((prev) => ({ ...prev, address: v }))
                }
                placeholder="Street, suburb or landmark (e.g. Kuwadzana 4 Shops)"
                placeholderTextColor={colors.mutedForeground}
                style={[
                  styles.input,
                  {
                    color: colors.foreground,
                    backgroundColor: colors.card,
                    borderColor: colors.border,
                    borderRadius: colors.radius,
                    marginTop: 10,
                  },
                ]}
              />
              {(location.latitude !== null || location.address.trim().length > 0) ? (
                <View style={{ marginTop: 12 }}>
                  <MapPreviewCard
                    latitude={location.latitude}
                    longitude={location.longitude}
                    address={location.address}
                    label="Preview"
                    height={110}
                  />
                </View>
              ) : null}
            </FieldGroup>

            <FieldGroup
              label="Photo"
              hint="A picture helps the dispatch team prioritise correctly."
            >
              {imageUri ? (
                <View
                  style={[
                    styles.photoPreview,
                    { borderColor: colors.border, borderRadius: colors.radius },
                  ]}
                >
                  <Image source={{ uri: imageUri }} style={styles.photoImg} />
                  <Pressable
                    onPress={() => setImageUri(null)}
                    style={[
                      styles.photoRemove,
                      { backgroundColor: colors.overlay },
                    ]}
                    hitSlop={8}
                  >
                    <Feather name="x" size={14} color="#fff" />
                  </Pressable>
                </View>
              ) : null}
              <PrimaryButton
                label={imageUri ? "Replace photo" : "Add a photo"}
                icon="camera"
                variant={imageUri ? "ghost" : "secondary"}
                onPress={pickImage}
              />
            </FieldGroup>

            <FieldGroup
              label="Your name (optional)"
              hint="Leave blank to report anonymously."
            >
              <TextInput
                value={name}
                onChangeText={setName}
                placeholder="Anonymous"
                placeholderTextColor={colors.mutedForeground}
                style={[
                  styles.input,
                  {
                    color: colors.foreground,
                    backgroundColor: colors.card,
                    borderColor: colors.border,
                    borderRadius: colors.radius,
                  },
                ]}
              />
            </FieldGroup>

            <View style={styles.submitRow}>
              <PrimaryButton
                label="Submit report"
                icon="send"
                onPress={onSubmit}
                loading={submitting}
                disabled={!isValid}
                fullWidth
              />
              <View style={styles.draftBtnRow}>
                <PrimaryButton
                  label="Save as draft"
                  icon="save"
                  variant="ghost"
                  onPress={onSaveDraft}
                  loading={savingDraft}
                />
                {editingDraftId ? (
                  <PrimaryButton
                    label="Discard"
                    icon="rotate-ccw"
                    variant="ghost"
                    onPress={resetForm}
                  />
                ) : null}
              </View>
              {!isValid ? (
                <Text
                  style={[styles.validationHint, { color: colors.mutedForeground }]}
                >
                  Add a short description (8+ chars) and either GPS or an address.
                </Text>
              ) : null}
            </View>
          </View>
        )}

        <View style={{ height: 20 }} />
        <SectionHeaderInline />
      </KeyboardAwareScrollViewCompat>
    </View>
  );
}

function ModePill({
  label,
  active,
  onPress,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
}) {
  const colors = useColors();
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.modePill,
        {
          backgroundColor: active ? colors.card : "transparent",
          borderColor: active ? colors.border : "transparent",
          opacity: pressed ? 0.85 : 1,
        },
      ]}
    >
      <Text
        style={[
          styles.modePillText,
          {
            color: active ? colors.foreground : colors.mutedForeground,
          },
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
}

function FieldGroup({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  const colors = useColors();
  return (
    <View style={{ gap: 8 }}>
      <Text style={[styles.fieldLabel, { color: colors.foreground }]}>
        {label}
      </Text>
      {hint ? (
        <Text style={[styles.fieldHint, { color: colors.mutedForeground }]}>
          {hint}
        </Text>
      ) : null}
      {children}
    </View>
  );
}

function SectionHeaderInline() {
  const colors = useColors();
  return (
    <View style={{ paddingHorizontal: 20 }}>
      <View
        style={[
          styles.tipCard,
          { backgroundColor: colors.card, borderColor: colors.border, borderRadius: colors.radius },
        ]}
      >
        <Feather name="wifi-off" size={16} color={colors.primary} />
        <Text style={[styles.tipText, { color: colors.foreground }]}>
          No signal? Save as draft. Reports are stored on this device until you
          submit them.
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerWrap: {
    paddingHorizontal: 20,
    gap: 6,
    marginBottom: 18,
  },
  heading: {
    fontFamily: "Inter_700Bold",
    fontSize: 26,
  },
  subhead: {
    fontFamily: "Inter_400Regular",
    fontSize: 14,
    lineHeight: 20,
  },
  modeRow: {
    flexDirection: "row",
    padding: 4,
    marginTop: 14,
    gap: 4,
  },
  modePill: {
    flex: 1,
    paddingVertical: 9,
    borderRadius: 9,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  modePillText: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 13.5,
  },
  section: {
    paddingHorizontal: 20,
    gap: 18,
  },
  fieldLabel: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 14,
  },
  fieldHint: {
    fontFamily: "Inter_400Regular",
    fontSize: 12.5,
    marginTop: -4,
  },
  textarea: {
    minHeight: 110,
    padding: 14,
    borderWidth: 1,
    fontFamily: "Inter_400Regular",
    fontSize: 15,
    lineHeight: 22,
    textAlignVertical: "top",
  },
  input: {
    minHeight: 46,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderWidth: 1,
    fontFamily: "Inter_400Regular",
    fontSize: 15,
  },
  severityRow: {
    flexDirection: "row",
    gap: 8,
  },
  severityChip: {
    flex: 1,
    paddingVertical: 11,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  severityLabel: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 14,
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    flexWrap: "wrap",
  },
  gpsBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 11,
  },
  gpsBtnText: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 14,
  },
  coordsChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  coordsText: {
    fontFamily: "Inter_500Medium",
    fontSize: 12.5,
  },
  photoPreview: {
    borderWidth: 1,
    overflow: "hidden",
    aspectRatio: 16 / 10,
    position: "relative",
  },
  photoImg: {
    width: "100%",
    height: "100%",
  },
  photoRemove: {
    position: "absolute",
    top: 8,
    right: 8,
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  submitRow: {
    gap: 10,
    marginTop: 4,
  },
  draftBtnRow: {
    flexDirection: "row",
    gap: 8,
    flexWrap: "wrap",
  },
  validationHint: {
    fontFamily: "Inter_400Regular",
    fontSize: 12.5,
    marginTop: 2,
    textAlign: "center",
  },
  draftCard: {
    borderWidth: 1,
    padding: 14,
    gap: 8,
  },
  draftHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  draftMeta: {
    fontFamily: "Inter_500Medium",
    fontSize: 12.5,
  },
  draftText: {
    fontFamily: "Inter_500Medium",
    fontSize: 14.5,
    lineHeight: 21,
  },
  draftLoc: {
    fontFamily: "Inter_400Regular",
    fontSize: 12.5,
  },
  draftActions: {
    flexDirection: "row",
    gap: 8,
    marginTop: 4,
  },
  successCard: {
    padding: 22,
    alignItems: "center",
    borderWidth: 1,
    gap: 10,
  },
  successIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
  },
  successTitle: {
    fontFamily: "Inter_700Bold",
    fontSize: 22,
    marginTop: 6,
  },
  successBody: {
    fontFamily: "Inter_400Regular",
    fontSize: 14,
    lineHeight: 21,
    textAlign: "center",
    paddingHorizontal: 4,
  },
  ticketBox: {
    marginTop: 12,
    paddingVertical: 12,
    paddingHorizontal: 18,
    alignItems: "center",
    alignSelf: "stretch",
  },
  ticketLabel: {
    fontFamily: "Inter_500Medium",
    fontSize: 12,
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },
  ticketId: {
    fontFamily: "Inter_700Bold",
    fontSize: 18,
    letterSpacing: 0.5,
    marginTop: 4,
  },
  successActions: {
    marginTop: 14,
    alignSelf: "stretch",
    alignItems: "center",
    gap: 6,
  },
  tipCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    padding: 14,
    borderWidth: 1,
  },
  tipText: {
    fontFamily: "Inter_500Medium",
    fontSize: 13.5,
    flex: 1,
    lineHeight: 19,
  },
});
