import { doc, getDoc, onSnapshot, updateDoc } from "firebase/firestore";
import { createContext, useEffect, useMemo, useState } from "react";
import { auth, db } from "../config/firebase";
import { useNavigate } from "react-router-dom";
import PropTypes from "prop-types";

export const AppContext = createContext();

const AppContextProvider = (props) => {
  const navigate = useNavigate();
  const [userData, setUserData] = useState({});
  const [chatData, setChatData] = useState([]);
  const [messagesId, setMessagesId] = useState(null);

  const [messages, setMessages] = useState([]);
  const [chatUser, setChatUser] = useState(null);
  const [chatTheme, setChatTheme] = useState(
    localStorage.getItem("theme") || "dark"
  );

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

    const intervalId = setInterval(updateLastSeen, 10000);

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

  const themeStyles = useMemo(
    () => ({
      light: {
        "--first-color": "#eeeeee",
        "--light-first-color": "#eeeeee",
        "--secondary-color": "#a1a1a8",
        "--light-secondary-color": "#772233",
        "--white-color": "#000000",
        "--black-color": "#24252c",
        "--light-gray-color": "#191a1f",
      },
      dark: {
        "--first-color": "#191a1f",
        "--light-first-color": "#24252c",
        "--secondary-color": "#772233",
        "--light-secondary-color": "#be3b5a",
        "--white-color": "#eeeeee",
        "--black-color": "#000000",
        "--light-gray-color": "#a1a1a8",
      },
      helloKitty: {
        "--first-color": "#F2F1F2",
        "--light-first-color": "#F5A3C8",
        "--secondary-color": "#ED0D92",
        "--light-secondary-color": "#0E000A",
        "--white-color": "#0E000A",
        "--black-color": "#dddddd",
        "--light-gray-color": "#F5A3C8",
      },
    }),
    []
  );

  useEffect(() => {
    const root = document.documentElement;
    const styles = themeStyles[chatTheme];

    Object.entries(styles).forEach(([key, value]) => {
      root.style.setProperty(key, value);
    });

    localStorage.setItem("theme", chatTheme);
  }, [chatTheme, themeStyles]);

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
    chatTheme,
    setChatTheme,
  };

  return (
    <AppContext.Provider value={value}>{props.children}</AppContext.Provider>
  );
};
AppContextProvider.propTypes = {
  children: PropTypes.node.isRequired,
};
export default AppContextProvider;
