import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";  // <-- importe getStorage

const firebaseConfig = {
  apiKey: "AIzaSyDoRB6panQnFGfAjIBHR2BFDkyaaDbfVH4",
  authDomain: "babydeck-4f36e.firebaseapp.com",
  projectId: "babydeck-4f36e",
  storageBucket: "babydeck-4f36e.appspot.com",
  messagingSenderId: "307136087690",
  appId: "1:307136087690:web:d3b93a13f7418060284f73",
  measurementId: "G-CMS25KD4L0"
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);  // <-- initialise et exporte storage
