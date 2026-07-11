import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getAnalytics } from 'firebase/analytics';

const firebaseConfig = {
  apiKey: 'AIzaSyCAGONaoDnZjob8oz1rTtd_vAARc3iGNos',
  authDomain: 'expense-tracker-61c58.firebaseapp.com',
  projectId: 'expense-tracker-61c58',
  storageBucket: 'expense-tracker-61c58.firebasestorage.app',
  messagingSenderId: '454757247190',
  appId: '1:454757247190:web:b305001ab9bad3be538177',
  measurementId: 'G-QGBBZXDXH0',
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account',
});

let analytics = null;
if (typeof window !== 'undefined') {
  analytics = getAnalytics(app);
}

export { app, auth, analytics, googleProvider };
