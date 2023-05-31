export class Message {
    id?: string
    message: string
    date: Date
    username: string

    constructor(message: string, date: Date, username: string, id?: string) {
        this.message = message;
        this.date = date;
        this.username = username
        this.id = id;
    }
}

// Firestore data converter
export const messageConverter = {
    toFirestore: (message: Message) => {
        return {
            message: message.message,
            date: message.date.toISOString(),
            username: message.username,
        };
    },
    fromFirestore: (snapshot: any, options: any) => {
        const data = snapshot.data(options);
        return new Message(data.message, new Date(data.date), data.username, snapshot.id);
    }
};