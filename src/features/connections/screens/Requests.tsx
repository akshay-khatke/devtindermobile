// src/screens/requests/Requests.tsx
import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, FlatList, Image, TouchableOpacity, ActivityIndicator, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useIsFocused } from "@react-navigation/native";
import { getRequestReceived } from "../api/userApi";
import { reviewRequestStatus } from "../api/requestApi";
import { useTheme } from "../../../shared/utils/colors";

const Requests = () => {
    const { colors: themeColors, isDark } = useTheme();
    const styles = getStyles(themeColors);
    const [requests, setRequests] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const isFocused = useIsFocused();

    const fetchRequests = async () => {
        try {
            const res = await getRequestReceived();
            setRequests(res.data || []);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (isFocused) {
            fetchRequests();
        }
    }, [isFocused]);

    const handleReview = async (status: "accepted" | "rejected", requestId: string) => {
        try {
            await reviewRequestStatus(status, requestId);
            Alert.alert("Success", `Request ${status === "accepted" ? "accepted" : "rejected"} successfully!`);
            fetchRequests();
        } catch (err: any) {
            Alert.alert("Error", err.response?.data?.message || "Action failed");
        }
    };

    if (loading) {
        return (
            <View style={styles.center}>
                <ActivityIndicator size="large" color={themeColors.accent} />
            </View>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <Text style={styles.header}>Connection Requests</Text>
            {requests.length === 0 ? (
                <View style={styles.center}>
                    <Text style={styles.noData}>No connection requests received.</Text>
                </View>
            ) : (
                <FlatList
                    data={requests}
                    keyExtractor={(item) => item._id}
                    showsVerticalScrollIndicator={false}
                    renderItem={({ item }) => {
                        const sender = item.fromUserId;
                        if (!sender) return null;
                        return (
                            <View style={styles.card}>
                                <Image source={{ uri: sender.photoUrl }} style={styles.avatar} />
                                <View style={styles.info}>
                                    <Text style={styles.notificationText}>
                                        <Text style={styles.name}>{sender.firstName} {sender.lastName}</Text>
                                        <Text style={styles.actionText}> sent you a connection request.</Text>
                                    </Text>
                                    <Text style={styles.about} numberOfLines={1}>
                                        {sender.about || "Wants to connect with you!"}
                                    </Text>
                                </View>
                                <View style={styles.buttonRow}>
                                    <TouchableOpacity
                                        style={styles.acceptBtn}
                                        onPress={() => handleReview("accepted", item._id)}
                                    >
                                        <Text style={styles.btnTextConfirm}>Confirm</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        style={styles.rejectBtn}
                                        onPress={() => handleReview("rejected", item._id)}
                                    >
                                        <Text style={styles.btnTextDelete}>Delete</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        );
                    }}
                />
            )}
        </SafeAreaView>
    );
};

const getStyles = (colors: any) => StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
        paddingHorizontal: 16,
    },
    header: {
        fontSize: 24,
        fontWeight: "800",
        color: colors.textPrimary,
        marginTop: 15,
        marginBottom: 16,
    },
    center: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: colors.background,
    },
    noData: {
        color: colors.textSecondary,
        fontSize: 16,
    },
    card: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: colors.background,
        paddingVertical: 14,
        borderBottomWidth: 1,
        borderBottomColor: colors.divider,
    },
    avatar: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: colors.inputBackground,
    },
    info: {
        marginLeft: 12,
        flex: 1,
        justifyContent: "center",
    },
    notificationText: {
        fontSize: 14,
        color: colors.textPrimary,
        lineHeight: 18,
    },
    name: {
        fontWeight: "700",
    },
    actionText: {
        color: colors.textSecondary,
    },
    about: {
        fontSize: 12,
        color: colors.textMuted,
        marginTop: 2,
    },
    buttonRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
        marginLeft: 10,
    },
    acceptBtn: {
        backgroundColor: colors.accent,
        paddingVertical: 7,
        paddingHorizontal: 14,
        borderRadius: 8,
        justifyContent: "center",
        alignItems: "center",
    },
    rejectBtn: {
        backgroundColor: colors.inputBackground,
        paddingVertical: 7,
        paddingHorizontal: 14,
        borderRadius: 8,
        justifyContent: "center",
        alignItems: "center",
    },
    btnTextConfirm: {
        color: "#ffffff",
        fontWeight: "700",
        fontSize: 12,
    },
    btnTextDelete: {
        color: colors.textPrimary,
        fontWeight: "700",
        fontSize: 12,
    },
});

export default Requests;
