import Login from "../screens/login/Login";
import { createStackNavigator } from '@react-navigation/stack';


const Stack = createStackNavigator();

function AuthStack() {
    return (
        <Stack.Navigator>
            <Stack.Screen options={{ headerShown: false }} name="Login" component={Login} />
        </Stack.Navigator>
    );
}

export default AuthStack
