import React from "react";
import { Text, View } from "react-native";
type IProps = {

}
const Home: React.FC<IProps> = () => {
    return (
        <View style={{ backgroundColor: 'red', justifyContent: 'center', alignItems: 'center', flex: 1 }}>
            <Text>Home</Text>
        </View>
    )
}
export default Home