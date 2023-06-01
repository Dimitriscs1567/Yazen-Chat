import { View, StyleSheet, Text } from 'react-native';
import { Message } from '../../models/message';

type Props = {
    message: Message;
    username: string;
};

const ChatBubble = (props: Props) => {
    const isUsersMessage = props.message.username === props.username;
    const getTimeDifference = () => {
        const diff = new Date().getTime() - props.message.date.getTime();

        const hours = Math.floor(diff / 1000 / 60 / 60);
        if (hours > 0) {
            return `${hours} hours before`;
        }
        const minutes = Math.floor(diff / 1000 / 60);
        if (minutes > 0) {
            return `${minutes} minutes before`;
        }
        const seconds = Math.floor(diff / 1000);
        if (seconds > 0) {
            return `${seconds} seconds before`;
        }

        return 'just now';
    };

    return (
        <View
            style={[
                styles.container,
                isUsersMessage
                    ? {
                          alignSelf: 'flex-end',
                          backgroundColor: 'blue',
                          borderTopLeftRadius: 20,
                      }
                    : {
                          alignSelf: 'flex-start',
                          backgroundColor: 'grey',
                          borderTopRightRadius: 20,
                      },
            ]}
        >
            <Text style={styles.message}>{props.message.message}</Text>
            <Text
                style={styles.messageInfo}
            >{`by ${props.message.username}`}</Text>
            <Text style={styles.messageInfo}>{getTimeDifference()}</Text>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        maxWidth: 240,
        display: 'flex',
        flexDirection: 'column',
        borderBottomLeftRadius: 20,
        borderBottomRightRadius: 20,
        marginBottom: 8,
        paddingHorizontal: 10,
        paddingVertical: 5,
    },
    message: {
        fontSize: 17,
        color: 'white',
        marginBottom: 10,
    },
    messageInfo: {
        fontSize: 12,
        color: 'white',
        fontStyle: 'italic',
        textAlign: 'right',
    },
});

export default ChatBubble;
