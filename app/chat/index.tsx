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
import { addMessage, db, dbMessagesName, getMessages } from '../../services/db';
import { Message, messageConverter } from '../../models/message';
import {
    QueryDocumentSnapshot,
    collection,
    onSnapshot,
} from 'firebase/firestore';
import ChatBubble from '../../components/chat/chat_bubble';

const ChatPage = () => {
    const [initialLoading, setInitialLoading] = useState(true);
    const [loading, setLoading] = useState(false);
    const [loadingButton, setLoadingButton] = useState(false);
    const [noMoreMessages, setNoMoreMessages] = useState(false);
    const [allMessages, setAllMessages] = useState<Message[]>([]);
    const [lastDoc, setLastDoc] = useState<
        QueryDocumentSnapshot<Message> | undefined
    >(undefined);
    const [username, setUsername] = useState('');
    const [writtenMessage, setWrittenMessage] = useState('');
    const router = useRouter();

    const isButtonDisabled = () =>
        writtenMessage.trim() === '' || loadingButton;

    useEffect(() => {
        getKey(name_storage).then((value) => {
            if (!value) {
                router.replace('/display_name');
            } else {
                getNewMessages();
                setUsername(value);
            }
        });
    }, []);

    useEffect(() => {
        const unsub = onSnapshot(
            collection(db, dbMessagesName).withConverter(messageConverter),
            (doc) => {
                if (
                    doc.docChanges().length === 1 &&
                    doc.docChanges()[0].type === 'added'
                ) {
                    const notExists =
                        allMessages.filter(
                            (m) => m.id === doc.docChanges()[0].doc.id
                        ).length === 0;
                    if (notExists) {
                        const newMessage = doc.docChanges()[0].doc.data();
                        setAllMessages([newMessage, ...allMessages]);
                    }
                }
            }
        );

        return () => {
            unsub();
        };
    }, [allMessages.length]);

    const getNewMessages = async () => {
        const values = await getMessages(lastDoc);
        if (values.length > 0) {
            const newMessages = [
                ...allMessages,
                ...(values.slice(0, -1) as Message[]),
            ];
            setAllMessages([...newMessages]);
        } else {
            setNoMoreMessages(true);
        }
        setLastDoc(values[values.length - 1] as QueryDocumentSnapshot<Message>);
        setInitialLoading(false);
        setLoading(false);
    };

    const sendMessage = async () => {
        setLoadingButton(true);
        setWrittenMessage('');
        const messageToSend = new Message(
            writtenMessage.trim(),
            new Date(),
            username
        );
        await addMessage(messageToSend);
        setLoadingButton(false);
    };

    return (
        <SafeAreaView style={styles.container}>
            {initialLoading ? (
                <View style={styles.centerContainer}>
                    <ActivityIndicator size="large" />
                </View>
            ) : (
                <>
                    <Text
                        style={styles.titleText}
                    >{`Welcome ${username}`}</Text>
                    <View style={styles.messageListContainer}>
                        <FlatList
                            data={loading ? [...allMessages, ''] : allMessages}
                            renderItem={({ item }) => {
                                if (typeof item === 'string') {
                                    return (
                                        <ActivityIndicator
                                            size="large"
                                            style={{
                                                alignSelf: 'center',
                                                marginBottom: 10,
                                            }}
                                        />
                                    );
                                }
                                return (
                                    <ChatBubble
                                        message={item}
                                        username={username}
                                    />
                                );
                            }}
                            keyExtractor={(item) =>
                                typeof item === 'string'
                                    ? 'loading'
                                    : item.id ?? ''
                            }
                            style={styles.messageList}
                            inverted
                            onEndReached={() => {
                                if (!loading && !noMoreMessages) {
                                    setLoading(true);
                                    getNewMessages();
                                }
                            }}
                        />
                    </View>
                    <View style={styles.actionContainer}>
                        <TextInput
                            style={styles.input}
                            onChangeText={(value) => setWrittenMessage(value)}
                            value={writtenMessage}
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
        width: '100%',
        maxWidth: 500,
        display: 'flex',
        height: '100%',
        paddingHorizontal: 5,
    },
    titleText: {
        fontSize: 25,
        marginBottom: 10,
        marginTop: 10,
        alignSelf: 'center',
    },
    messageListContainer: {
        flex: 1,
        display: 'flex',
        justifyContent: 'flex-end',
    },
    messageList: {
        flexGrow: 0,
    },
    actionContainer: {
        marginBottom: 20,
        marginTop: 20,
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
        width: '20%',
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
