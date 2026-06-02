import React from "react";
import { Text } from "react-native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import Home from "../screens/home/Home";
import Connections from "../screens/connections/Connections";
import Requests from "../screens/requests/Requests";
import Chat from "../screens/chat/Chat";
import Profile from "../screens/profile/Profile";
import { colors } from "../utils/colors";

const Tab = createBottomTabNavigator();

function AppStack() {
    return (
        <Tab.Navigator
            screenOptions={({ route }) => ({
                tabBarIcon: ({ focused }) => {
                    let icon = "🏠";
                    if (route.name === "Home") icon = "🏠";
                    else if (route.name === "Connections") icon = "👥";
                    else if (route.name === "Requests") icon = "✉️";
                    else if (route.name === "Chat") icon = "💬";
                    else if (route.name === "Profile") icon = "👤";

                    return <Text style={{ fontSize: focused ? 22 : 18 }}>{icon}</Text>;
                },
                tabBarActiveTintColor: colors.accent || "#FF6B6B",
                tabBarInactiveTintColor: "gray",
                tabBarLabelStyle: {
                    fontSize: 12,
                    fontWeight: "600",
                },
                tabBarStyle: {
                    backgroundColor: "white",
                    borderTopWidth: 1,
                    borderTopColor: "#eee",
                    paddingBottom: 5,
                    paddingTop: 5,
                    height: 60,
                },
                headerShown: false,
            })}
        >
            <Tab.Screen name="Home" component={Home} options={{ tabBarLabel: "Feed" }} />
            <Tab.Screen name="Connections" component={Connections} />
            <Tab.Screen name="Requests" component={Requests} />
            <Tab.Screen name="Chat" component={Chat} />
            <Tab.Screen name="Profile" component={Profile} />
        </Tab.Navigator>
    );
}

export default AppStack;
