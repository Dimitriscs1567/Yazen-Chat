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
import { addMessage, db } from '../../services/db';
import { Message, messageConverter } from '../../models/message';
import {
    QueryDocumentSnapshot,
    Unsubscribe,
    collection,
    limit,
    onSnapshot,
    orderBy,
    query,
} from 'firebase/firestore';
import ChatBubble from '../../components/chat/chat_bubble';

const ChatPage = () => {
    const [initialLoading, setInitialLoading] = useState(true);
    const [loading, setLoading] = useState(false);
    const [loadingButton, setLoadingButton] = useState(false);
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
                setUsername(value);
            }
        });
    }, []);

    useEffect(() => {
        const q = query(
            collection(db, 'messages'),
            orderBy('date', 'desc'),
            limit(25)
        ).withConverter(messageConverter);
        const unsub = onSnapshot(q, (doc) => {
            const newMessages = [...allMessages];
            for (const messageChange of doc.docChanges()) {
                if (messageChange.type === 'added') {
                    const notExists =
                        allMessages.filter((m) => m.id === messageChange.doc.id)
                            .length === 0;
                    if (notExists) {
                        if (initialLoading) {
                            newMessages.push(messageChange.doc.data());
                        } else {
                            newMessages.unshift(messageChange.doc.data());
                        }
                    }
                }
            }

            setAllMessages([...newMessages]);
            setInitialLoading(false);
            setLoading(false);
        });

        return () => unsub();
    }, [allMessages.length]);

    const sendMessage = async () => {
        setLoadingButton(true);
        const messageToSend = new Message(
            writtenMessage.trim(),
            new Date(),
            username
        );
        await addMessage(messageToSend);
        setLoadingButton(false);
        setWrittenMessage('');
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
                        <View style={styles.messageListContainer}>
                            <FlatList
                                data={allMessages}
                                renderItem={({ item }) => {
                                    return (
                                        <ChatBubble
                                            message={item}
                                            username={username}
                                        />
                                    );
                                }}
                                keyExtractor={(item) => item.id ?? ''}
                                style={styles.messageList}
                                inverted
                            />
                        </View>
                        <View style={styles.actionContainer}>
                            <TextInput
                                style={styles.input}
                                onChangeText={(value) =>
                                    setWrittenMessage(value)
                                }
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
    messageListContainer: {
        flex: 1,
        display: 'flex',
        justifyContent: 'flex-end',
    },
    messageList: {
        flexGrow: 0,
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
