import { initializeApp } from 'firebase/app';

// Initialize Firebase
const firebaseConfig = {
    apiKey: 'AIzaSyA1mp3N20p0xFDj2WKxaZDImNf2obbtZMs',
    authDomain: 'ekvj-chat.firebaseapp.com',
    projectId: 'ekvj-chat',
    storageBucket: 'ekvj-chat.appspot.com',
    messagingSenderId: '162746462712',
    appId: '1:162746462712:web:3eb657c3c319b61ea0a60d',
};

export const app = initializeApp(firebaseConfig);
