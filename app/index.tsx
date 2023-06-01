import React, { useEffect } from 'react';
import { getKey, name_storage } from '../services/local_storage';
import { useRouter } from 'expo-router';
import { View, StyleSheet, ActivityIndicator } from 'react-native';

const MainPage = () => {
    const router = useRouter();
    useEffect(() => {
        getKey(name_storage).then((name) => {
            if (!name) {
                router.replace('/display_name');
            } else {
                router.replace('/chat');
            }
        });
    }, []);

    return (
        <View style={styles.container}>
            <ActivityIndicator size="large" />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        height: '100%',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
    },
});

export default MainPage;
