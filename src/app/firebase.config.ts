// Import the functions you need from the SDKs you need
import { initializeApp, getApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth, Auth } from "firebase/auth";
import { getFirestore, Firestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyC-LmPOZevE9E1xKD-Goat_wPHznTv8f58",
  authDomain: "vj-vehicle-management.firebaseapp.com",
  projectId: "vj-vehicle-management",
  storageBucket: "vj-vehicle-management.firebasestorage.app",
  messagingSenderId: "825360428563",
  appId: "1:825360428563:web:482b89f8571429e18819e6",
  measurementId: "G-3BM5MJK1WE"
};

// Initialize Firebase
let app: any;
try {
  app = getApp();
} catch (error) {
  app = initializeApp(firebaseConfig);
}

const analytics = getAnalytics(app);
let authInstance: Auth;
let firestoreInstance: Firestore;

// Export functions that ensure instances are initialized
export function getAuthInstance(): Auth {
  if (!authInstance) {
    authInstance = getAuth(app);
  }
  return authInstance;
}

export function getFirestoreInstance(): Firestore {
  if (!firestoreInstance) {
    firestoreInstance = getFirestore(app);
  }
  return firestoreInstance;
}

export { app };