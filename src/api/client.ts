// src/api/client.ts
import axios from "axios";
import * as Keychain from "react-native-keychain";
import { BASE_URL } from "../constants/baseUrl";

const API = axios.create({
    baseURL: BASE_URL,
    timeout: 10000,
});

// 🔥 REQUEST INTERCEPTOR (Auto attach token)
API.interceptors.request.use(
    async (config) => {
        try {
            const credentials = await Keychain.getGenericPassword();
            console.log("credentials ->", credentials)
            if (credentials) {
                config.headers.Authorization = `Bearer ${credentials.password}`;
            }
        } catch (error) {
            console.warn("Keychain could not be accessed in interceptor", error);
        }

        return config;
    },
    (error) => Promise.reject(error)
);

// 🔥 RESPONSE INTERCEPTOR (Handle 401 globally)
API.interceptors.response.use(
    (response) => response,
    async (error) => {
        if (error.response?.status === 401) {
            console.log("Unauthorized - redirect to login");
            try {
                await Keychain.resetGenericPassword();
            } catch (err) {
                console.warn("Keychain could not be reset", err);
            }
        }
        return Promise.reject(error);
    }
);

export default API;