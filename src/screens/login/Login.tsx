import React, { useState } from "react";
import {
    Text,
    View,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    Alert,
    Image,
    Dimensions,
} from "react-native";
import login_image from "../../assets/images/login_image.png"
import google_icon from "../../assets/images/google.png"
import facebook_icon from "../../assets/images/facebook.png"
import { login, signup } from "../../api/authApi";
import { useDispatch } from "react-redux";
import { setUser, setToken } from "../../redux/authSlice";
import { colors } from "../../utils/colors";
import { SafeAreaView } from "react-native-safe-area-context";
import { ActivityIndicator } from "react-native";
type IProps = {
    navigation?: any;
};

const { height, width } = Dimensions.get("window")

const Login: React.FC<IProps> = ({ navigation }) => {
    const dispatch = useDispatch();
    const [isSignup, setIsSignup] = useState(false);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [loading, setLoading] = useState(false);

    const validate = () => {
        const emailRegex = /\S+@\S+\.\S+/;

        if (!emailRegex.test(email)) {
            Alert.alert("Invalid Email");
            return false;
        }

        if (password.length < 6) {
            Alert.alert("Password must be at least 6 characters");
            return false;
        }

        if (isSignup && (!firstName || !lastName)) {
            Alert.alert("Please enter full name");
            return false;
        }

        return true;
    };

    const handleSubmit = async () => {
        if (!validate()) return;
        setLoading(true);

        try {
            if (isSignup) {
                const res = await signup({ emailId: email, password, firstName, lastName });
                if (res && res.token) {
                    dispatch(setToken(res.token));
                    dispatch(setUser(res.data));
                    Alert.alert("Success", "Signup Successful");
                }
            } else {
                console.log("in login")
                const res = await login({ emailId: email, password });
                if (res && res.token) {
                    dispatch(setToken(res.token));
                    dispatch(setUser(res));
                    Alert.alert("Success", "Login Successful");
                }
            }
        } catch (error: any) {
            Alert.alert("Error", error.response?.data?.message || "Something went wrong");
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>

            {/* SVG IMAGE */}
            <View style={styles.svgContainer}>
                <Image
                    source={login_image}
                    resizeMode="contain"
                    style={{ width: width / 2, height: height / 6 }}
                />
            </View>

            <Text style={styles.title}>{isSignup ? "Sign Up" : "Login"}</Text>

            {isSignup && (
                <>
                    <TextInput
                        placeholder="First Name"
                        style={styles.input}
                        value={firstName}
                        onChangeText={setFirstName}
                    />
                    <TextInput
                        placeholder="Last Name"
                        style={styles.input}
                        value={lastName}
                        onChangeText={setLastName}
                    />
                </>
            )}

            <TextInput
                placeholder="Email"
                style={styles.input}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
            />

            <TextInput
                placeholder="Password"
                style={styles.input}
                value={password}
                onChangeText={setPassword}
                secureTextEntry
            />

            <TouchableOpacity
                style={[styles.button, loading && { opacity: 0.7 }]}
                onPress={handleSubmit}
                disabled={loading}
            >
                {loading ? (
                    <ActivityIndicator color="#ffffff" />
                ) : (
                    <Text style={styles.buttonText}>
                        {isSignup ? "Sign Up" : "Login"}
                    </Text>
                )}
            </TouchableOpacity>

            <TouchableOpacity onPress={() => setIsSignup(!isSignup)}>
                <Text style={styles.link}>
                    {isSignup
                        ? "Already have an account? Login"
                        : "Don't have an account? Sign Up"}
                </Text>
            </TouchableOpacity>

            {/* Social Auth */}
            <View style={styles.socialContainer}>
                <Text style={styles.socialText}>Or continue with</Text>

                <View style={styles.socialRow}>
                    <TouchableOpacity style={styles.socialIconBtn}>
                        <Image source={google_icon} style={styles.socialIcon} />
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.socialIconBtn}>
                        <Image source={facebook_icon} style={styles.socialIcon} />
                    </TouchableOpacity>
                </View>
            </View>

            {/* Privacy Policy */}
            <TouchableOpacity onPress={() => Alert.alert("Privacy Policy")}>
                <Text style={styles.privacy}>Privacy Policy</Text>
            </TouchableOpacity>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: colors.primary
        // justifyContent: "center",
    },
    svgContainer: {
        alignItems: "center",
        paddingVertical: 20
    },
    title: {
        fontSize: 34,
        fontWeight: "bold",
        marginBottom: 30,
        textAlign: "center",
        color: colors.accent,
    },
    input: {
        borderWidth: 1,
        borderColor: "#ddd",
        paddingVertical: 15,
        paddingHorizontal: 15,
        paddingLeft: 20,
        marginBottom: 15,
        borderRadius: 10,
    },
    button: {
        backgroundColor: colors.accent,
        padding: 15,
        borderRadius: 10,
        alignItems: "center",
        marginTop: 10,
    },
    buttonText: {
        color: "#fff",
        fontWeight: "bold",
    },
    link: {
        marginTop: 15,
        textAlign: "center",
        color: colors.accent,
    },
    socialContainer: {
        marginTop: 30,
        alignItems: "center",
    },
    socialText: {
        color: "#666",
        marginBottom: 15,
    },
    socialRow: {
        flexDirection: "row",
        justifyContent: "center",
        gap: 20,
    },
    socialIconBtn: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: "#fff",
        justifyContent: "center",
        alignItems: "center",
        elevation: 3,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        borderWidth: 1,
        borderColor: "#f0f0f0",
    },
    socialIcon: {
        width: 35,
        height: 35,
        resizeMode: "contain",
    },
    privacy: {
        marginTop: "auto",
        marginBottom: 20,
        textAlign: "center",
        color: "gray",
        textDecorationLine: "underline",
    },
});

export default Login;