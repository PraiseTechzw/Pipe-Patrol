const colors = {
  light: {
    text: "#0a1f33",
    tint: "#0369a1",

    background: "#f3f8fc",
    backgroundAlt: "#eaf3fa",
    foreground: "#0a1f33",

    card: "#ffffff",
    cardForeground: "#0a1f33",

    primary: "#0369a1",
    primaryDeep: "#075985",
    primaryForeground: "#ffffff",

    accent: "#06b6d4",
    accentSoft: "#cffafe",
    accentForeground: "#0a4655",

    secondary: "#e6f2fa",
    secondaryForeground: "#0a1f33",

    muted: "#eef5fa",
    mutedForeground: "#566b7e",

    surfaceTint: "#f0f9ff",

    destructive: "#dc2626",
    destructiveSoft: "#fee2e2",
    destructiveForeground: "#ffffff",

    warning: "#d97706",
    warningSoft: "#fef3c7",
    warningForeground: "#ffffff",

    success: "#0f9d58",
    successSoft: "#dcfce7",
    successForeground: "#ffffff",

    info: "#0284c7",
    infoSoft: "#dbeafe",
    infoForeground: "#ffffff",

    border: "#d6e4ee",
    borderStrong: "#b9cfe0",
    input: "#d6e4ee",

    overlay: "rgba(10,31,51,0.55)",

    heroGradient: ["#0ea5b7", "#0369a1", "#075985"] as [
      string,
      string,
      string,
    ],
    heroGradientStart: { x: 0, y: 0 } as const,
    heroGradientEnd: { x: 1, y: 1 } as const,
  },

  radius: 16,
};

export default colors;
