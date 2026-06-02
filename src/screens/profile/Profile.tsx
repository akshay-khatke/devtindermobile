// src/screens/profile/Profile.tsx
import React from "react";
import { View, Text, StyleSheet, Image, TouchableOpacity, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "../../redux/store";
import { logout } from "../../redux/authSlice";
import * as Keychain from "react-native-keychain";
import { colors } from "../../utils/colors";

const Profile = () => {
    const { user } = useSelector((state: RootState) => state.auth);
    const dispatch = useDispatch();

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
            <View style={styles.header}>
                <Image source={{ uri: user.photoUrl }} style={styles.avatar} />
                <Text style={styles.name}>{user.firstName} {user.lastName}</Text>
                <Text style={styles.email}>{user.emailId}</Text>
            </View>

            <View style={styles.body}>
                <View style={styles.infoRow}>
                    <Text style={styles.label}>Age:</Text>
                    <Text style={styles.val}>{user.age || "N/A"}</Text>
                </View>
                <View style={styles.infoRow}>
                    <Text style={styles.label}>Gender:</Text>
                    <Text style={styles.val}>{user.gender || "N/A"}</Text>
                </View>
                <View style={styles.infoRow}>
                    <Text style={styles.label}>About:</Text>
                    <Text style={styles.val}>{user.about || "No description provided."}</Text>
                </View>
                {user.skills && user.skills.length > 0 && (
                    <View style={styles.skillsSection}>
                        <Text style={styles.label}>Skills:</Text>
                        <View style={styles.skillsList}>
                            {user.skills.map((skill: string, index: number) => (
                                <View key={index} style={styles.skillBadge}>
                                    <Text style={styles.skillText}>{skill}</Text>
                                </View>
                            ))}
                        </View>
                    </View>
                )}
            </View>

            <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
                <Text style={styles.logoutText}>Logout</Text>
            </TouchableOpacity>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.primary,
        padding: 20,
    },
    header: {
        alignItems: "center",
        marginVertical: 20,
    },
    avatar: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: "#ccc",
        borderWidth: 2,
        borderColor: colors.accent,
    },
    name: {
        fontSize: 22,
        fontWeight: "bold",
        color: "#333",
        marginTop: 12,
    },
    email: {
        fontSize: 14,
        color: "gray",
        marginTop: 4,
    },
    body: {
        backgroundColor: "white",
        borderRadius: 10,
        padding: 16,
        marginVertical: 10,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 5,
        elevation: 2,
    },
    infoRow: {
        flexDirection: "row",
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: "#eee",
    },
    label: {
        width: 80,
        fontWeight: "bold",
        color: "#555",
        fontSize: 15,
    },
    val: {
        flex: 1,
        color: "#333",
        fontSize: 15,
    },
    skillsSection: {
        marginTop: 15,
    },
    skillsList: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 8,
        marginTop: 8,
    },
    skillBadge: {
        backgroundColor: colors.accent,
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: 20,
    },
    skillText: {
        color: "white",
        fontSize: 13,
        fontWeight: "bold",
    },
    logoutBtn: {
        backgroundColor: "#F44336",
        padding: 15,
        borderRadius: 10,
        alignItems: "center",
        marginTop: "auto",
        marginBottom: 20,
    },
    logoutText: {
        color: "white",
        fontWeight: "bold",
        fontSize: 16,
    },
});

export default Profile;
