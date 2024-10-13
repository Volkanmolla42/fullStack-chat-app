import { doc, getDoc, onSnapshot, updateDoc } from "firebase/firestore";
import { createContext, useEffect, useState } from "react";
import { auth, db } from "../config/firebase";
import { useNavigate } from "react-router-dom";

export const AppContext = createContext();

const AppContextProvider = (props) => {
  const navigate = useNavigate();
  const [userData, setUserData] = useState({});
  const [chatData, setChatData] = useState([]);
  const [messagesId, setMessagesId] = useState(null);

  const [messages, setMessages] = useState([]);
  const [chatUser, setChatUser] = useState(null);

  const loadUserData = async (uid) => {
    try {
      const userRef = doc(db, "users", uid);
      const userSnap = await getDoc(userRef);
      const userData = userSnap.data();
      if (userData) {
        setUserData(userData);
        if (!userData.avatar && !userData.name) {
          navigate("/profile");
        }
      } else {
        console.error("User data is undefined");
      }
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    const updateLastSeen = async () => {
      if (auth.currentUser) {
        const userRef = doc(db, "users", auth.currentUser.uid);
        await updateDoc(userRef, {
          lastSeen: Date.now(),
        });
      }
    };

    const intervalId = setInterval(updateLastSeen, 5000);

    return () => clearInterval(intervalId);
  }, []);

  useEffect(() => {
    if (userData.id) {
      const chatRef = doc(db, "chats", userData.id);
      const unSub = onSnapshot(chatRef, async (res) => {
        const chatItems = res.data()?.chatsData;

        if (chatItems) {
          const tempData = [];
          for (const item of chatItems) {
            const userRef = doc(db, "users", item.rId);
            const userSnap = await getDoc(userRef);
            const userData = userSnap.data();
            tempData.push({ ...item, userData });
          }
          setChatData(tempData.sort((a, b) => b.updatedAt - a.updatedAt));
        } else {
          setChatData([]);
        }
      });
      return () => {
        unSub();
      };
    }
  }, [userData]);

  const value = {
    userData,
    setUserData,
    chatData,
    setChatData,
    loadUserData,
    messages,
    setMessages,
    messagesId,
    setMessagesId,
    chatUser,
    setChatUser,
  };

  return (
    // eslint-disable-next-line react/prop-types
    <AppContext.Provider value={value}>{props.children}</AppContext.Provider>
  );
};

export default AppContextProvider;
