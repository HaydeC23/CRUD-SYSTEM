 // Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.10.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/11.10.0/firebase-analytics.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/11.10.0/firebase-firestore.js";

// Your web app's Firebase configuration
export const firebaseConfig = {
    apiKey: "AIzaSyCqdcY4LcTs1bHqnAoQb4qfkn96pbAHcLU",
    authDomain: "hayde-project-d0484.firebaseapp.com",
    projectId: "hayde-project-d0484",
    storageBucket: "hayde-project-d0484.firebasestorage.app",
    messagingSenderId: "166417766055",
    appId: "1:166417766055:web:b87f0120961849d6452d82",
    measurementId: "G-124JH6L9KW"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const analytics = getAnalytics(app);
export const db = getFirestore(app);