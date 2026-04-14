/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import { Text, View } from 'react-native';
import {
  SafeAreaProvider,
} from 'react-native-safe-area-context';
import Routes from './src/routes/Routes';
import { NavigationContainer } from '@react-navigation/native';

function App() {


  return (
    <SafeAreaProvider>
      <NavigationContainer>

        <Routes />

      </NavigationContainer>
    </SafeAreaProvider>
  );
}




export default App;
