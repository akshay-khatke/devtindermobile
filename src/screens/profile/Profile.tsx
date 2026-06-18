// src/screens/profile/Profile.tsx
import React from "react";
import { View, Text, StyleSheet, Image, TouchableOpacity, Alert, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "../../redux/store";
import { logout } from "../../redux/authSlice";
import * as Keychain from "react-native-keychain";
import { useTheme } from "../../utils/colors";
import Svg, { Path, Circle, Rect } from "react-native-svg";

const CalendarIcon = ({ stroke }: { stroke: string }) => (
    <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
        <Rect x={3} y={4} width={18} height={18} rx={2} stroke={stroke} strokeWidth={2} />
        <Path d="M16 2v4M8 2v4M3 10h18" stroke={stroke} strokeWidth={2} strokeLinecap="round" />
    </Svg>
);

const GenderIcon = ({ stroke }: { stroke: string }) => (
    <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
        <Circle cx={12} cy={10} r={4} stroke={stroke} strokeWidth={2} />
        <Path d="M6 21v-1a4 4 0 014-4h4a4 4 0 014 4v1" stroke={stroke} strokeWidth={2} strokeLinecap="round" />
    </Svg>
);

const VerifiedBadgeIcon = ({ stroke }: { stroke: string }) => (
    <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
        <Circle cx={12} cy={12} r={10} stroke={stroke} strokeWidth={2} />
        <Path d="M8 12l3 3 5-5" stroke={stroke} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
);

const LogoutIcon = ({ stroke }: { stroke: string }) => (
    <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
        <Path
            d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9"
            stroke={stroke}
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
        />
    </Svg>
);

const Profile = () => {
    const { user } = useSelector((state: RootState) => state.auth);
    const dispatch = useDispatch();
    const { colors: themeColors, isDark } = useTheme();
    const styles = getStyles(themeColors);

    const handleLogout = async () => {
        Alert.alert(
            "Logout",
            "Are you sure you want to logout?",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Logout",
                    style: "destructive",
                    onPress: async () => {
                        try {
                            await Keychain.resetGenericPassword();
                            dispatch(logout());
                        } catch (err) {
                            console.error("Failed to clear session", err);
                        }
                    },
                },
            ]
        );
    };

    if (!user) return null;

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContainer}>
                {/* Header Profile Section */}
                <View style={styles.header}>
                    <View style={styles.avatarOutline}>
                        <View style={styles.avatarInner}>
                            <Image source={{ uri: user.photoUrl }} style={styles.avatar} />
                        </View>
                    </View>
                    <Text style={styles.name}>{user.firstName} {user.lastName}</Text>
                    <Text style={styles.email}>{user.emailId}</Text>
                </View>

                {/* Horizontal Quick Stats Grid */}
                <View style={styles.statsRow}>
                    <View style={styles.statCard}>
                        <View style={styles.statIconWrapper}>
                            <CalendarIcon stroke={themeColors.accent} />
                        </View>
                        <Text style={styles.statLabel}>Age</Text>
                        <Text style={styles.statVal}>{user.age || "N/A"}</Text>
                    </View>

                    <View style={styles.statCard}>
                        <View style={styles.statIconWrapper}>
                            <GenderIcon stroke={themeColors.accent} />
                        </View>
                        <Text style={styles.statLabel}>Gender</Text>
                        <Text style={styles.statVal}>{user.gender || "N/A"}</Text>
                    </View>

                    <View style={styles.statCard}>
                        <View style={styles.statIconWrapper}>
                            <VerifiedBadgeIcon stroke={themeColors.accent} />
                        </View>
                        <Text style={styles.statLabel}>Status</Text>
                        <Text style={styles.statVal}>Active</Text>
                    </View>
                </View>

                {/* About Section Card */}
                <View style={styles.infoCard}>
                    <Text style={styles.sectionTitle}>About Me</Text>
                    <View style={styles.aboutWrapper}>
                        <Text style={styles.aboutText}>
                            {user.about || "Hey there! I am a developer looking for cool connections on DevTinder."}
                        </Text>
                    </View>
                </View>

                {/* Skills Section Card */}
                {user.skills && user.skills.length > 0 && (
                    <View style={styles.infoCard}>
                        <Text style={styles.sectionTitle}>Professional Skills</Text>
                        <View style={styles.skillsContainer}>
                            {user.skills.map((skill: string, index: number) => (
                                <View key={index} style={styles.skillBadge}>
                                    <Text style={styles.skillText}>{skill}</Text>
                                </View>
                            ))}
                        </View>
                    </View>
                )}

                {/* Logout Button */}
                <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
                    <LogoutIcon stroke="#ffffff" />
                    <Text style={styles.logoutText}>Logout</Text>
                </TouchableOpacity>
            </ScrollView>
        </SafeAreaView>
    );
};

const getStyles = (colors: any) => StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    scrollContainer: {
        padding: 20,
        paddingBottom: 40,
    },
    header: {
        alignItems: "center",
        marginVertical: 15,
    },
    avatarOutline: {
        width: 116,
        height: 116,
        borderRadius: 58,
        borderWidth: 2.5,
        borderColor: colors.accent,
        justifyContent: "center",
        alignItems: "center",
        shadowColor: colors.accent,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: colors.isDark ? 0.35 : 0.15,
        shadowRadius: 10,
        elevation: 4,
    },
    avatarInner: {
        width: 106,
        height: 106,
        borderRadius: 53,
        borderWidth: 2,
        borderColor: colors.cardBackground,
        overflow: "hidden",
    },
    avatar: {
        width: "100%",
        height: "100%",
        backgroundColor: colors.inputBackground,
    },
    name: {
        fontSize: 24,
        fontWeight: "800",
        color: colors.textPrimary,
        marginTop: 16,
        letterSpacing: -0.5,
    },
    email: {
        fontSize: 14,
        color: colors.textSecondary,
        marginTop: 4,
        fontWeight: "500",
    },
    statsRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginVertical: 25,
        gap: 12,
    },
    statCard: {
        flex: 1,
        backgroundColor: colors.cardBackground,
        borderRadius: 16,
        paddingVertical: 16,
        alignItems: "center",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: colors.isDark ? 0.25 : 0.05,
        shadowRadius: 6,
        elevation: 3,
        borderWidth: 1,
        borderColor: colors.divider,
    },
    statIconWrapper: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: colors.accentLight,
        justifyContent: "center",
        alignItems: "center",
        marginBottom: 8,
    },
    statLabel: {
        fontSize: 12,
        fontWeight: "600",
        color: colors.textSecondary,
        marginBottom: 4,
    },
    statVal: {
        fontSize: 14,
        fontWeight: "700",
        color: colors.textPrimary,
        textTransform: "capitalize",
    },
    infoCard: {
        backgroundColor: colors.cardBackground,
        borderRadius: 16,
        padding: 20,
        marginBottom: 16,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: colors.isDark ? 0.25 : 0.05,
        shadowRadius: 6,
        elevation: 3,
        borderWidth: 1,
        borderColor: colors.divider,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: "800",
        color: colors.textPrimary,
        marginBottom: 12,
        letterSpacing: -0.2,
    },
    aboutWrapper: {
        borderLeftWidth: 3.5,
        borderLeftColor: colors.accent,
        paddingLeft: 12,
        paddingVertical: 2,
    },
    aboutText: {
        fontSize: 14,
        color: colors.textSecondary,
        lineHeight: 22,
    },
    skillsContainer: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 8,
    },
    skillBadge: {
        backgroundColor: colors.accentLight,
        borderWidth: 1,
        borderColor: colors.accentLight,
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: 20,
    },
    skillText: {
        color: colors.accent,
        fontSize: 13,
        fontWeight: "700",
    },
    logoutBtn: {
        backgroundColor: "#E55050",
        flexDirection: "row",
        padding: 16,
        borderRadius: 16,
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        marginTop: 10,
        shadowColor: "#E55050",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 4,
    },
    logoutText: {
        color: "#ffffff",
        fontWeight: "700",
        fontSize: 16,
    },
});

export default Profile;
