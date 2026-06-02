// src/api/requestApi.ts
import API from "./client";

// POST /request/send/:status/:toUserId
// status can be "interested" or "ignored"
export const sendRequestStatus = async (status: "interested" | "ignored", toUserId: string) => {
    const res = await API.post(`/request/send/${status}/${toUserId}`);
    return res.data;
};

// POST /request/review/:status/:requestId
// status can be "accepted" or "rejected"
export const reviewRequestStatus = async (status: "accepted" | "rejected", requestId: string) => {
    const res = await API.post(`/request/review/${status}/${requestId}`);
    return res.data;
};

// POST /sendConnectionRequest
export const sendConnectionRequest = async (data?: any) => {
    const res = await API.post("/sendConnectionRequest", data);
    return res.data;
};
