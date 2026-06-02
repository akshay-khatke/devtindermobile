// src/screens/chat/Chat.tsx
import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, FlatList, Image, TouchableOpacity, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { getConnections } from "../../api/userApi";
import { colors } from "../../utils/colors";

const Chat = () => {
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
            <Text style={styles.header}>Messages</Text>
            {connections.length === 0 ? (
                <View style={styles.center}>
                    <Text style={styles.noData}>No connected users to chat with.</Text>
                </View>
            ) : (
                <FlatList
                    data={connections}
                    keyExtractor={(item) => item._id}
                    renderItem={({ item }) => (
                        <TouchableOpacity style={styles.chatRow}>
                            <Image source={{ uri: item.photoUrl }} style={styles.avatar} />
                            <View style={styles.info}>
                                <Text style={styles.name}>{item.firstName} {item.lastName}</Text>
                                <Text style={styles.lastMsg}>Tap to start chatting...</Text>
                            </View>
                            <Text style={styles.time}>Now</Text>
                        </TouchableOpacity>
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
    chatRow: {
        flexDirection: "row",
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: "#eee",
        alignItems: "center",
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
    lastMsg: {
        fontSize: 14,
        color: "gray",
        marginTop: 2,
    },
    time: {
        fontSize: 12,
        color: "gray",
    },
});

export default Chat;
