import { Platform } from "react-native";

// Use 10.0.2.2 for Android Emulator, localhost for iOS Simulator
// If you are testing on a real physical device, replace this with your computer's local IP address (e.g., http://192.168.1.X:10000)
// export const BASE_URL = Platform.OS === 'android' 
//     ? "http://10.0.2.2:10000" 
//     : "http://localhost:10000";


export const BASE_URL = Platform.OS === 'android'
    ? "http://192.168.35.167:10000"
    : "http://localhost:10000";
