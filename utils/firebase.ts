// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import {getFirestore } from "firebase/firestore"
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyB8mCMpMayuh-JZnUk8MLK6k8hslwIHVqY",
  authDomain: "photo-gram-a4d9c.firebaseapp.com",
  projectId: "photo-gram-a4d9c",
  storageBucket: "photo-gram-a4d9c.appspot.com",
  messagingSenderId: "795978128028",
  appId: "1:795978128028:web:bed0f11dfe95e3b822ab59"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);