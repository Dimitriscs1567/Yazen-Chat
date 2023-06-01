import {
    QueryDocumentSnapshot,
    addDoc,
    collection,
    doc,
    getDoc,
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

export const addUser = async (name: string) => {
    try {
        const usersRef = collection(db, "users");
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
        const messagesRef = collection(db, "messages");
        let q;
        if (lastDoc) {
            q = query(messagesRef, orderBy("date", "desc"), limit(25), startAfter(lastDoc)).withConverter(messageConverter);
        }
        else {
            q = query(messagesRef, orderBy("date", "desc"), limit(25)).withConverter(messageConverter);
        }

        const allDocs = (await getDocs(q)).docs
        return [...allDocs.map(d => d.data()), allDocs[allDocs.length - 1]];
    } catch (e) {
        return [];
    }
};


export const addMessage = async (message: Message) => {
    try {
        const messagesRef = collection(db, "messages");
        await addDoc(messagesRef, messageConverter.toFirestore(message));
    } catch (e) {
        return
    }
};