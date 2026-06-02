// src/api/auth.ts
import API from "./client";
import AsyncStorage from "@react-native-async-storage/async-storage";

export const login = async (data: {
    emailId: string;
    password: string;
}) => {
    console.log(data.emailId, data.password, 'dajcnajdn')
    const res = await API.post("/auth/login", data);

    // Save token once
    // await AsyncStorage.setItem("token", res.data.token);

    return res.data;
};

export const signup = async (data: {
    emailId: string;
    password: string;
    firstName: string;
    lastName: string;
    gender?: string;
    role?: string;
    age?: number;
    photoUrl?: string;
}) => {
    const res = await API.post("/auth/signUp", data);

    await AsyncStorage.setItem("token", res.data.token);

    return res.data;
};

export const logout = async () => {
    await AsyncStorage.removeItem("token");
};

export const changePassword = async (data: {
    oldPassword: string;
    newPassword: string;
}) => {
    const res = await API.post("/auth/changePassword", data);
    return res.data;
};