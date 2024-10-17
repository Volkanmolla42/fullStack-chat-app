import { useNavigate } from "react-router-dom";
import assets from "../../assets/assets";
import "./LeftSidebar.css";
import {
  arrayUnion,
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
} from "firebase/firestore";
import { db, logout } from "../../config/firebase";
import { useContext, useRef, useState } from "react";
import { AppContext } from "../../context/AppContext";
import { toast } from "react-toastify";

// eslint-disable-next-line react/prop-types
const LeftSidebar = ({ isFriendsOpen, setisFriendsOpen, setProfileState }) => {
  const navigate = useNavigate();
  const { userData, chatData, setChatUser, setMessagesId, messagesId } =
    useContext(AppContext);
  const [user, setUser] = useState(null);
  const [showSearch, setShowSearch] = useState(false);
  const [activeFriend, setActiveFriend] = useState(undefined);
  const searchInputRef = useRef();
  const inputHandler = async (e) => {
    const inputValue = e.target.value.trim().toLowerCase();
    setShowSearch(!!inputValue);
    if (!inputValue) return setUser(null);

    try {
      const foundUser = await findUser(inputValue);
      handleFoundUser(foundUser);
    } catch (error) {
      console.error("Error while searching for user:", error);
    }
  };

  const findUser = async (username) => {
    const userRef = collection(db, "users");
    const q = query(userRef, where("username", "==", username));
    const querySnapshot = await getDocs(q);
    return querySnapshot.empty ? null : querySnapshot.docs[0].data();
  };

  const handleFoundUser = (foundUser) => {
    if (foundUser && foundUser.id !== userData.id) {
      const userExists = chatData.some((chat) => chat.rId === foundUser.id);
      setUser(userExists ? null : foundUser);
    } else {
      setUser(null);
    }
  };

  const addChat = async () => {
    try {
      const newMessageRef = doc(collection(db, "messages"));
      await setDoc(newMessageRef, {
        createdAt: serverTimestamp(),
        messages: [],
      });

      const chatDataObj = {
        messageId: newMessageRef.id,
        lastMessage: "",
        updatedAt: Date.now(),
        messageSeen: false,
      };

      await Promise.all([
        updateDoc(doc(collection(db, "chats"), user.id), {
          chatsData: arrayUnion({
            ...chatDataObj,
            rId: userData.id,
            sId: user.id,
          }),
        }),
        updateDoc(doc(collection(db, "chats"), userData.id), {
          chatsData: arrayUnion({
            ...chatDataObj,
            rId: user.id,
            sId: userData.id,
          }),
        }),
      ]);

      return newMessageRef;
    } catch (error) {
      console.error("Error adding chat:", error);
    }
  };

  const handleAddChat = async () => {
    searchInputRef.current.value = "";
    setShowSearch(false);

    if (!user) {
      toast.error("Kullanıcı bulunamadı!");
      return;
    }

    // Check if chat already exists
    const existingChat = chatData.find((chat) => chat.rId === user.id);
    if (existingChat) {
      // If the chat already exists, go to that chat
      updateChat(existingChat);
      return;
    }

    try {
      const newMessageRef = await addChat();
      if (newMessageRef) {
        const newChat = {
          messageId: newMessageRef.id,
          sId: userData.id,
          rId: user.id,
          userData: { ...user },
          lastMessage: "",
          messageSeen: false,
        };

        setChatUser(newChat);
        setMessagesId(newMessageRef.id);
        setActiveFriend(newMessageRef.id);
        await updateChat(newChat);
      }
    } catch (error) {
      console.error("Sohbet başlatılamadı:", error);
    }
  };

  const updateChat = async (chat) => {
    setisFriendsOpen(false);
    try {
      setMessagesId(chat.messageId);
      setChatUser(chat);

      const userChatsRef = doc(db, "chats", userData.id);
      const userChatsSnapshot = await getDoc(userChatsRef);
      const userChatsData = userChatsSnapshot.data();

      if (userChatsData && userChatsData.chatsData) {
        const chatIndex = userChatsData.chatsData.findIndex(
          (c) => c.messageId === chat.messageId
        );
        if (chatIndex !== -1) {
          userChatsData.chatsData[chatIndex].messageSeen = true;
          await updateDoc(userChatsRef, { chatsData: userChatsData.chatsData });
        } else {
          console.error("Chat not found in user's chat data.");
        }
      } else {
        console.error("User chat data is undefined or empty.");
      }
    } catch (error) {
      console.error("Sohbet güncellenemedi:", error);
    }
    document.getElementById("chat-input")?.focus();
  };

  const handleLogout = async () => {
    setisFriendsOpen(false);
    try {
      setUser(null);
      setShowSearch(false);
      setActiveFriend(undefined);
      setMessagesId(null);
      setChatUser(null);
      await logout();
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const handleFriendsClose = () => {
    setProfileState(false);
    setisFriendsOpen(!isFriendsOpen);
  };

  return (
    <div className={`ls ${isFriendsOpen ? "ls-open" : ""}`}>
      <div className="ls-top">
        <div className="ls-profile">
          <img
            className="ls-profile-img"
            onClick={() => navigate("/profile")}
            src={userData.avatar || assets.avatar_icon}
            alt="profile image"
          />
          <span>ChatApp</span>
          <button
            onClick={handleFriendsClose}
            className={`close-friends ${isFriendsOpen ? "" : "on-close-icon"}`}
            type="button"
          >
            <div className="bar bar1"></div>
            <div className="bar bar2"></div>
            <div className="bar bar3"></div>
          </button>
        </div>

        <div className="ls-search">
          <img
            src={assets.search_icon}
            alt="search icon"
            className="search-icon"
          />
          <input
            autoComplete="off"
            ref={searchInputRef}
            onChange={inputHandler}
            type="text"
            placeholder="Search here.."
          />
        </div>
      </div>
      <div className="ls-list">
        {showSearch && user ? (
          <div onClick={handleAddChat} className="friends add-user">
            <img
              className="friends-pic"
              src={user.avatar || assets.avatar_icon}
              alt="user profile image"
            />
            <p>{user.name}</p>
          </div>
        ) : chatData ? (
          chatData
            .sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0))
            .map((item, index) => (
              <div
                onClick={() => {
                  updateChat(item);
                  setActiveFriend(item.messageId);
                }}
                key={index}
                className={`friends ${
                  item.messageSeen || item.messageId === messagesId
                    ? ""
                    : "border"
                } ${activeFriend === item.messageId ? "friends-active" : ""} `}
              >
                <img
                  src={item.userData?.avatar || assets.avatar_icon}
                  className="friends-pic"
                  alt="profile-pic"
                />
                <div className="msg-div">
                  <p>{item.userData?.name || "Unknown"}</p>
                  <div>
                    {item.lastMessage === "Image" ? (
                      <div className="img-msg-div">
                        <span>Image</span>
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 512 512"
                        >
                          <path d="M448 80c8.8 0 16 7.2 16 16l0 319.8-5-6.5-136-176c-4.5-5.9-11.6-9.3-19-9.3s-14.4 3.4-19 9.3L202 340.7l-30.5-42.7C167 291.7 159.8 288 152 288s-15 3.7-19.5 10.1l-80 112L48 416.3l0-.3L48 96c0-8.8 7.2-16 16-16l384 0zM64 32C28.7 32 0 60.7 0 96L0 416c0 35.3 28.7 64 64 64l384 0c35.3 0 64-28.7 64-64l0-320c0-35.3-28.7-64-64-64L64 32zm80 192a48 48 0 1 0 0-96 48 48 0 1 0 0 96z" />
                        </svg>
                      </div>
                    ) : (
                      <span>{item.lastMessage}</span>
                    )}
                  </div>
                </div>
              </div>
            ))
        ) : (
          <p>Hata oluştu</p>
        )}
      </div>
      <div className="ls-bottom">
        <div className="logout">
          <button onClick={handleLogout}>
            Log out{" "}
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
              <path d="M377.9 105.9L500.7 228.7c7.2 7.2 11.3 17.1 11.3 27.3s-4.1 20.1-11.3 27.3L377.9 406.1c-6.4 6.4-15 9.9-24 9.9c-18.7 0-33.9-15.2-33.9-33.9l0-62.1-128 0c-17.7 0-32-14.3-32-32l0-64c0-17.7 14.3-32 32-32l128 0 0-62.1c0-18.7 15.2-33.9 33.9-33.9c9 0 17.6 3.6 24 9.9zM160 96L96 96c-17.7 0-32 14.3-32 32l0 256c0 17.7 14.3 32 32 32l64 0c17.7 0 32 14.3 32 32s-14.3 32-32 32l-64 0c-53 0-96-43-96-96L0 128C0 75 43 32 96 32l64 0c17.7 0 32 14.3 32 32s-14.3 32-32 32z" />
            </svg>
          </button>
        </div>
        <div className="copy">
          &copy; {new Date().getFullYear()} ChatApp. All rights reserved.
        </div>
      </div>
    </div>
  );
};

export default LeftSidebar;
