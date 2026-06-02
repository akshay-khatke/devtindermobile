// src/screens/connections/Connections.tsx
import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, FlatList, Image, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { getConnections } from "../../api/userApi";
import { colors } from "../../utils/colors";

const Connections = () => {
    const [connections, setConnections] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchConnections = async () => {
            try {
                const res = await getConnections();
                setConnections(res.data || []);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchConnections();
    }, []);

    if (loading) {
        return (
            <View style={styles.center}>
                <ActivityIndicator size="large" color={colors.accent} />
            </View>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <Text style={styles.header}>My Connections</Text>
            {connections.length === 0 ? (
                <View style={styles.center}>
                    <Text style={styles.noData}>No connections found yet.</Text>
                </View>
            ) : (
                <FlatList
                    data={connections}
                    keyExtractor={(item) => item._id}
                    renderItem={({ item }) => (
                        <View style={styles.card}>
                            <Image source={{ uri: item.photoUrl }} style={styles.avatar} />
                            <View style={styles.info}>
                                <Text style={styles.name}>{item.firstName} {item.lastName}</Text>
                                <Text style={styles.about}>{item.about || "Hey there! I am using DevTinder."}</Text>
                            </View>
                        </View>
                    )}
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
        alignItems: "center",
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
    },
});

export default Connections;
