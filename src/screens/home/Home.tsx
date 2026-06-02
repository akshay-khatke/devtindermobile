import React from "react";
import { Text, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { getFeed } from "../../api/userApi";

type IProps = {}

const Home: React.FC<IProps> = () => {

    const getFeedData = async () => {
        const res = await getFeed();
        console.log(res, "this is the res")
    }
    React.useEffect(() => {
        getFeedData();
    }, []);
    return (
        <SafeAreaView style={styles.container}>
            <Text style={styles.text}>Home</Text>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: 'red',
        justifyContent: 'center',
        alignItems: 'center',
        flex: 1,
    },
    text: {
        fontSize: 18,
        color: 'white',
        fontWeight: 'bold',
    },
});

export default Home;