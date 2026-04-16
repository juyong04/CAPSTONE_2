import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

// Firebase 설정 - 실제 값으로 교체하세요
const firebaseConfig = {
  apiKey: "AIzaSyBVa43WWRo449K5m6g0MSuO1ZRDDB9_-_U",
  authDomain: "capstone2-a7107.firebaseapp.com",
  projectId: "capstone2-a7107",
  storageBucket: "capstone2-a7107.firebasestorage.app",
  messagingSenderId: "250261611850",
  appId: "1:250261611850:web:730ea8d8134f93306d8db3",
  measurementId: "G-8QBGN7F4W4"
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
export const auth = getAuth(app);
export default app;
