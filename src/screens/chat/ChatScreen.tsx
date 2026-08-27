import React, { useEffect, useState, useRef } from "react";
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TextInput,
    TouchableOpacity,
    Image,
    KeyboardAvoidingView,
    Platform,
    ActivityIndicator,
    Alert
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRoute, useNavigation } from "@react-navigation/native";
import { useSelector } from "react-redux";
import { io, Socket } from "socket.io-client";
import { RootState } from "../../redux/store";
import { getChat } from "../../api/chatApi";
import { BASE_URL } from "../../constants/baseUrl";
import { colors } from "../../utils/colors";
import Svg, { Path, Circle, Rect } from "react-native-svg";

interface IMessage {
    _id?: string;
    senderId: string;
    message: string;
    firstName?: string;
    timestamp: string | Date;
}

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

const PhoneIcon = ({ stroke }: { stroke: string }) => (
    <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
        <Path
            d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z"
            stroke={stroke}
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
        />
    </Svg>
);

const VideoIcon = ({ stroke }: { stroke: string }) => (
    <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
        <Path
            d="M23 7l-7 5 7 5V7z"
            stroke={stroke}
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
        />
        <Rect x={1} y={5} width={15} height={14} rx={2} ry={2} stroke={stroke} strokeWidth={2} />
    </Svg>
);

const PlusIcon = ({ stroke }: { stroke: string }) => (
    <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
        <Path
            d="M12 5v14M5 12h14"
            stroke={stroke}
            strokeWidth={2.5}
            strokeLinecap="round"
            strokeLinejoin="round"
        />
    </Svg>
);

const SendIcon = ({ fill }: { fill: string }) => (
    <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
        <Path
            d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"
            stroke={fill}
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
        />
    </Svg>
);

const formatMessageTime = (timestamp: string | Date) => {
    try {
        const date = new Date(timestamp);
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch (e) {
        return "";
    }
};

const getHeaderDateString = (date: Date) => {
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
        return "Today";
    } else if (date.toDateString() === yesterday.toDateString()) {
        return "Yesterday";
    } else {
        return date.toLocaleDateString([], { month: "long", day: "numeric", year: "numeric" });
    }
};

const getGroupedChatItems = (flatMessages: IMessage[]): any[] => {
    const items: any[] = [];
    let lastDateStr = "";

    flatMessages.forEach((msg, idx) => {
        const msgDate = new Date(msg.timestamp);
        const dateStr = getHeaderDateString(msgDate);

        if (dateStr !== lastDateStr) {
            items.push({
                _id: `header-${dateStr}-${idx}`,
                isHeader: true,
                dateText: dateStr
            });
            lastDateStr = dateStr;
        }

        items.push({
            ...msg,
            isHeader: false
        });
    });

    return items;
};

const ChatScreen = () => {
    const themeColors = {
        accent: colors.accent || "#FF6B6B",
        textMuted: "gray",
        textPrimary: "#000",
        textSecondary: "#666",
        background: "#f5f7fa",
        inputBackground: "#eef1f4",
        tabBarBg: "white",
        tabBarBorder: "#eee",
        unreadBadge: "#FF6B6B",
        unreadBadgeText: "white",
        cardBackground: "white",
        border: "#eee",
        divider: "#eee",
        isDark: false
    };

    const styles = getStyles(themeColors);
    const route = useRoute<any>();
    const navigation = useNavigation<any>();
    const { targetUser } = route.params;

    const { user } = useSelector((state: RootState) => state.auth);
    const [messages, setMessages] = useState<IMessage[]>([]);
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(true);

    const socketRef = useRef<Socket | null>(null);
    const flatListRef = useRef<FlatList | null>(null);

    useEffect(() => {
        fetchChatHistory();

        console.log("Initializing socket connection to:", BASE_URL);
        console.log("Current User ID:", user?._id, "Target User ID:", targetUser._id);

        const socket = io(BASE_URL);
        socketRef.current = socket;

        const joinRoom = () => {
            console.log("Emitting joinChat for room...");
            socket.emit("joinChat", {
                firstName: user?.firstName || "Me",
                userId: user?._id,
                targetUserId: targetUser._id
            });
        };

        if (socket.connected) {
            joinRoom();
        }

        socket.on("connect", () => {
            console.log("Connected to Chat Server via Socket successfully");
            joinRoom();
        });

        socket.on("connect_error", (err) => {
            console.error("Socket Connection Error:", err.message, err);
            Alert.alert("Socket Connection Error", `Failed to connect: ${err.message}`);
        });

        socket.on("error", (err: any) => {
            console.error("Socket Backend Error:", err.message || err);
            Alert.alert("Chat Error", err.message || "Failed to transmit message");
        });

        socket.on("messageReceived", (data: any) => {
            console.log("Socket messageReceived event triggered:", data);
            const newMsg: IMessage = {
                senderId: data.senderId,
                message: data.textMessage,
                firstName: data.firstName,
                timestamp: data.timestamp
            };
            setMessages((prev) => [...prev, newMsg]);
        });

        return () => {
            if (socket) {
                socket.disconnect();
            }
        };
    }, [targetUser._id, user?._id, user?.firstName]);


    const fetchChatHistory = async () => {
        try {
            const res = await getChat(targetUser._id);
            if (res?.success && res.data?.messages) {
                const mappedMsgs = res.data.messages.map((m: any) => ({
                    _id: m._id,
                    senderId: typeof m.senderId === "object" ? m.senderId._id : m.senderId,
                    message: m.message,
                    firstName: typeof m.senderId === "object" ? m.senderId.firstName : "",
                    timestamp: m.createdAt || new Date()
                }));
                setMessages(mappedMsgs);
            }
        } catch (err) {
            console.error("Failed to load chat history", err);
        } finally {
            setLoading(false);
        }
    };


    const handleSend = () => {
        if (!input.trim() || !socketRef.current) return;

        socketRef.current.emit("sendMessage", {
            firstName: user?.firstName || "Me",
            userId: user?._id,
            targetUserId: targetUser._id,
            textMessage: input.trim()
        });

        setInput("");
    };

    if (loading) {
        return (
            <SafeAreaView style={styles.center}>
                <ActivityIndicator size="large" color={themeColors.accent} />
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <BackIcon stroke={themeColors.textPrimary} />
                </TouchableOpacity>
                <View style={styles.avatarContainer}>
                    <Image source={{ uri: targetUser.photoUrl }} style={styles.avatar} />
                    <View style={styles.onlineDot} />
                </View>
                <View style={styles.headerInfo}>
                    <Text style={styles.name}>{targetUser.firstName} {targetUser.lastName}</Text>
                    <Text style={styles.status}>Online</Text>
                </View>
                <View style={styles.headerActions}>
                    <TouchableOpacity style={styles.headerActionBtn}>
                        <PhoneIcon stroke={themeColors.textSecondary} />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.headerActionBtn}>
                        <VideoIcon stroke={themeColors.textSecondary} />
                    </TouchableOpacity>
                </View>
            </View>

            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : undefined}
                style={{ flex: 1 }}
                keyboardVerticalOffset={Platform.OS === "ios" ? 10 : 0}
            >
                <FlatList
                    ref={flatListRef}
                    data={getGroupedChatItems(messages)}
                    keyExtractor={(item) => item._id}
                    onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
                    onLayout={() => flatListRef.current?.scrollToEnd({ animated: true })}
                    renderItem={({ item }) => {
                        if (item.isHeader) {
                            return (
                                <View style={styles.dateHeaderContainer}>
                                    <View style={styles.dateHeaderBadge}>
                                        <Text style={styles.dateHeaderText}>{item.dateText}</Text>
                                    </View>
                                </View>
                            );
                        }

                        const isSelf = item.senderId === user?._id;
                        const timeStr = formatMessageTime(item.timestamp);
                        return (
                            <View style={[styles.messageWrapper, isSelf ? styles.selfWrapper : styles.otherWrapper]}>
                                <View style={[styles.messageBubble, isSelf ? styles.selfBubble : styles.otherBubble]}>
                                    <Text style={[styles.messageText, isSelf ? styles.selfText : styles.otherText]}>
                                        {item.message}
                                    </Text>
                                </View>
                                {timeStr ? <Text style={styles.timeText}>{timeStr}</Text> : null}
                            </View>
                        );
                    }}
                    contentContainerStyle={styles.listContainer}
                />

                <View style={styles.inputBar}>
                    <TouchableOpacity style={styles.attachBtn}>
                        <PlusIcon stroke={themeColors.textSecondary} />
                    </TouchableOpacity>
                    <TextInput
                        placeholder="Type a message..."
                        placeholderTextColor={themeColors.textSecondary}
                        style={styles.textInput}
                        value={input}
                        onChangeText={setInput}
                        multiline
                    />
                    <TouchableOpacity style={styles.sendBtn} onPress={handleSend}>
                        <SendIcon fill="#ffffff" />
                    </TouchableOpacity>
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

const getStyles = (colors: any) => StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    center: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: colors.background,
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: colors.cardBackground,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: colors.isDark ? 0.25 : 0.03,
        shadowRadius: 5,
        elevation: 2,
    },
    backBtn: {
        paddingRight: 10,
        height: 40,
        justifyContent: "center",
    },
    avatarContainer: {
        position: "relative",
    },
    avatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: colors.inputBackground,
    },
    onlineDot: {
        position: "absolute",
        bottom: 0,
        right: 0,
        width: 11,
        height: 11,
        borderRadius: 5.5,
        backgroundColor: "#3BCE5B",
        borderWidth: 2,
        borderColor: colors.cardBackground,
    },
    headerInfo: {
        marginLeft: 12,
        flex: 1,
    },
    name: {
        fontSize: 16,
        fontWeight: "700",
        color: colors.textPrimary,
        letterSpacing: -0.2,
    },
    status: {
        fontSize: 12,
        color: "#3BCE5B",
        fontWeight: "500",
        marginTop: 2,
    },
    headerActions: {
        flexDirection: "row",
        alignItems: "center",
        gap: 14,
    },
    headerActionBtn: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: colors.inputBackground,
        justifyContent: "center",
        alignItems: "center",
    },
    listContainer: {
        padding: 16,
        paddingBottom: 24,
    },
    messageWrapper: {
        marginBottom: 16,
        maxWidth: "80%",
    },
    selfWrapper: {
        alignSelf: "flex-end",
        alignItems: "flex-end",
    },
    otherWrapper: {
        alignSelf: "flex-start",
        alignItems: "flex-start",
    },
    messageBubble: {
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderRadius: 18,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowRadius: 2,
    },
    selfBubble: {
        backgroundColor: colors.accent,
        borderBottomRightRadius: 4,
        shadowOpacity: colors.isDark ? 0.2 : 0.05,
        elevation: 1,
    },
    otherBubble: {
        backgroundColor: colors.cardBackground,
        borderBottomLeftRadius: 4,
        shadowOpacity: colors.isDark ? 0.3 : 0.08,
        elevation: 1.5,
        borderWidth: 1,
        borderColor: colors.divider,
    },
    messageText: {
        fontSize: 15,
        lineHeight: 21,
    },
    selfText: {
        color: "#ffffff",
    },
    otherText: {
        color: colors.textPrimary,
    },
    timeText: {
        fontSize: 10,
        color: colors.textMuted,
        marginTop: 4,
        paddingHorizontal: 4,
    },
    inputBar: {
        flexDirection: "row",
        alignItems: "center",
        marginHorizontal: 16,
        marginBottom: Platform.OS === "ios" ? 12 : 16,
        paddingHorizontal: 8,
        paddingVertical: 6,
        backgroundColor: colors.cardBackground,
        borderRadius: 28,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: colors.isDark ? 0.35 : 0.08,
        shadowRadius: 8,
        elevation: 4,
        borderWidth: 1,
        borderColor: colors.border,
    },
    attachBtn: {
        width: 36,
        height: 36,
        borderRadius: 18,
        justifyContent: "center",
        alignItems: "center",
    },
    textInput: {
        flex: 1,
        minHeight: 38,
        maxHeight: 100,
        paddingHorizontal: 12,
        paddingVertical: 8,
        fontSize: 15,
        color: colors.textPrimary,
    },
    sendBtn: {
        width: 38,
        height: 38,
        borderRadius: 19,
        backgroundColor: colors.accent,
        justifyContent: "center",
        alignItems: "center",
        marginLeft: 6,
    },
    dateHeaderContainer: {
        alignItems: "center",
        marginVertical: 14,
        width: "100%",
    },
    dateHeaderBadge: {
        backgroundColor: colors.isDark ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.05)",
        paddingVertical: 5,
        paddingHorizontal: 14,
        borderRadius: 10,
    },
    dateHeaderText: {
        fontSize: 11,
        fontWeight: "700",
        color: colors.textSecondary,
        textTransform: "uppercase",
    },
});

export default ChatScreen;
