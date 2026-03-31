import { auth, db } from "./firebase.js";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup
} from "https://www.gstatic.com/firebasejs/10.7.0/firebase-auth.js";

import {
  doc,
  setDoc,
  getDoc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.7.0/firebase-firestore.js";
import { showModal } from "./ui-utils.js";


function getInput(id) {
  return document.getElementById(id)?.value || "";
}

async function showError(title, err) {
  // Hide loading states if any
  document.querySelectorAll('button[type="submit"]').forEach(btn => {
    btn.disabled = false;
    const originalText = btn.dataset.originalText || (btn.innerText.includes("Log") ? "Log In" : "Sign Up");
    btn.innerText = originalText;
  });

  await showModal(title, err, true);
}


window.login = () => {
  const email = getInput("email");
  const password = getInput("password");
  const btn = document.querySelector('button[type="submit"]');

  if (btn) {
    btn.disabled = true;
    btn.innerText = "Loading...";
  }

  signInWithEmailAndPassword(auth, email, password)
    .then(() => {
      window.location.href = "os.html";
    })
    .catch(e => {
      showError("Login Failed", e.message);
    });
};


window.signup = async () => {
  const name = getInput("name");
  const email = getInput("email");
  const password = getInput("password");
  const btn = document.querySelector('button[type="submit"]');

  if (!name) {
    showError("Name is required");
    return;
  }

  if (btn) {
    btn.disabled = true;
    btn.innerText = "Creating...";
  }

  try {
    const userCred = await createUserWithEmailAndPassword(auth, email, password);

    await setDoc(doc(db, "users", userCred.user.uid), {
      name: name,
      email: email,
      createdAt: serverTimestamp()
    });

    await showModal("Success", "Your account has been created successfully!");
    window.location.href = "os.html";
  } catch (e) {
    showError("Signup Failed", e.message);
  }
};


window.googleAuth = async () => {
  const provider = new GoogleAuthProvider();
  try {
    const result = await signInWithPopup(auth, provider);
    const user = result.user;

    // Check if user exists in Firestore
    const userDoc = await getDoc(doc(db, "users", user.uid));

    if (!userDoc.exists()) {
      // Create new user record
      await setDoc(doc(db, "users", user.uid), {
        name: user.displayName,
        email: user.email,
        createdAt: serverTimestamp(),
        provider: "google"
      });
    }

    window.location.href = "os.html";
  } catch (e) {
    showError("Google Auth Error", e.message);
  }
};

