// src/api/auth.ts
import API from "./client";
import * as Keychain from "react-native-keychain";

export const login = async (data: {
    emailId: string;
    password: string;
}) => {
    const res = await API.post("/auth/login", data);

    // Save token once in Keychain
    if (res.data && res.data.token) {
        await Keychain.setGenericPassword("token", res.data.token);
    }

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

    if (res.data && res.data.token) {
        await Keychain.setGenericPassword("token", res.data.token);
    }

    return res.data;
};

export const logout = async () => {
    await Keychain.resetGenericPassword();
};

export const changePassword = async (data: {
    oldPassword: string;
    newPassword: string;
}) => {
    const res = await API.post("/auth/changePassword", data);
    return res.data;
};