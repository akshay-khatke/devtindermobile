import React from "react";
import { Text } from "react-native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createStackNavigator } from "@react-navigation/stack";
import Home from "../screens/home/Home";
import Connections from "../screens/connections/Connections";
import Requests from "../screens/requests/Requests";
import Chat from "../screens/chat/Chat";
import Profile from "../screens/profile/Profile";
import ChatScreen from "../screens/chat/ChatScreen";
import { colors } from "../utils/colors";
import Svg, { Path, Circle } from "react-native-svg";

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

function TabNavigator() {
    const themeColors = {
        accent: colors.accent || "#FF6B6B",
        textMuted: "gray",
        textPrimary: "#000",
        tabBarBg: "white",
        tabBarBorder: "#eee"
    };

    return (
        <Tab.Navigator
            screenOptions={({ route }) => ({
                tabBarIcon: ({ focused }) => {
                    const color = focused ? themeColors.accent : themeColors.textMuted;
                    
                    if (route.name === "Home") {
                        return (
                            <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
                                <Path
                                    d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
                                    stroke={color}
                                    strokeWidth={2}
                                    fill={focused ? color : "none"}
                                />
                                <Path
                                    d="M18.5 13.5l-.65-.6c-2.28-2.07-3.8-3.45-3.8-5.15 0-1.38 1.08-2.45 2.45-2.45.78 0 1.53.36 2 1 .47-.64 1.22-1 2-1 1.37 0 2.45 1.07 2.45 2.45 0 1.7-1.52 3.08-3.8 5.15l-.65.6z"
                                    stroke={focused ? themeColors.tabBarBg : color}
                                    strokeWidth={1.5}
                                    fill={focused ? themeColors.accent : themeColors.tabBarBg}
                                />
                            </Svg>
                        );
                    } else if (route.name === "Connections") {
                        return (
                            <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
                                <Circle cx={12} cy={12} r={7} stroke={color} strokeWidth={2} />
                                <Circle cx={12} cy={12} r={2.5} fill={color} />
                                <Path d="M12 2v3M12 19v3M2 12h3M19 12h3" stroke={color} strokeWidth={2} strokeLinecap="round" />
                            </Svg>
                        );
                    } else if (route.name === "Chat") {
                        return (
                            <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
                                <Path
                                    d="M12 17c.9 0 1.7-.2 2.5-.5l3 1c.5.2.9-.2.8-.7l-.7-2.3c.5-.7.9-1.6.9-2.5 0-3.3-2.7-6-6-6s-6 2.7-6 6 2.7 6 6 6z"
                                    stroke={color}
                                    strokeWidth={2}
                                    fill={focused ? color : "none"}
                                    strokeLinejoin="round"
                                />
                                <Path
                                    d="M16 7h1c2.2 0 4 1.8 4 4 0 .9-.3 1.7-.8 2.3l.6 1.7c.1.3-.2.5-.4.4l-1.7-.6c-.5.4-1.2.6-1.9.6"
                                    stroke={color}
                                    strokeWidth={1.8}
                                    strokeLinecap="round"
                                />
                            </Svg>
                        );
                    } else if (route.name === "Requests") {
                        return (
                            <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
                                <Path
                                    d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"
                                    stroke={color}
                                    strokeWidth={2}
                                    fill={focused ? color : "none"}
                                    strokeLinejoin="round"
                                />
                            </Svg>
                        );
                    } else if (route.name === "Profile") {
                        return (
                            <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
                                <Circle cx={12} cy={12} r={9} stroke={color} strokeWidth={2} />
                                <Path
                                    d="M8 13.5a4.5 4.5 0 008 0"
                                    stroke={color}
                                    strokeWidth={2}
                                    strokeLinecap="round"
                                />
                                <Circle cx={8.5} cy={9.5} r={1.2} fill={color} />
                                <Circle cx={15.5} cy={9.5} r={1.2} fill={color} />
                            </Svg>
                        );
                    }
                    return null;
                },
                tabBarActiveTintColor: themeColors.textPrimary,
                tabBarInactiveTintColor: themeColors.textMuted,
                tabBarLabelStyle: {
                    fontSize: 10,
                    fontWeight: "600",
                    marginTop: 4,
                },
                tabBarStyle: {
                    backgroundColor: themeColors.tabBarBg,
                    borderTopWidth: 1,
                    borderTopColor: themeColors.tabBarBorder,
                    paddingBottom: 22,
                    paddingTop: 10,
                    height: 80,
                    shadowColor: "#000",
                    shadowOffset: { width: 0, height: -4 },
                    shadowOpacity: 0.03,
                    shadowRadius: 10,
                    elevation: 5,
                },
                headerShown: false,
            })}
        >
            <Tab.Screen name="Home" component={Home} options={{ tabBarLabel: "Home" }} />
            <Tab.Screen name="Connections" component={Connections} options={{ tabBarLabel: "Nearby" }} />
            <Tab.Screen name="Chat" component={Chat} options={{ tabBarLabel: "Chats" }} />
            <Tab.Screen name="Requests" component={Requests} options={{ tabBarLabel: "My Fans" }} />
            <Tab.Screen name="Profile" component={Profile} options={{ tabBarLabel: "Profile" }} />
        </Tab.Navigator>
    );
}

function AppStack() {
    return (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="TabNavigator" component={TabNavigator} />
            <Stack.Screen name="ChatScreen" component={ChatScreen} />
        </Stack.Navigator>
    );
}

export default AppStack;
