/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import { Text, View, StatusBar } from 'react-native';
import {
  SafeAreaProvider,
} from 'react-native-safe-area-context';
import Routes from './src/routes/Routes';
import { NavigationContainer } from '@react-navigation/native';

import { Provider } from 'react-redux';
import { store } from './src/redux/store';

function App() {
  return (
    <Provider store={store}>
      <SafeAreaProvider>
        <StatusBar barStyle="dark-content" backgroundColor="#ffffff" translucent={false} />
        <NavigationContainer>
          <Routes />
        </NavigationContainer>
      </SafeAreaProvider>
    </Provider>
  );
}




export default App;
