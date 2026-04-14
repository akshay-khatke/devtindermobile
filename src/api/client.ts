// src/api/client.ts
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

const API = axios.create({
    baseURL: "https://your-api.com/api",
    timeout: 10000,
});

// 🔥 REQUEST INTERCEPTOR (Auto attach token)
API.interceptors.request.use(
    async (config) => {
        const token = await AsyncStorage.getItem("token");

        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
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
            // Optional: clear token
            await AsyncStorage.removeItem("token");
        }
        return Promise.reject(error);
    }
);

export default API;