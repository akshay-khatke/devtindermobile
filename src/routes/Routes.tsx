import React, { useEffect, useState } from "react";
import { View, ActivityIndicator } from "react-native";
import { createStackNavigator } from '@react-navigation/stack';
import AppStack from "../stack/AppStack";
import AuthStack from "../stack/AuthStack";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "../redux/store";
import { setUser, setToken, logout } from "../redux/authSlice";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { viewProfile } from "../api/userApi";

const Stack = createStackNavigator();

const Routes = () => {
    const dispatch = useDispatch();
    const { user } = useSelector((state: RootState) => state.auth);
    const [checkingAuth, setCheckingAuth] = useState(true);

    useEffect(() => {
        const bootstrapAsync = async () => {
            try {
                const token = await AsyncStorage.getItem("token");
                if (token) {
                    dispatch(setToken(token));
                    // Fetch user profile from backend using the token
                    const profileData = await viewProfile();
                    if (profileData) {
                        dispatch(setUser(profileData));
                    } else {
                        dispatch(logout());
                    }
                }
            } catch (e) {
                console.warn("Failed to load initial session", e);
                dispatch(logout());
            } finally {
                setCheckingAuth(false);
            }
        };

        bootstrapAsync();
    }, [dispatch]);

    if (checkingAuth) {
        return (
            <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
                <ActivityIndicator size="large" color="#0000ff" />
            </View>
        );
    }

    return (
        <View style={{ flex: 1 }}>
            {user ? <AppStack /> : <AuthStack />}
        </View>
    );
};

export default Routes;
