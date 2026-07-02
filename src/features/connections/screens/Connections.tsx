// src/screens/connections/Connections.tsx
import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, FlatList, Image, TouchableOpacity, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation, useIsFocused } from "@react-navigation/native";
import { getConnections } from "../api/userApi";
import { useTheme } from "../../../shared/utils/colors";

const Connections = () => {
    const { colors: themeColors, isDark } = useTheme();
    const styles = getStyles(themeColors);
    const [connections, setConnections] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const navigation = useNavigation<any>();
    const isFocused = useIsFocused();

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

    useEffect(() => {
        if (isFocused) {
            fetchConnections();
        }
    }, [isFocused]);

    if (loading) {
        return (
            <View style={styles.center}>
                <ActivityIndicator size="large" color={themeColors.accent} />
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
                    showsVerticalScrollIndicator={false}
                    renderItem={({ item }) => (
                        <View style={styles.card}>
                            <Image source={{ uri: item.photoUrl }} style={styles.avatar} />
                            <View style={styles.info}>
                                <Text style={styles.name}>{item.firstName} {item.lastName}</Text>
                                <Text style={styles.about} numberOfLines={1}>
                                    {item.about || "Hey there! I am using DevTinder."}
                                </Text>
                            </View>
                            <TouchableOpacity
                                style={styles.chatBtn}
                                onPress={() => navigation.navigate("ChatScreen", { targetUser: item })}
                            >
                                <Text style={styles.chatBtnText}>Chat</Text>
                            </TouchableOpacity>
                        </View>
                    )}
                />
            )}
        </SafeAreaView>
    );
};

const getStyles = (colors: any) => StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
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
        backgroundColor: colors.background,
    },
    noData: {
        color: colors.textSecondary,
        fontSize: 16,
    },
    card: {
        flexDirection: "row",
        backgroundColor: colors.cardBackground,
        borderRadius: 8,
        padding: 12,
        marginBottom: 12,
        alignItems: "center",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: colors.isDark ? 0.3 : 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    avatar: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: colors.inputBackground,
    },
    info: {
        marginLeft: 12,
        marginRight: 10,
        flex: 1,
    },
    name: {
        fontSize: 16,
        fontWeight: "bold",
        color: colors.textPrimary,
    },
    about: {
        fontSize: 14,
        color: colors.textSecondary,
        marginTop: 2,
    },
    chatBtn: {
        backgroundColor: colors.accent,
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 20,
        shadowColor: colors.accent,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 4,
        elevation: 3,
    },
    chatBtnText: {
        color: "white",
        fontWeight: "700",
        fontSize: 13,
    },
});

export default Connections;
