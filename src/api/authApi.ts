// src/api/auth.ts
import API from "./client";
import AsyncStorage from "@react-native-async-storage/async-storage";

export const login = async (data: {
    email: string;
    password: string;
}) => {
    const res = await API.post("/auth/login", data);

    // Save token once
    await AsyncStorage.setItem("token", res.data.token);

    return res.data;
};

export const signup = async (data: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
}) => {
    const res = await API.post("/auth/signup", data);

    await AsyncStorage.setItem("token", res.data.token);

    return res.data;
};

export const logout = async () => {
    await AsyncStorage.removeItem("token");
};