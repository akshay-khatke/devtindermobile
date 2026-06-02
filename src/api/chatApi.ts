// src/api/chatApi.ts
import API from "./client";

// GET /chat/getChat/:targetUserId
export const getChat = async (targetUserId: string) => {
    const res = await API.get(`/chat/getChat/${targetUserId}`);
    return res.data;
};

// POST /chat/sendMessage/:targetUserId
export const sendMessage = async (targetUserId: string, textMessage: string) => {
    const res = await API.post(`/chat/sendMessage/${targetUserId}`, { textMessage });
    return res.data;
};
