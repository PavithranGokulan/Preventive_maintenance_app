import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth, initializeAuth, getReactNativePersistence } from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Your Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDpnv-TPQWvzdNfGROzFkaWo4IF_vzmS9I",
  authDomain: "schedulemaintenanceapp.firebaseapp.com",
  projectId: "schedulemaintenanceapp",
  storageBucket: "schedulemaintenanceapp.appspot.com",
  messagingSenderId: "400370866534",
  appId: "1:400370866534:android:ef72c2280f3f58b3df10a7",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore
const db = getFirestore(app);

const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage),
}); 

// Export the initialized services for use in your application
export { db, auth };
