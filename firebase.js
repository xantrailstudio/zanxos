// firebase.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyAgbrx0T-SLBO6iRMn03IL1FoYWgSLOZNE",
  authDomain: "xancore.firebaseapp.com",
  projectId: "xancore",
  storageBucket: "xancore.appspot.com",
  messagingSenderId: "627799912148",
  appId: "1:627799912148:web:aaa979828231c71df95541"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);