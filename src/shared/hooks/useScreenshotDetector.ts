import { useEffect } from 'react';
import { NativeModules, NativeEventEmitter, Platform, Alert } from 'react-native';

const { ScreenshotDetector } = NativeModules;

export const useScreenshotDetector = () => {
    useEffect(() => {
        if (Platform.OS !== 'android') return;

        let eventListener: any;

        const startDetection = async () => {
            try {
                if (ScreenshotDetector && ScreenshotDetector.startListening) {
                    await ScreenshotDetector.startListening();

                    const eventEmitter = new NativeEventEmitter(ScreenshotDetector);
                    eventListener = eventEmitter.addListener('onScreenshotDetected', () => {
                        console.log('Screenshot detected!');
                        Alert.alert(
                            "Screenshot Detected",
                            "Taking screenshots is monitored for security and privacy.",
                            [{ text: "OK" }]
                        );
                    });
                }
            } catch (error) {
                console.warn('Screenshot detector initialization failed:', error);
            }
        };

        startDetection();

        return () => {
            if (eventListener) {
                eventListener.remove();
            }
            if (ScreenshotDetector && ScreenshotDetector.stopListening) {
                ScreenshotDetector.stopListening().catch(() => {});
            }
        };
    }, []);
};
