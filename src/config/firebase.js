import { initializeApp } from "firebase/app";
import {
  createUserWithEmailAndPassword,
  getAuth,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut,
} from "firebase/auth";
import {
  doc,
  getFirestore,
  setDoc,
  serverTimestamp,
  collection,
  query,
  where,
  getDocs,
} from "firebase/firestore";
import { toast } from "react-toastify";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: "chatapp3-a3543.firebaseapp.com",
  projectId: "chatapp3-a3543",
  storageBucket: "chatapp3-a3543.appspot.com",
  messagingSenderId: "807118890111",
  appId: "1:807118890111:web:347f437b1d5184c4464b4a",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

const auth = getAuth(app);
const db = getFirestore(app);

const signup = async (username, email, password) => {
  try {
    const res = await createUserWithEmailAndPassword(auth, email, password);
    const user = res.user;

    await Promise.all([
      setDoc(doc(db, "users", user.uid), {
        id: user.uid,
        username: username.toLowerCase(),
        email,
        name: "",
        avatar: "",
        bio: "Hey There I'm using chat app",
        lastSeen: serverTimestamp(),
      }),
      setDoc(doc(db, "chats", user.uid), {
        chatsData: [],
      }),
    ]);
  } catch (error) {
    console.error(error);
    toast.error(error.code.split("/")[1].split("-").join(" "));
  }
};

const login = async (email, password) => {
  try {
    await signInWithEmailAndPassword(auth, email, password);
  } catch (error) {
    console.error(error);
    toast.error(error.code.replace(/-/g, " ").split("/")[1]);
  }
};

const logout = async () => {
  try {
    await signOut(auth);
  } catch (error) {
    console.error(error);
    toast.error(error.code.split("/")[1].split("-").join(" "));
  }
};

const resetPass = async (email) => {
  if (!email) {
    toast.error("Enter your email");
    return;
  }
  try {
    const userRef = collection(db, "users");
    const q = query(userRef, where("email", "==", email));
    const querySnapshot = await getDocs(q);
    if (querySnapshot.empty) {
      toast.error("Email not found");
      return;
    } else {
      await sendPasswordResetEmail(auth, email);
      toast.success("Reset Email Sent");
    }
  } catch (error) {
    console.error(error);
    toast.error(error);
  }
};

export { signup, login, logout, auth, db, resetPass };
