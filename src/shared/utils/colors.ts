import { useColorScheme } from "react-native";

export const colors = {
    accent: "#29a4c7", // customizable base color (change this to change the app theme color)
    accentLight: "rgba(41, 164, 199, 0.15)", // semi-transparent accent for highlights
    primary: "#ffffff",
};

export const getThemeColors = (isDark: boolean) => {
    return {
        // Base branding
        accent: colors.accent,
        accentLight: colors.accentLight,
        
        // Backgrounds
        background: isDark ? "#121212" : "#ffffff",
        cardBackground: isDark ? "#1E1E1E" : "#ffffff",
        inputBackground: isDark ? "#2A2A2A" : "#F4F4F7",
        
        // Typography
        textPrimary: isDark ? "#ffffff" : "#111111",
        textSecondary: isDark ? "#AAAAAA" : "#8E8E93",
        textMuted: isDark ? "#666666" : "#B5B5BE",
        
        // Borders and Dividers
        divider: isDark ? "#2C2C2C" : "#F4F4F7",
        border: isDark ? "#3A3A3A" : "#E2E2E9",
        
        // Status & badges
        unreadBadge: colors.accent,
        unreadBadgeText: "#ffffff",
        
        // Static colors
        white: "#ffffff",
        black: "#000000",
        gray: "#8e8e93",
        
        // Tab styling
        tabBarBg: isDark ? "#1C1C1E" : "#ffffff",
        tabBarBorder: isDark ? "#2C2C2C" : "#f4f4f7",
    };
};

export const useTheme = () => {
    const scheme = useColorScheme();
    const isDark = scheme === "dark";
    return {
        colors: getThemeColors(isDark),
        isDark,
    };
};