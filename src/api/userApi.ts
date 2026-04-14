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