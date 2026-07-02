// src/screens/home/Home.tsx
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
import { getFeed } from "../api/userApi";
import { sendRequestStatus } from "../api/requestApi";
import Svg, { Path, Circle, Defs, LinearGradient as SvgLinearGradient, Rect, Stop } from "react-native-svg";
import { useTheme } from "../../../shared/utils/colors";
import NoFeedsIcon from "../../../shared/assets/svg/no_feeds.svg";
import VerifiedIcon from "../../../shared/assets/svg/verified.svg";
import NopeIconSvg from "../../../shared/assets/svg/nope.svg";
import LikeIconSvg from "../../../shared/assets/svg/like.svg";

const { width, height } = Dimensions.get("window");
const CARD_WIDTH = width * 0.92;
const CARD_HEIGHT = height * 0.70;
const BUTTON_CONTAINER_TOP = CARD_HEIGHT - 34;
const SWIPE_THRESHOLD = 0.25 * width;

const GradientOverlay = () => (
    <View style={StyleSheet.absoluteFill}>
        <Svg width="100%" height="100%">
            <Defs>
                <SvgLinearGradient id="topGrad" x1="0" y1="0" x2="0" y2="1">
                    <Stop offset="0%" stopColor="#000000" stopOpacity="0.45" />
                    <Stop offset="40%" stopColor="#000000" stopOpacity="0.2" />
                    <Stop offset="100%" stopColor="#000000" stopOpacity="0" />
                </SvgLinearGradient>
            </Defs>
            <Rect width="100%" height="100%" fill="url(#topGrad)" />
        </Svg>
    </View>
);

const VerifiedBadge = () => (
    <VerifiedIcon style={{ marginLeft: 6 }} />
);



const NopeIcon = () => (
    <NopeIconSvg />
);

const LikeIcon = () => (
    <LikeIconSvg />
);

const Home = () => {
    const { colors: themeColors, isDark } = useTheme();
    const styles = getStyles(themeColors);
    const [feed, setFeed] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentIndex, setCurrentIndex] = useState(0);

    const feedRef = useRef(feed);
    const currentIndexRef = useRef(currentIndex);

    useEffect(() => {
        feedRef.current = feed;
    }, [feed]);

    useEffect(() => {
        currentIndexRef.current = currentIndex;
    }, [currentIndex]);

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
            friction: 5,
            tension: 40,
            useNativeDriver: true
        }).start();
    };

    const forceSwipe = (direction: "right" | "left") => {
        const x = direction === "right" ? width + 120 : -width - 120;
        Animated.spring(position, {
            toValue: { x, y: 0 },
            bounciness: 10,
            speed: 15,
            useNativeDriver: true
        }).start(() => onSwipeComplete(direction));
    };

    const onSwipeComplete = async (direction: "right" | "left") => {
        const currentFeed = feedRef.current;
        const index = currentIndexRef.current;
        const user = currentFeed[index];
        if (!user) return;

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
            outputRange: ["-15deg", "0deg", "15deg"]
        });

        return {
            transform: [
                { translateX: position.x },
                { translateY: position.y },
                { rotate }
            ]
        };
    };

    const renderLikeDislikeBadges = () => {
        const likeOpacity = position.x.interpolate({
            inputRange: [0, 100],
            outputRange: [0, 1],
            extrapolate: "clamp"
        });

        const nopeOpacity = position.x.interpolate({
            inputRange: [-100, 0],
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
                    <NoFeedsIcon width={280} height={280} style={{ marginBottom: 20 }} />
                    {/* <Text style={styles.noMoreText}>🎉 No more profiles found!</Text> */}
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

                const isCurrent = index === currentIndex;
                const statusText = item.skills?.[0]
                    ? `💻 ${item.skills[0]} Developer`
                    : "👋 Looking casually";

                const cardView = (
                    <>
                        {isCurrent && renderLikeDislikeBadges()}
                        <Image source={{ uri: item.photoUrl }} style={styles.cardImage} resizeMode="cover" />

                        {isCurrent && (
                            <>
                                {/* <GradientOverlay /> */}

                                {/* Overlay text at the top left of the card */}
                                <View style={styles.cardHeader}>
                                    <View style={styles.nameRow}>
                                        <Text style={styles.nameText}>
                                            {item.firstName} {item.lastName}
                                        </Text>
                                        <VerifiedBadge />
                                    </View>
                                    <View style={styles.statusPill}>
                                        <Text style={styles.statusText}>{statusText}</Text>
                                    </View>
                                </View>

                                {/* Vertical pagination dots indicator inside card */}
                                <View style={styles.paginationContainer}>
                                    <View style={[styles.dot, styles.activeDot]} />
                                    <View style={styles.dot} />
                                    <View style={styles.dot} />
                                </View>
                            </>
                        )}
                    </>
                );

                if (isCurrent) {
                    return (
                        <Animated.View
                            key={item._id}
                            style={[getCardStyle(), styles.cardStyle, { zIndex: 99 }]}
                            {...panResponder.panHandlers}
                        >
                            {cardView}
                        </Animated.View>
                    );
                }

                // Render background stacked cards
                const diff = index - currentIndex;
                //to do size small and big
                const scale = position.x.interpolate({
                    inputRange: [-width / 2, 0, width / 2],
                    outputRange: [1 - (diff - 1) * 0.045, 1 - diff * 0.045, 1 - (diff - 1) * 0.045],
                    extrapolate: "clamp"
                });

                const translateY = position.x.interpolate({
                    inputRange: [-width / 2, 0, width / 2],
                    outputRange: [-(diff - 1) * 12, -diff * 12, -(diff - 1) * 12],
                    extrapolate: "clamp"
                });

                return (
                    <Animated.View
                        key={item._id}
                        style={[
                            styles.cardStyle,
                            {
                                zIndex: 10 - index,
                                transform: [
                                    { scale },
                                    { translateY }
                                ]
                            }
                        ]}
                    >
                        {cardView}
                    </Animated.View>
                );
            })
            .reverse();
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
            <Text style={styles.header}>My Connections</Text>
            <View style={styles.deckContainer}>
                {renderCards()}

                {/* Floating buttons stacked overlapping the card bottom */}
                {currentIndex < feed.length && (
                    <View style={styles.buttonsContainer}>
                        <TouchableOpacity style={[styles.circleBtn, styles.nopeBtn]} onPress={() => forceSwipe("left")}>
                            <NopeIcon />
                        </TouchableOpacity>
                        <TouchableOpacity style={[styles.circleBtn, styles.likeBtn]} onPress={() => forceSwipe("right")}>
                            <LikeIcon />
                        </TouchableOpacity>
                    </View>
                )}
            </View>
        </SafeAreaView>
    );
};

const getStyles = (colors: any) => StyleSheet.create({
    container: {
        flex: 1,
        // padding: 10,
        backgroundColor: colors.background,
    },
    header: {
        padding: 16,
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
    deckContainer: {
        flex: 1,
        alignItems: "center",
        justifyContent: "flex-start",
        marginTop: 40,
    },
    cardStyle: {
        position: "absolute",
        width: CARD_WIDTH,
        height: CARD_HEIGHT,
        left: (width - CARD_WIDTH) / 2,
        top: 0,
        borderRadius: 32,
        backgroundColor: colors.cardBackground,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 12 },
        shadowOpacity: colors.isDark ? 0.3 : 0.08,
        shadowRadius: 18,
        elevation: 6,
        overflow: "hidden",
    },
    cardImage: {
        width: "100%",
        height: "100%",
    },
    cardHeader: {
        position: "absolute",
        top: 25,
        left: 25,
        zIndex: 10,
    },
    nameRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
    },
    nameText: {
        fontSize: 26,
        fontWeight: "800",
        color: "#ffffff",
        textShadowColor: "rgba(0,0,0,0.35)",
        textShadowOffset: { width: 0, height: 1 },
        textShadowRadius: 4,
    },
    statusPill: {
        backgroundColor: "rgba(17, 17, 17, 0.4)",
        borderRadius: 20,
        paddingHorizontal: 14,
        paddingVertical: 7,
        marginTop: 10,
        alignSelf: "flex-start",
    },
    statusText: {
        fontSize: 13,
        fontWeight: "600",
        color: "#ffffff",
    },
    paginationContainer: {
        position: "absolute",
        right: 18,
        top: "40%",
        zIndex: 10,
        gap: 6,
        alignItems: "center",
    },
    dot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: "rgba(255, 255, 255, 0.4)",
    },
    activeDot: {
        height: 20,
        backgroundColor: "#ffffff",
    },
    buttonsContainer: {
        position: "absolute",
        top: BUTTON_CONTAINER_TOP,
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        width: "100%",
        zIndex: 100,
        gap: 16,
    },
    circleBtn: {
        backgroundColor: colors.cardBackground,
        justifyContent: "center",
        alignItems: "center",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: colors.isDark ? 0.25 : 0.12,
        shadowRadius: 12,
        elevation: 6,
    },

    nopeBtn: {
        width: 68,
        height: 68,
        borderRadius: 34,
    },
    likeBtn: {
        width: 68,
        height: 68,
        borderRadius: 34,
    },
    noMoreCards: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        width: width * 0.9,
        paddingTop: height * 0.2,
    },
    noMoreText: {
        fontSize: 20,
        fontWeight: "700",
        color: colors.textPrimary,
        textAlign: "center",
    },
    refreshBtn: {
        marginTop: 20,
        backgroundColor: colors.accent,
        paddingVertical: 14,
        paddingHorizontal: 36,
        borderRadius: 30,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 6,
        elevation: 3,
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