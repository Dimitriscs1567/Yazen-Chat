import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    View,
    StyleSheet,
    TextInput,
    Text,
    Pressable,
    ActivityIndicator,
} from 'react-native';
import { getKey, name_storage, saveKey } from '../../services/local_storage';
import { addUser } from '../../services/db';

const DispayNamePage = () => {
    const [name, setName] = useState('');
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [initialLoading, setInitialLoading] = useState(true);
    const [error, setError] = useState(false);

    const navigateToChat = () => {
        router.replace('/chat');
    };

    useEffect(() => {
        getKey(name_storage).then((value) => {
            if (value) {
                navigateToChat();
            } else {
                setInitialLoading(false);
            }
        });
    }, []);

    const onPressNext = async () => {
        setLoading(true);
        if (await addUser(name.trim())) {
            saveKey(name_storage, name.trim());
            navigateToChat();
        } else {
            setError(true);
            setLoading(false);
        }
    };

    const isButtonDisabled = () => name.trim() === '' || loading;

    return (
        <View style={styles.container}>
            {initialLoading ? (
                <ActivityIndicator size="large" />
            ) : (
                <View style={styles.innerContainer}>
                    <Text style={styles.text}>Your display name</Text>
                    <TextInput
                        style={[
                            styles.input,
                            { borderColor: error ? 'red' : 'blue' },
                        ]}
                        onChangeText={(value) => {
                            setName(value);
                            setError(false);
                        }}
                        value={name}
                        maxLength={40}
                    />
                    {error && (
                        <Text style={styles.errorText}>
                            This name already exists! Please choose another!
                        </Text>
                    )}
                    <Pressable
                        style={[
                            styles.button,
                            {
                                backgroundColor: isButtonDisabled()
                                    ? 'grey'
                                    : 'blue',
                            },
                        ]}
                        disabled={isButtonDisabled()}
                        onPress={onPressNext}
                    >
                        {loading ? (
                            <ActivityIndicator size="small" />
                        ) : (
                            <Text style={styles.buttonText}>Next</Text>
                        )}
                    </Pressable>
                </View>
            )}
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
    innerContainer: {
        height: 200,
        width: '95%',
        maxWidth: 300,
        display: 'flex',
        justifyContent: 'center',
    },
    text: { marginBottom: 6.0, fontSize: 20 },
    input: {
        height: 40,
        width: '100%',
        borderStyle: 'solid',
        borderWidth: 2,
        borderRadius: 12,
        paddingHorizontal: 5,
        fontSize: 19,
    },
    button: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        width: '100%',
        height: 40,
        marginTop: 20,
        borderRadius: 12,
    },
    buttonText: {
        color: 'white',
        fontSize: 20,
    },
    errorText: {
        color: 'red',
        fontSize: 12,
        marginTop: 5,
    },
});

export default DispayNamePage;
