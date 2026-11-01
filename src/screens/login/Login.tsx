import React, { useState, useEffect } from "react";
import {
    Text,
    View,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    Alert,
    Image,
    Dimensions,
    NativeModules,
    NativeEventEmitter,
    PermissionsAndroid,
    Platform,
    StatusBar,
    ScrollView,
    KeyboardAvoidingView,
    Linking,
    ActivityIndicator,
} from "react-native";
import Svg, { Path, Circle } from "react-native-svg";
import login_image from "../../assets/images/login_image.png";
import google_icon from "../../assets/images/google.jpg";
import facebook_icon from "../../assets/images/facebook.jpg";
import { login, signup } from "../../api/authApi";
import { useDispatch } from "react-redux";
import { setUser, setToken } from "../../redux/authSlice";
import { colors } from "../../utils/colors";
import { SafeAreaView } from "react-native-safe-area-context";

type IProps = {
    navigation?: any;
};

const { height, width } = Dimensions.get("window");

const EyeIcon = ({ size = 20, color = "#64748B" }: { size?: number; color?: string }) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <Path
            d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"
            stroke={color}
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
        />
        <Circle cx={12} cy={12} r={3} stroke={color} strokeWidth={2} />
    </Svg>
);

const EyeOffIcon = ({ size = 20, color = "#64748B" }: { size?: number; color?: string }) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <Path
            d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"
            stroke={color}
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
        />
        <Path
            d="M1 1l22 22"
            stroke={color}
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
        />
    </Svg>
);

const Login: React.FC<IProps> = ({ navigation }) => {
    const dispatch = useDispatch();
    const [isSignup, setIsSignup] = useState(false);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState<{
        firstName?: string;
        lastName?: string;
        email?: string;
        password?: string;
        general?: string;
    }>({});

    useEffect(() => {
        const { ScreenshotDetector } = NativeModules;
        let subscription: any = null;

        const requestPermissionAndListen = async () => {
            if (Platform.OS === "android") {
                if (Number(Platform.Version) >= 33) {
                    await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES);
                } else {
                    await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE);
                }
            }

            if (ScreenshotDetector) {
                ScreenshotDetector.startListening();
                const eventEmitter = new NativeEventEmitter(ScreenshotDetector);
                subscription = eventEmitter.addListener("onScreenshotDetected", (message) => {
                    console.log("Screenshot detected:", message);
                    Alert.alert("Screenshot Detected", "Taking screenshots is not allowed here ok.");
                });
            }
        };

        requestPermissionAndListen();

        return () => {
            if (subscription) {
                subscription.remove();
            }
            if (ScreenshotDetector) {
                ScreenshotDetector.stopListening();
            }
        };
    }, []);

    const validate = () => {
        const newErrors: typeof errors = {};
        const emailRegex = /\S+@\S+\.\S+/;

        if (isSignup) {
            if (!firstName.trim()) {
                newErrors.firstName = "Please enter first name";
            }
            if (!lastName.trim()) {
                newErrors.lastName = "Please enter last name";
            }
        }

        if (!email.trim() || !emailRegex.test(email.trim())) {
            newErrors.email = "Invalid Email";
        }

        if (!password) {
            newErrors.password = "Password must be at least 6 characters";
        } else if (password.length < 6) {
            newErrors.password = "Password must be at least 6 characters";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async () => {
        if (!validate()) return;
        setLoading(true);
        setErrors((prev) => ({ ...prev, general: undefined }));

        try {
            if (isSignup) {
                const res = await signup({
                    emailId: email.trim(),
                    password,
                    firstName: firstName.trim(),
                    lastName: lastName.trim(),
                });
                if (res && res.token) {
                    dispatch(setToken(res.token));
                    dispatch(setUser(res.data));
                }
            } else {
                console.log("in login");
                const res = await login({ emailId: email.trim(), password });
                console.log(res, "check response");
                if (res && res.token) {
                    dispatch(setToken(res.token));
                    dispatch(setUser(res.user || res.data || res));
                }
            }
        } catch (error: any) {
            const errorMsg =
                error.response?.data?.message ||
                error.response?.data ||
                error.message ||
                "Something went wrong";
            setErrors((prev) => ({
                ...prev,
                general: typeof errorMsg === "string" ? errorMsg : "Something went wrong",
            }));
        } finally {
            setLoading(false);
        }
    };

    const handlePrivacyPolicy = async () => {
        const url = "https://akshay-khatke.github.io/privacy-policy/";
        try {
            await Linking.openURL(url);
        } catch (error) {
            console.error("Could not open privacy policy URL", error);
            Alert.alert("Error", "Could not open privacy policy URL.");
        }
    };

    return (
        <SafeAreaView style={styles.container} edges={["top", "bottom", "left", "right"]}>
            <StatusBar barStyle="dark-content" backgroundColor="#ffffff" translucent={false} />
            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : undefined}
                style={{ flex: 1 }}
            >
                <ScrollView
                    contentContainerStyle={styles.scrollContent}
                    keyboardShouldPersistTaps="handled"
                    showsVerticalScrollIndicator={false}
                >
                    {/* SVG/Logo IMAGE */}
                    <View style={styles.svgContainer}>
                        <Image
                            source={login_image}
                            resizeMode="contain"
                            style={{ width: width * 0.45, height: height * 0.14 }}
                        />
                    </View>

                    <Text style={styles.title}>{isSignup ? "Sign Up" : "Login"}</Text>

                    {errors.general ? (
                        <View style={styles.generalErrorBox}>
                            <Text style={styles.generalErrorText}>{errors.general}</Text>
                        </View>
                    ) : null}

                    {isSignup && (
                        <>
                            <View style={styles.inputGroup}>
                                <TextInput
                                    placeholder="First Name"
                                    placeholderTextColor="#94A3B8"
                                    style={[styles.input, errors.firstName ? styles.inputError : null]}
                                    value={firstName}
                                    onChangeText={(val) => {
                                        setFirstName(val);
                                        if (errors.firstName) {
                                            setErrors((prev) => ({ ...prev, firstName: undefined }));
                                        }
                                    }}
                                />
                                {errors.firstName ? (
                                    <Text style={styles.errorText}>{errors.firstName}</Text>
                                ) : null}
                            </View>

                            <View style={styles.inputGroup}>
                                <TextInput
                                    placeholder="Last Name"
                                    placeholderTextColor="#94A3B8"
                                    style={[styles.input, errors.lastName ? styles.inputError : null]}
                                    value={lastName}
                                    onChangeText={(val) => {
                                        setLastName(val);
                                        if (errors.lastName) {
                                            setErrors((prev) => ({ ...prev, lastName: undefined }));
                                        }
                                    }}
                                />
                                {errors.lastName ? (
                                    <Text style={styles.errorText}>{errors.lastName}</Text>
                                ) : null}
                            </View>
                        </>
                    )}

                    <View style={styles.inputGroup}>
                        <TextInput
                            placeholder="Email"
                            placeholderTextColor="#94A3B8"
                            style={[styles.input, errors.email ? styles.inputError : null]}
                            value={email}
                            onChangeText={(val) => {
                                setEmail(val);
                                if (errors.email) {
                                    setErrors((prev) => ({ ...prev, email: undefined }));
                                }
                            }}
                            keyboardType="email-address"
                            autoCapitalize="none"
                            testID="emailInput"
                        />
                        {errors.email ? (
                            <Text style={styles.errorText}>{errors.email}</Text>
                        ) : null}
                    </View>

                    <View style={styles.inputGroup}>
                        <View style={[styles.passwordWrapper, errors.password ? styles.inputError : null]}>
                            <TextInput
                                placeholder="Password"
                                placeholderTextColor="#94A3B8"
                                style={styles.passwordInput}
                                value={password}
                                onChangeText={(val) => {
                                    setPassword(val);
                                    if (errors.password) {
                                        setErrors((prev) => ({ ...prev, password: undefined }));
                                    }
                                }}
                                secureTextEntry={!showPassword}
                                testID="passwordInput"
                            />
                            <TouchableOpacity
                                style={styles.eyeBtn}
                                onPress={() => setShowPassword(!showPassword)}
                                activeOpacity={0.6}
                                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                            >
                                {showPassword ? (
                                    <EyeOffIcon size={20} color="#64748B" />
                                ) : (
                                    <EyeIcon size={20} color="#64748B" />
                                )}
                            </TouchableOpacity>
                        </View>
                        {errors.password ? (
                            <Text style={styles.errorText}>{errors.password}</Text>
                        ) : null}
                    </View>

                    <TouchableOpacity
                        style={[styles.button, loading && { opacity: 0.7 }]}
                        onPress={handleSubmit}
                        disabled={loading}
                        testID="loginButton"
                        activeOpacity={0.8}
                    >
                        {loading ? (
                            <ActivityIndicator color="#ffffff" />
                        ) : (
                            <Text style={styles.buttonText}>
                                {isSignup ? "Sign Up" : "Login"}
                            </Text>
                        )}
                    </TouchableOpacity>

                    {/* Don't have an account toggle text */}
                    <TouchableOpacity
                        onPress={() => {
                            setIsSignup(!isSignup);
                            setErrors({});
                        }}
                        testID="toggleSignupButton"
                        style={styles.toggleAuthContainer}
                        activeOpacity={0.7}
                    >
                        <Text style={styles.toggleAuthText}>
                            {isSignup ? "Already have an account? " : "Don't have an account? "}
                            <Text style={styles.toggleAuthAction}>
                                {isSignup ? "Login" : "Sign Up"}
                            </Text>
                        </Text>
                    </TouchableOpacity>

                    {/* Social Auth */}
                    <View style={styles.socialContainer}>
                        <View style={styles.dividerRow}>
                            <View style={styles.dividerLine} />
                            <Text style={styles.socialDividerText}>Or continue with</Text>
                            <View style={styles.dividerLine} />
                        </View>

                        <View style={styles.socialBtnGroup}>
                            <TouchableOpacity
                                style={styles.socialBtn}
                                activeOpacity={0.8}
                                onPress={() => {}}
                            >
                                <Image source={google_icon} style={styles.socialIcon} />
                                <Text style={styles.socialBtnText}>Continue with Google</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={styles.socialBtn}
                                activeOpacity={0.8}
                                onPress={() => {}}
                            >
                                <Image source={facebook_icon} style={styles.socialIcon} />
                                <Text style={styles.socialBtnText}>Continue with Facebook</Text>
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* Privacy Policy */}
                    <TouchableOpacity
                        onPress={handlePrivacyPolicy}
                        activeOpacity={0.7}
                        style={styles.privacyContainer}
                    >
                        <Text style={styles.privacy}>Privacy Policy</Text>
                    </TouchableOpacity>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.primary,
    },
    scrollContent: {
        flexGrow: 1,
        paddingHorizontal: 24,
        paddingTop: 10,
        paddingBottom: 24,
    },
    svgContainer: {
        alignItems: "center",
        paddingVertical: 12,
    },
    title: {
        fontSize: 30,
        fontWeight: "bold",
        marginBottom: 20,
        textAlign: "center",
        color: colors.accent,
    },
    generalErrorBox: {
        backgroundColor: "#FEE2E2",
        borderRadius: 8,
        padding: 10,
        marginBottom: 14,
        borderWidth: 1,
        borderColor: "#FCA5A5",
    },
    generalErrorText: {
        color: "#B91C1C",
        fontSize: 13,
        textAlign: "center",
        fontWeight: "500",
    },
    inputGroup: {
        marginBottom: 14,
    },
    input: {
        borderWidth: 1,
        borderColor: "#E2E8F0",
        paddingVertical: 13,
        paddingHorizontal: 16,
        borderRadius: 10,
        fontSize: 15,
        color: "#1E293B",
        backgroundColor: "#FFFFFF",
    },
    passwordWrapper: {
        flexDirection: "row",
        alignItems: "center",
        borderWidth: 1,
        borderColor: "#E2E8F0",
        borderRadius: 10,
        backgroundColor: "#FFFFFF",
    },
    passwordInput: {
        flex: 1,
        paddingVertical: 13,
        paddingHorizontal: 16,
        fontSize: 15,
        color: "#1E293B",
    },
    eyeBtn: {
        paddingHorizontal: 14,
        paddingVertical: 12,
        justifyContent: "center",
        alignItems: "center",
    },
    inputError: {
        borderColor: "#EF4444",
    },
    errorText: {
        color: "#EF4444",
        fontSize: 12,
        marginTop: 4,
        marginLeft: 4,
        fontWeight: "500",
    },
    button: {
        backgroundColor: colors.accent,
        paddingVertical: 14,
        borderRadius: 10,
        alignItems: "center",
        marginTop: 6,
        elevation: 2,
        shadowColor: colors.accent,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
    },
    buttonText: {
        color: "#FFFFFF",
        fontWeight: "bold",
        fontSize: 16,
    },
    toggleAuthContainer: {
        marginTop: 16,
        alignItems: "center",
        paddingVertical: 6,
    },
    toggleAuthText: {
        fontSize: 14,
        color: "#64748B",
    },
    toggleAuthAction: {
        color: colors.accent,
        fontWeight: "bold",
    },
    socialContainer: {
        marginTop: 22,
        width: "100%",
    },
    dividerRow: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 16,
    },
    dividerLine: {
        flex: 1,
        height: 1,
        backgroundColor: "#E2E8F0",
    },
    socialDividerText: {
        color: "#94A3B8",
        paddingHorizontal: 12,
        fontSize: 13,
        fontWeight: "500",
    },
    socialBtnGroup: {
        width: "100%",
        gap: 12,
    },
    socialBtn: {
        width: "100%",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#FFFFFF",
        borderWidth: 1,
        borderColor: "#E2E8F0",
        borderRadius: 10,
        paddingVertical: 12,
        paddingHorizontal: 16,
        elevation: 1,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
    },
    socialIcon: {
        width: 22,
        height: 22,
        resizeMode: "contain",
        marginRight: 10,
    },
    socialBtnText: {
        fontSize: 14,
        fontWeight: "600",
        color: "#1E293B",
    },
    privacyContainer: {
        marginTop: 24,
        marginBottom: 16,
        alignItems: "center",
    },
    privacy: {
        color: "#94A3B8",
        fontSize: 13,
        textDecorationLine: "underline",
    },
});

export default Login;