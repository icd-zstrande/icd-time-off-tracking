import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID
};

// Debug environment variables
console.log('Firebase Config:', {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY ? 'exists' : 'missing',
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN ? 'exists' : 'missing',
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID ? 'exists' : 'missing',
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET ? 'exists' : 'missing',
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID ? 'exists' : 'missing',
  appId: process.env.REACT_APP_FIREBASE_APP_ID ? 'exists' : 'missing'
});

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Get Auth and Firestore instances
export const auth = getAuth(app);
export const db = getFirestore(app);

export default app; 