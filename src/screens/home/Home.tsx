import React, { useEffect, useState, useRef } from "react";
import {
    Text,
    View,
    StyleSheet,
    Image,
    Dimensions,
    Animated,
    PanResponder,
    TouchableOpacity,
    ActivityIndicator,
    Alert
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { getFeed } from "../../api/userApi";
import { sendRequestStatus } from "../../api/requestApi";
import { colors } from "../../utils/colors";

const { width, height } = Dimensions.get("window");
const SWIPE_THRESHOLD = 0.25 * width;

const Home = () => {
    const [feed, setFeed] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentIndex, setCurrentIndex] = useState(0);
    console.log(feed, 'asdjnajnajndjas')

    const position = useRef(new Animated.ValueXY()).current;

    const fetchFeed = async () => {
        try {
            setLoading(true);
            const res = await getFeed();
            setFeed(res.data || []);
            setCurrentIndex(0);
        } catch (err) {
            console.error("Failed to fetch feed", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchFeed();
    }, []);

    const panResponder = useRef(
        PanResponder.create({
            onStartShouldSetPanResponder: () => true,
            onPanResponderMove: (evt, gestureState) => {
                console.log(feed, "chekc the jjjj")
                position.setValue({ x: gestureState.dx, y: gestureState.dy });
            },
            onPanResponderRelease: (evt, gestureState) => {


                if (gestureState.dx > SWIPE_THRESHOLD) {
                    forceSwipe("right");
                } else if (gestureState.dx < -SWIPE_THRESHOLD) {
                    forceSwipe("left");
                } else {
                    resetPosition();
                }
            }
        })
    ).current;

    const resetPosition = () => {
        Animated.spring(position, {
            toValue: { x: 0, y: 0 },
            useNativeDriver: false
        }).start();
    };

    const forceSwipe = (direction: "right" | "left") => {
        const x = direction === "right" ? width + 100 : -width - 100;
        Animated.timing(position, {
            toValue: { x, y: 0 },
            duration: 250,
            useNativeDriver: false
        }).start(() => onSwipeComplete(direction));
    };

    const onSwipeComplete = async (direction: "right" | "left") => {
        console.log(feed, 'check feed index 1')
        const user = feed[currentIndex];

        const status = direction === "right" ? "interested" : "ignored";

        // Dispatch background API call
        try {
            await sendRequestStatus(status, user._id);
        } catch (err: any) {
            console.error("Failed to send swipe status to backend", err);
        }

        position.setValue({ x: 0, y: 0 });
        setCurrentIndex((prevIndex) => prevIndex + 1);
    };

    const getCardStyle = () => {
        const rotate = position.x.interpolate({
            inputRange: [-width * 1.5, 0, width * 1.5],
            outputRange: ["-30deg", "0deg", "30deg"]
        });

        return {
            ...position.getLayout(),
            transform: [{ rotate }]
        };
    };

    const renderLikeDislikeBadges = () => {
        const likeOpacity = position.x.interpolate({
            inputRange: [0, 150],
            outputRange: [0, 1],
            extrapolate: "clamp"
        });

        const nopeOpacity = position.x.interpolate({
            inputRange: [-150, 0],
            outputRange: [1, 0],
            extrapolate: "clamp"
        });

        return (
            <>
                <Animated.View style={[styles.badgeContainer, styles.likeBadge, { opacity: likeOpacity }]}>
                    <Text style={[styles.badgeText, { color: "#4CAF50" }]}>LIKE</Text>
                </Animated.View>
                <Animated.View style={[styles.badgeContainer, styles.nopeBadge, { opacity: nopeOpacity }]}>
                    <Text style={[styles.badgeText, { color: "#F44336" }]}>NOPE</Text>
                </Animated.View>
            </>
        );
    };

    const renderCards = () => {
        if (currentIndex >= feed.length) {
            return (
                <View style={styles.noMoreCards}>
                    <Text style={styles.noMoreText}>🎉 No more profiles found!</Text>
                    <TouchableOpacity style={styles.refreshBtn} onPress={fetchFeed}>
                        <Text style={styles.refreshText}>Refresh Feed</Text>
                    </TouchableOpacity>
                </View>
            );
        }

        return feed
            .map((item, index) => {
                if (index < currentIndex) {
                    return null;
                }

                if (index === currentIndex) {
                    return (
                        <Animated.View
                            key={item._id}
                            style={[getCardStyle(), styles.cardStyle, { zIndex: 99 }]}
                            {...panResponder.panHandlers}
                        >
                            {renderLikeDislikeBadges()}
                            <Image source={{ uri: item.photoUrl }} style={styles.cardImage} />
                            <View style={styles.cardInfo}>
                                <Text style={styles.nameText}>
                                    {item.firstName} {item.lastName}, {item.age || 22}
                                </Text>
                                <Text style={styles.genderText}>
                                    {item.gender ? item.gender.toUpperCase() : "DEVELOPER"}
                                </Text>
                                <Text style={styles.aboutText} numberOfLines={2}>
                                    {item.about || "Excited to connect and build awesome projects!"}
                                </Text>
                                {item.skills && item.skills.length > 0 && (
                                    <View style={styles.skillsRow}>
                                        {item.skills.slice(0, 3).map((skill: string, idx: number) => (
                                            <View key={idx} style={styles.skillBadge}>
                                                <Text style={styles.skillText}>{skill}</Text>
                                            </View>
                                        ))}
                                    </View>
                                )}
                            </View>
                        </Animated.View>
                    );
                }

                // Render background cards with slight scale/offset to make it look stacked
                const stackOffset = (index - currentIndex) * 10;
                return (
                    <Animated.View
                        key={item._id}
                        style={[
                            styles.cardStyle,
                            {
                                top: stackOffset,
                                zIndex: 10 - index,
                                transform: [{ scale: 1 - (index - currentIndex) * 0.05 }]
                            }
                        ]}
                    >
                        <Image source={{ uri: item.photoUrl }} style={styles.cardImage} />
                        <View style={styles.cardInfo}>
                            <Text style={styles.nameText}>
                                {item.firstName} {item.lastName}, {item.age || 22}
                            </Text>
                        </View>
                    </Animated.View>
                );
            })
            .reverse();
    };

    if (loading) {
        return (
            <SafeAreaView style={styles.center}>
                <ActivityIndicator size="large" color={colors.accent} />
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>DevTinder</Text>
            </View>

            <View style={styles.deckContainer}>{renderCards()}</View>

            {currentIndex < feed.length && (
                <View style={styles.buttonsContainer}>
                    <TouchableOpacity style={[styles.circleBtn, styles.nopeBtn]} onPress={() => forceSwipe("left")}>
                        <Text style={styles.btnIcon}>❌</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.circleBtn, styles.likeBtn]} onPress={() => forceSwipe("right")}>
                        <Text style={styles.btnIcon}>❤️</Text>
                    </TouchableOpacity>
                </View>
            )}
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#f5f7fa",
    },
    header: {
        height: 60,
        justifyContent: "center",
        alignItems: "center",
        borderBottomWidth: 1,
        borderBottomColor: "#eee",
        backgroundColor: "white",
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: "bold",
        color: colors.accent || "#FF6B6B",
        letterSpacing: 1,
    },
    center: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#f5f7fa",
    },
    deckContainer: {
        flex: 1,
        marginTop: 20,
        marginBottom: 20,
        alignItems: "center",
    },
    cardStyle: {
        position: "absolute",
        width: width * 0.9,
        height: height * 0.62,
        borderRadius: 20,
        backgroundColor: "white",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.15,
        shadowRadius: 10,
        elevation: 5,
        overflow: "hidden",
    },
    cardImage: {
        flex: 1,
        width: "100%",
        height: "100%",
        backgroundColor: "#e1e4e8",
    },
    cardInfo: {
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        padding: 20,
        backgroundColor: "rgba(0,0,0,0.45)",
    },
    nameText: {
        fontSize: 22,
        fontWeight: "bold",
        color: "white",
    },
    genderText: {
        fontSize: 12,
        fontWeight: "700",
        color: "#ddd",
        marginTop: 2,
    },
    aboutText: {
        fontSize: 14,
        color: "#eee",
        marginTop: 6,
        lineHeight: 18,
    },
    skillsRow: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 6,
        marginTop: 10,
    },
    skillBadge: {
        backgroundColor: colors.accent || "#FF6B6B",
        paddingVertical: 4,
        paddingHorizontal: 10,
        borderRadius: 12,
    },
    skillText: {
        color: "white",
        fontSize: 11,
        fontWeight: "bold",
    },
    buttonsContainer: {
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        gap: 40,
        marginBottom: 25,
    },
    circleBtn: {
        width: 65,
        height: 65,
        borderRadius: 32.5,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "white",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 5 },
        shadowOpacity: 0.15,
        shadowRadius: 5,
        elevation: 3,
    },
    nopeBtn: {
        borderWidth: 2,
        borderColor: "#F44336",
    },
    likeBtn: {
        borderWidth: 2,
        borderColor: "#4CAF50",
    },
    btnIcon: {
        fontSize: 24,
    },
    noMoreCards: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        width: width * 0.9,
    },
    noMoreText: {
        fontSize: 18,
        fontWeight: "600",
        color: "#666",
        textAlign: "center",
    },
    refreshBtn: {
        marginTop: 20,
        backgroundColor: colors.accent || "#FF6B6B",
        paddingVertical: 12,
        paddingHorizontal: 30,
        borderRadius: 25,
    },
    refreshText: {
        color: "white",
        fontWeight: "bold",
        fontSize: 16,
    },
    badgeContainer: {
        position: "absolute",
        top: 40,
        borderWidth: 4,
        borderRadius: 8,
        paddingHorizontal: 15,
        paddingVertical: 5,
        zIndex: 100,
    },
    likeBadge: {
        left: 40,
        borderColor: "#4CAF50",
        transform: [{ rotate: "-15deg" }]
    },
    nopeBadge: {
        right: 40,
        borderColor: "#F44336",
        transform: [{ rotate: "15deg" }]
    },
    badgeText: {
        fontSize: 32,
        fontWeight: "800",
    }
});

export default Home;