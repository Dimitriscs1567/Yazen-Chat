import React, { useEffect, useState } from 'react';
import {
    View,
    StyleSheet,
    ActivityIndicator,
    Text,
    SafeAreaView,
    FlatList,
    TextInput,
    Pressable,
} from 'react-native';
import { getKey, name_storage } from '../../services/local_storage';
import { useRouter } from 'expo-router';
import { addMessage, getMessages } from '../../services/db';
import { Message } from '../../models/message';
import { DocumentSnapshot, QueryDocumentSnapshot } from 'firebase/firestore';

const ChatPage = () => {
    const [initialLoading, setInitialLoading] = useState(true);
    const [loading, setLoading] = useState(false);
    const [loadingButton, setLoadingButton] = useState(false);
    const [allMessages, setAllMessages] = useState<Message[]>([]);
    const [lastDoc, setLastDoc] = useState<
        QueryDocumentSnapshot<Message> | undefined
    >(undefined);
    const [username, setUsername] = useState('');
    const [newMessage, setNewMessage] = useState('');
    const router = useRouter();

    const isButtonDisabled = () => newMessage.trim() === '' || loadingButton;

    useEffect(() => {
        getKey(name_storage).then((value) => {
            if (!value) {
                router.replace('/display_name');
            } else {
                getNewMessages().then(() => {
                    setInitialLoading(false);
                    setUsername(value);
                });
            }
        });
    }, []);

    const getNewMessages = async () => {
        setLoading(true);
        const newMessages = await getMessages(lastDoc);
        setAllMessages([
            ...allMessages,
            ...(newMessages.slice(0, -1).reverse() as Message[]),
        ]);
        setLastDoc(
            newMessages[
                newMessages.length - 1
            ] as QueryDocumentSnapshot<Message>
        );
        setLoading(false);
    };

    const sendMessage = async () => {
        setLoadingButton(true);
        const messageToSend = new Message(
            newMessage.trim(),
            new Date(),
            username
        );
        const res = await addMessage(messageToSend);
        if (res) {
            setNewMessage('');
            messageToSend.id = res;
            setAllMessages([...allMessages, messageToSend]);
        }
        setLoadingButton(false);
    };

    return (
        <SafeAreaView>
            <View style={styles.container}>
                {initialLoading ? (
                    <View style={styles.centerContainer}>
                        <ActivityIndicator size="large" />
                    </View>
                ) : (
                    <>
                        <Text
                            style={styles.titleText}
                        >{`Welcome ${username}`}</Text>
                        <FlatList
                            data={allMessages}
                            renderItem={({ item }) => <>{item.message}</>}
                            keyExtractor={(item) => item.id ?? ''}
                            style={styles.messageList}
                        />
                        <View style={styles.actionContainer}>
                            <TextInput
                                style={styles.input}
                                onChangeText={(value) => setNewMessage(value)}
                                value={newMessage}
                                maxLength={120}
                            />
                            <Pressable
                                style={[
                                    styles.button,
                                    {
                                        backgroundColor: isButtonDisabled()
                                            ? 'grey'
                                            : 'blue',
                                    },
                                ]}
                                onPress={sendMessage}
                                disabled={isButtonDisabled()}
                            >
                                {loadingButton ? (
                                    <ActivityIndicator size="small" />
                                ) : (
                                    <Text style={styles.buttonText}>Send</Text>
                                )}
                            </Pressable>
                        </View>
                    </>
                )}
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    centerContainer: {
        height: '100%',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
    },
    container: {
        margin: 'auto',
        width: '95vw',
        maxWidth: 500,
        display: 'flex',
        height: '100vh',
    },
    titleText: {
        fontSize: 25,
        marginBottom: 10,
        marginTop: 10,
        alignSelf: 'center',
    },
    messageList: {
        flex: 1,
    },
    actionContainer: {
        marginBottom: 30,
        marginTop: 10,
        display: 'flex',
        flexDirection: 'row',
    },
    input: {
        height: 40,
        borderStyle: 'solid',
        borderWidth: 2,
        borderRadius: 12,
        paddingHorizontal: 5,
        fontSize: 19,
        flex: 1,
    },
    button: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: 40,
        width: 55,
        borderRadius: 12,
        marginLeft: 5,
        paddingHorizontal: 8,
    },
    buttonText: {
        color: 'white',
        fontSize: 18,
    },
});

export default ChatPage;
