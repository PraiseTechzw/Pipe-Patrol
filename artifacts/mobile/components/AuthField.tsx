import { Feather } from "@expo/vector-icons";
import React from "react";
import {
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import { useColors } from "@/hooks/useColors";

type Props = {
  label: string;
  value: string;
  onChangeText: (v: string) => void;
  placeholder?: string;
  icon?: keyof typeof Feather.glyphMap;
  secureTextEntry?: boolean;
  autoCapitalize?: "none" | "sentences" | "words" | "characters";
  keyboardType?: "default" | "email-address" | "phone-pad" | "numeric";
  hint?: string;
  autoComplete?:
    | "email"
    | "password"
    | "name"
    | "tel"
    | "off"
    | "new-password"
    | "username";
  textContentType?:
    | "username"
    | "password"
    | "emailAddress"
    | "name"
    | "telephoneNumber"
    | "newPassword"
    | "none";
};

export function AuthField({
  label,
  value,
  onChangeText,
  placeholder,
  icon,
  secureTextEntry,
  autoCapitalize = "sentences",
  keyboardType = "default",
  hint,
  autoComplete,
  textContentType,
}: Props) {
  const colors = useColors();
  const [show, setShow] = React.useState(false);
  const [focused, setFocused] = React.useState(false);
  const isSecure = secureTextEntry && !show;

  return (
    <View style={{ marginBottom: 14 }}>
      <Text style={[styles.label, { color: colors.foreground }]}>{label}</Text>
      <View
        style={[
          styles.fieldRow,
          {
            backgroundColor: colors.card,
            borderColor: focused ? colors.primary : colors.border,
            borderRadius: 12,
          },
        ]}
      >
        {icon ? (
          <Feather
            name={icon}
            size={16}
            color={focused ? colors.primary : colors.mutedForeground}
            style={{ marginRight: 10 }}
          />
        ) : null}
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={colors.mutedForeground}
          secureTextEntry={isSecure}
          autoCapitalize={autoCapitalize}
          keyboardType={keyboardType}
          autoComplete={autoComplete}
          textContentType={textContentType}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          style={[
            styles.input,
            { color: colors.foreground },
            Platform.OS === "web"
              ? ({ outlineStyle: "none" } as unknown as object)
              : null,
          ]}
        />
        {secureTextEntry ? (
          <Pressable
            onPress={() => setShow((s) => !s)}
            hitSlop={8}
            style={{ padding: 4 }}
          >
            <Feather
              name={show ? "eye-off" : "eye"}
              size={16}
              color={colors.mutedForeground}
            />
          </Pressable>
        ) : null}
      </View>
      {hint ? (
        <Text style={[styles.hint, { color: colors.mutedForeground }]}>
          {hint}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  label: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 13,
    marginBottom: 6,
  },
  fieldRow: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: Platform.OS === "web" ? 10 : 11,
  },
  input: {
    flex: 1,
    fontFamily: "Inter_400Regular",
    fontSize: 14,
    paddingVertical: 0,
  },
  hint: {
    fontFamily: "Inter_400Regular",
    fontSize: 12,
    marginTop: 6,
  },
});
