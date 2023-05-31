import { initializeApp } from 'firebase/app';

// Initialize Firebase
const firebaseConfig = {
    apiKey: 'AIzaSyD9zVwEFwSG_d8x7rIZtrpj3Jy7ULWFHoc',
    authDomain: 'yazen-chat.firebaseapp.com',
    projectId: 'yazen-chat',
    storageBucket: 'yazen-chat.appspot.com',
    messagingSenderId: '695677528172',
    appId: '1:695677528172:web:aab9d1130dd91f6a579049',
};

export const app = initializeApp(firebaseConfig);
