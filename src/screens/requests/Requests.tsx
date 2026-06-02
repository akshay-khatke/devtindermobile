// src/screens/requests/Requests.tsx
import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, FlatList, Image, TouchableOpacity, ActivityIndicator, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { getRequestReceived } from "../../api/userApi";
import { reviewRequestStatus } from "../../api/requestApi";
import { colors } from "../../utils/colors";

const Requests = () => {
    const [requests, setRequests] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

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
        fetchRequests();
    }, []);

    const handleReview = async (status: "accepted" | "rejected", requestId: string) => {
        try {
            await reviewRequestStatus(status, requestId);
            Alert.alert("Success", `Request ${status} successfully!`);
            // Refresh list
            fetchRequests();
        } catch (err: any) {
            Alert.alert("Error", err.response?.data?.message || "Action failed");
        }
    };

    if (loading) {
        return (
            <View style={styles.center}>
                <ActivityIndicator size="large" color={colors.accent} />
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
                    renderItem={({ item }) => {
                        const sender = item.fromUserId;
                        if (!sender) return null;
                        return (
                            <View style={styles.card}>
                                <Image source={{ uri: sender.photoUrl }} style={styles.avatar} />
                                <View style={styles.info}>
                                    <Text style={styles.name}>{sender.firstName} {sender.lastName}</Text>
                                    <Text style={styles.about}>{sender.about || "Wants to connect with you!"}</Text>
                                    <View style={styles.buttonRow}>
                                        <TouchableOpacity 
                                            style={[styles.btn, styles.acceptBtn]} 
                                            onPress={() => handleReview("accepted", item._id)}
                                        >
                                            <Text style={styles.btnText}>Accept</Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity 
                                            style={[styles.btn, styles.rejectBtn]} 
                                            onPress={() => handleReview("rejected", item._id)}
                                        >
                                            <Text style={styles.btnText}>Reject</Text>
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            </View>
                        );
                    }}
                />
            )}
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.primary,
        padding: 16,
    },
    header: {
        fontSize: 24,
        fontWeight: "bold",
        color: colors.accent,
        marginBottom: 16,
    },
    center: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    noData: {
        color: "gray",
        fontSize: 16,
    },
    card: {
        flexDirection: "row",
        backgroundColor: "white",
        borderRadius: 8,
        padding: 12,
        marginBottom: 12,
        alignItems: "flex-start",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    avatar: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: "#ccc",
    },
    info: {
        marginLeft: 12,
        flex: 1,
    },
    name: {
        fontSize: 16,
        fontWeight: "bold",
        color: "#333",
    },
    about: {
        fontSize: 14,
        color: "#666",
        marginTop: 2,
        marginBottom: 8,
    },
    buttonRow: {
        flexDirection: "row",
        gap: 10,
    },
    btn: {
        paddingVertical: 6,
        paddingHorizontal: 16,
        borderRadius: 4,
        alignItems: "center",
    },
    acceptBtn: {
        backgroundColor: "#4CAF50",
    },
    rejectBtn: {
        backgroundColor: "#F44336",
    },
    btnText: {
        color: "white",
        fontWeight: "bold",
        fontSize: 14,
    },
});

export default Requests;
