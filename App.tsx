/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import { Text, View, Alert } from 'react-native';
import {
  SafeAreaProvider,
} from 'react-native-safe-area-context';
import Routes from './src/app/navigation/Routes';
import { NavigationContainer, createNavigationContainerRef } from '@react-navigation/native';
import messaging from '@react-native-firebase/messaging';
import React, { useEffect } from 'react';

import { Provider } from 'react-redux';
import { store } from './src/app/store/store';

export const navigationRef = createNavigationContainerRef();

function App() {
  useEffect(() => {
    const unsubscribe = messaging().onMessage(async remoteMessage => {
      const currentRoute = navigationRef.isReady() ? navigationRef.getCurrentRoute() : null;
      const isChatScreen = currentRoute?.name === 'ChatScreen';
      const senderId = remoteMessage.data?.senderId;
      // @ts-ignore
      const targetUserId = currentRoute?.params?.targetUser?._id;

      if (isChatScreen && targetUserId === senderId) {
        // Do not show alert, user is already chatting with this person
        console.log("Notification suppressed: user is currently chatting with this sender.");
      } else {
        // Show in-app alert
        Alert.alert(
          remoteMessage.notification?.title || "New Notification",
          remoteMessage.notification?.body || "You have a new message"
        );
      }
    });

    return unsubscribe;
  }, []);

  return (
    <Provider store={store}>
      <SafeAreaProvider>
        <NavigationContainer ref={navigationRef}>
          <Routes />
        </NavigationContainer>
      </SafeAreaProvider>
    </Provider>
  );
}




export default App;
