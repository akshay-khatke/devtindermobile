import Home from "../screens/home/Home";
import Login from "../screens/login/Login";
import { createStackNavigator } from '@react-navigation/stack';


const Stack = createStackNavigator();

function AppStack() {
    return (
        <Stack.Navigator>
            <Stack.Screen options={{ headerShown: false }} name="Home" component={Home} />
        </Stack.Navigator>
    );
}

export default AppStack
