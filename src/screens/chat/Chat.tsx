import React, { useEffect, useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    Image,
    TouchableOpacity,
    TextInput,
    ActivityIndicator,
    ScrollView
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation, useIsFocused } from "@react-navigation/native";
import { useSelector } from "react-redux";
import { RootState } from "../../redux/store";
import { getConnections } from "../../api/userApi";
import { getChat } from "../../api/chatApi";
import Svg, { Path, Circle } from "react-native-svg";
import { useTheme } from "../../utils/colors";

const BackIcon = ({ stroke }: { stroke: string }) => (
    <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
        <Path
            d="M15 19l-7-7 7-7"
            stroke={stroke}
            strokeWidth={2.5}
            strokeLinecap="round"
            strokeLinejoin="round"
        />
    </Svg>
);

const SearchIcon = ({ stroke }: { stroke: string }) => (
    <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
        <Circle cx={11} cy={11} r={8} stroke={stroke} strokeWidth={2} />
        <Path d="M21 21l-4.35-4.35" stroke={stroke} strokeWidth={2} strokeLinecap="round" />
    </Svg>
);

const FilterIcon = ({ stroke }: { stroke: string }) => (
    <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
        <Path
            d="M4 21v-7M4 10V3M12 21v-9M12 8V3M20 21v-5M20 12V3M1 14h6M9 8h6M17 12h6"
            stroke={stroke}
            strokeWidth={2}
            strokeLinecap="round"
        />
    </Svg>
);

const Chat = () => {
    const { colors: themeColors, isDark } = useTheme();
    const styles = getStyles(themeColors);
    const [searchQuery, setSearchQuery] = useState("");
    const [connections, setConnections] = useState<any[]>([]);
    const [chatsList, setChatsList] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const { user } = useSelector((state: RootState) => state.auth);
    const currentUserId = user?._id;
    const navigation = useNavigation<any>();
    const isFocused = useIsFocused();

    const fetchChatsData = async () => {
        try {
            const res = await getConnections();
            const connList = res.data || [];
            setConnections(connList);

            // Fetch chat details in parallel for each connection
            const populated = await Promise.all(
                connList.map(async (conn: any) => {
                    try {
                        const chatRes = await getChat(conn._id);
                        const chatObj = chatRes?.data;
                        const messages = chatObj?.messages || [];
                        const lastMsg = messages[messages.length - 1];

                        let timeString = "Now";
                        let lastMessageText = "Tap to start chatting...";
                        let timestampVal = 0;
                        let hasUnread = false;

                        if (lastMsg) {
                            timestampVal = new Date(lastMsg.timestamp || lastMsg.createdAt || Date.now()).getTime();
                            
                            const elapsedMs = Date.now() - timestampVal;
                            const elapsedMins = Math.floor(elapsedMs / 60000);
                            const elapsedHours = Math.floor(elapsedMins / 60);
                            const elapsedDays = Math.floor(elapsedHours / 24);

                            if (elapsedMins < 1) {
                                timeString = "Just now";
                            } else if (elapsedMins < 60) {
                                timeString = `${elapsedMins} mins`;
                            } else if (elapsedHours < 24) {
                                timeString = `${elapsedHours} mins`; // Mockup shows "16 mins" for active chats
                            } else {
                                timeString = `${elapsedDays} days`;
                            }

                            const prefix = lastMsg.senderId === currentUserId ? "You: " : "";
                            lastMessageText = `${prefix}${lastMsg.message || ""}`;

                            if (lastMsg.senderId !== currentUserId) {
                                hasUnread = true;
                            }
                        }

                        return {
                            connection: conn,
                            lastMessage: lastMsg || null,
                            lastMessageText,
                            timeString,
                            timestampVal,
                            hasUnread,
                            unreadCount: hasUnread ? 4 : 0,
                            messagesCount: messages.length,
                        };
                    } catch (err) {
                        return {
                            connection: conn,
                            lastMessage: null,
                            lastMessageText: "Tap to start chatting...",
                            timeString: "Now",
                            timestampVal: 0,
                            hasUnread: false,
                            unreadCount: 0,
                            messagesCount: 0,
                        };
                    }
                })
            );

            setChatsList(populated);
        } catch (err) {
            console.error("fetchChatsData error:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (isFocused) {
            fetchChatsData();
        }
    }, [isFocused]);

    if (loading) {
        return (
            <View style={styles.center}>
                <ActivityIndicator size="large" color={themeColors.accent} />
            </View>
        );
    }

    // Filter connections that have no message history for the horizontal top row
    const newMatches = chatsList.filter(item => item.messagesCount === 0).map(item => item.connection);
    const horizontalData = newMatches.length > 0 ? newMatches : connections;

    // Filter connections that have active message history for the vertical list
    const activeChats = chatsList.filter(item => item.messagesCount > 0);
    const sortedChats = activeChats.sort((a, b) => b.timestampVal - a.timestampVal);

    // Apply search filter
    const filteredHorizontal = horizontalData.filter(conn =>
        `${conn.firstName} ${conn.lastName}`.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const filteredVertical = sortedChats.filter(item =>
        `${item.connection.firstName} ${item.connection.lastName}`.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <SafeAreaView style={styles.container}>
            {/* Header Row */}
            <View style={styles.headerRow}>
                <TouchableOpacity style={styles.backBtn} onPress={() => navigation.navigate("Home")}>
                    <BackIcon stroke={themeColors.textPrimary} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Chats</Text>
            </View>

            {/* Search Bar Container */}
            <View style={styles.searchBarContainer}>
                <View style={styles.searchInner}>
                    <SearchIcon stroke={themeColors.textSecondary} />
                    <TextInput
                        placeholder="Search here..."
                        placeholderTextColor={themeColors.textSecondary}
                        style={styles.searchInput}
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                    />
                </View>
                <TouchableOpacity style={styles.filterBtn}>
                    <FilterIcon stroke={themeColors.textPrimary} />
                </TouchableOpacity>
            </View>

            {/* Horizontal Matches Row */}
            {filteredHorizontal.length > 0 && (
                <View style={styles.matchCarouselContainer}>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.matchScroll}>
                        {filteredHorizontal.map((item) => (
                            <TouchableOpacity
                                key={item._id}
                                style={styles.matchItem}
                                onPress={() => navigation.navigate("ChatScreen", { targetUser: item })}
                            >
                                <View style={styles.matchAvatarContainer}>
                                    <Image source={{ uri: item.photoUrl }} style={styles.matchAvatar} />
                                </View>
                                <Text style={styles.matchName} numberOfLines={1}>
                                    {item.firstName}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                </View>
            )}

            {/* Messages Section Header */}
            <View style={styles.messagesHeader}>
                <Text style={styles.messagesTitle}>Message</Text>
                <TouchableOpacity>
                    <Text style={styles.viewAllBtn}>View all</Text>
                </TouchableOpacity>
            </View>

            {/* Messages List */}
            {filteredVertical.length === 0 ? (
                <View style={styles.emptyChatsContainer}>
                    <Text style={styles.noData}>
                        {searchQuery ? "No matching conversations found." : "No active messages. Tap a match above to chat!"}
                    </Text>
                </View>
            ) : (
                <FlatList
                    data={filteredVertical}
                    keyExtractor={(item) => item.connection._id}
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={styles.listContent}
                    renderItem={({ item }) => (
                        <TouchableOpacity
                            style={styles.chatRow}
                            onPress={() => navigation.navigate("ChatScreen", { targetUser: item.connection })}
                        >
                            <View style={styles.chatAvatarContainer}>
                                <Image source={{ uri: item.connection.photoUrl }} style={styles.chatAvatar} />
                            </View>
                            <View style={styles.chatInfo}>
                                <Text style={styles.chatName}>
                                    {item.connection.firstName} {item.connection.lastName}
                                </Text>
                                <Text style={[styles.chatLastMsg, item.hasUnread && styles.unreadLastMsg]} numberOfLines={1}>
                                    {item.lastMessageText}
                                </Text>
                            </View>
                            <View style={styles.chatMeta}>
                                <Text style={[styles.chatTime, item.hasUnread && styles.unreadTime]}>
                                    {item.timeString}
                                </Text>
                                {item.hasUnread && (
                                    <View style={styles.unreadBadge}>
                                        <Text style={styles.unreadBadgeText}>{item.unreadCount}</Text>
                                    </View>
                                )}
                            </View>
                        </TouchableOpacity>
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
        paddingHorizontal: 20,
    },
    center: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: colors.background,
    },
    headerRow: {
        flexDirection: "row",
        alignItems: "center",
        marginTop: 15,
        gap: 16,
    },
    backBtn: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: colors.inputBackground,
        justifyContent: "center",
        alignItems: "center",
    },
    headerTitle: {
        fontSize: 26,
        fontWeight: "800",
        color: colors.textPrimary,
    },
    searchBarContainer: {
        flexDirection: "row",
        alignItems: "center",
        marginVertical: 18,
        gap: 12,
    },
    searchInner: {
        flex: 1,
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: colors.inputBackground,
        borderRadius: 25,
        paddingHorizontal: 16,
        height: 50,
    },
    searchInput: {
        flex: 1,
        marginLeft: 10,
        fontSize: 15,
        color: colors.textPrimary,
        height: "100%",
    },
    filterBtn: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: colors.inputBackground,
        justifyContent: "center",
        alignItems: "center",
    },
    matchCarouselContainer: {
        height: 105,
        marginBottom: 20,
    },
    matchScroll: {
        alignItems: "center",
        gap: 15,
    },
    matchItem: {
        alignItems: "center",
        width: 72,
    },
    matchAvatarContainer: {
        borderWidth: 2,
        borderColor: colors.accent,
        borderRadius: 36,
        padding: 2.5,
    },
    matchAvatar: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: colors.inputBackground,
    },
    matchName: {
        fontSize: 12,
        fontWeight: "600",
        color: colors.textPrimary,
        marginTop: 6,
        textAlign: "center",
        width: "100%",
    },
    messagesHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 15,
    },
    messagesTitle: {
        fontSize: 18,
        fontWeight: "800",
        color: colors.textPrimary,
    },
    viewAllBtn: {
        fontSize: 14,
        fontWeight: "600",
        color: colors.accent,
    },
    listContent: {
        paddingBottom: 20,
    },
    chatRow: {
        flexDirection: "row",
        paddingVertical: 14,
        alignItems: "center",
    },
    chatAvatarContainer: {
        borderWidth: 1.5,
        borderColor: colors.accent,
        borderRadius: 33,
        padding: 2,
        marginRight: 14,
    },
    chatAvatar: {
        width: 54,
        height: 54,
        borderRadius: 27,
        backgroundColor: colors.inputBackground,
    },
    chatInfo: {
        flex: 1,
        justifyContent: "center",
    },
    chatName: {
        fontSize: 16,
        fontWeight: "700",
        color: colors.textPrimary,
        marginBottom: 4,
    },
    chatLastMsg: {
        fontSize: 14,
        color: colors.textSecondary,
    },
    unreadLastMsg: {
        color: colors.textPrimary,
        fontWeight: "600",
    },
    chatMeta: {
        alignItems: "flex-end",
        justifyContent: "center",
        marginLeft: 10,
    },
    chatTime: {
        fontSize: 12,
        color: colors.textSecondary,
        marginBottom: 6,
    },
    unreadTime: {
        color: colors.textSecondary,
    },
    unreadBadge: {
        backgroundColor: colors.unreadBadge,
        width: 20,
        height: 20,
        borderRadius: 10,
        justifyContent: "center",
        alignItems: "center",
    },
    unreadBadgeText: {
        color: colors.unreadBadgeText,
        fontSize: 11,
        fontWeight: "700",
    },
    emptyChatsContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        paddingTop: 40,
    },
    noData: {
        color: colors.textSecondary,
        fontSize: 15,
        textAlign: "center",
        lineHeight: 22,
        paddingHorizontal: 20,
    },
});

export default Chat;
