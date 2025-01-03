import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyAiGUhy7wxVR9deIK1bHwQ3DAFWPxeQDSY",
  authDomain: "icd-time-off-tracking.firebaseapp.com",
  projectId: "icd-time-off-tracking",
  storageBucket: "icd-time-off-tracking.firebasestorage.app",
  messagingSenderId: "1067528510964",
  appId: "1:1067528510964:web:e5a38708441dec7edf6da1"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);

// Enable timestamps in snapshots
db.settings?.({ timestampsInSnapshots: true }); 