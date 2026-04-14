import { View } from "react-native";
import Home from "../screens/home/Home";
import Login from "../screens/login/Login";
import { createStackNavigator } from '@react-navigation/stack';
import AppStack from "../stack/AppStack";
import AuthStack from "../stack/AuthStack";


const Stack = createStackNavigator();

const Routes = () => {
    // const { user } = useSelector((state: any) => state.auth);
    const user = false
    return (
        <View style={{ flex: 1 }}>
            {user ? <AppStack /> : <AuthStack />}
        </View>
    );
}

export default Routes
