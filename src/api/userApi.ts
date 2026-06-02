// src/api/user.ts
import API from "./client";

export const getProfile = async () => {
    const res = await API.get("/user/profile");
    return res.data;
};

export const updateProfile = async (data: any) => {
    const res = await API.put("/user/profile", data);
    return res.data;
};

// GET /profile/view
export const viewProfile = async () => {
    const res = await API.get("/profile/view");
    return res.data;
};

// GET /user/feed (with pagination params like page, limit, skip)
export const getFeed = async (params?: { page?: number; limit?: number; skip?: number }) => {
    const res = await API.get("/user/feed", { params });
    return res.data;
};

// GET /user/connections
export const getConnections = async () => {
    const res = await API.get("/user/connections");
    return res.data;
};

// GET /user/requestReceived
export const getRequestReceived = async () => {
    const res = await API.get("/user/requestReceived");
    return res.data;
};