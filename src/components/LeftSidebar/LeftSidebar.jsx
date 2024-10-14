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

const LeftSidebar = () => {
  const navigate = useNavigate();
  const { userData, chatData, setChatUser, setMessagesId, messagesId } =
    useContext(AppContext);

  const [user, setUser] = useState(null);
  const [showSearch, setShowSearch] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
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
    try {
      setUser(null);
      setShowSearch(false);
      setIsMenuOpen(false);
      setActiveFriend(undefined);
      setMessagesId(null);
      setChatUser(null);
      await logout();
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <div className="ls">
      <div className="ls-top">
        <div className="ls-nav">
          <div className="ls-profile">
            <img
              src={userData.avatar || assets.avatar_icon}
              alt="profile image"
            />
            <span>ChatApp</span>
          </div>
          <div className="menu" onClick={toggleMenu}>
            <img src={assets.menu_icon} className="menu-icon" alt="menu icon" />
            {isMenuOpen && (
              <div className="sub-menu-list">
                <p onClick={() => navigate("/profile")}>Edit Profile</p>
                <hr />
                <p onClick={handleLogout}>Logout</p>
              </div>
            )}
          </div>
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
                        <img src={assets.chat_image} alt="" />
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
    </div>
  );
};

export default LeftSidebar;
