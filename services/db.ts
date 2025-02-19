import {
    QueryDocumentSnapshot,
    addDoc,
    collection,
    getDocs,
    getFirestore,
    limit,
    orderBy,
    query,
    startAfter,
    where,
} from "firebase/firestore";
import { app } from "../firebaseConfig";
import { messageConverter, Message } from "../models/message";

export const db = getFirestore(app);

export const dbUsersName = "dimiscs_users"
export const dbMessagesName = "dimiscs_messages"

export const addUser = async (name: string) => {
    try {
        const usersRef = collection(db, dbUsersName);
        const q = query(usersRef, where("name", "==", name));
        const res = await getDocs(q);

        if (res.empty) {
            await addDoc(usersRef, {
                name: name,
            });

            return true;
        }

        return false;
    } catch (e) {
        return false;
    }
};

export const getMessages = async (lastDoc?: QueryDocumentSnapshot<Message>) => {
    try {
        const messagesRef = collection(db, dbMessagesName);
        let q;
        if (lastDoc) {
            q = query(messagesRef, orderBy("date", "desc"), limit(25), startAfter(lastDoc)).withConverter(messageConverter);
        }
        else {
            q = query(messagesRef, orderBy("date", "desc"), limit(25)).withConverter(messageConverter);
        }

        const allDocs = (await getDocs(q)).docs
        if (allDocs.length > 0)
            return [...allDocs.map(d => d.data()), allDocs[allDocs.length - 1]];
        return []
    } catch (e) {
        return [];
    }
};


export const addMessage = async (message: Message) => {
    try {
        const messagesRef = collection(db, dbMessagesName);
        await addDoc(messagesRef, messageConverter.toFirestore(message));
    } catch (e) {
        return
    }
};