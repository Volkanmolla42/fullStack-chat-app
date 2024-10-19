import { useContext, useEffect, useState } from "react";
import assets from "../../../../assets/assets";
import "./Chatbox.css";
import { AppContext } from "../../../../context/AppContext";
import {
  arrayUnion,
  doc,
  getDoc,
  onSnapshot,
  updateDoc,
} from "firebase/firestore";
import { db } from "../../../../config/firebase";
import { toast } from "react-toastify";
import upload from "../../../../lib/upload";
const Chatbox = () => {
  const {
    userData,
    messagesId,
    chatUser,
    messages,
    setMessages,
    toggleProfile,
    theme,
  } = useContext(AppContext);
  const [isOnline, setIsOnline] = useState(false);
  const [input, setInput] = useState("");

  useEffect(() => {
    if (messagesId) {
      const unSub = onSnapshot(doc(db, "messages", messagesId), (res) => {
        const fetchedMessages = res.data()?.messages || [];
        setMessages(fetchedMessages.reverse());
      });
      return () => unSub();
    } else {
      setMessages([]);
    }
  }, [messagesId, setMessages]);

  const updateChatData = async (userIDs, lastMessage) => {
    if (!Array.isArray(userIDs) || userIDs.length === 0) {
      console.error("userIDs is not a valid array or is empty.");
      return;
    }

    await Promise.all(
      userIDs.map(async (id) => {
        const userChatsRef = doc(db, "chats", id);
        const userChatsSnapshot = await getDoc(userChatsRef);

        if (userChatsSnapshot.exists()) {
          const userChatData = userChatsSnapshot.data();
          const chatIndex = userChatData.chatsData.findIndex(
            (c) => c.messageId === messagesId
          );

          if (chatIndex !== -1) {
            const updatedChat = userChatData.chatsData[chatIndex];
            updatedChat.lastMessage = lastMessage;
            updatedChat.updatedAt = Date.now();

            if (updatedChat.rId === userData.id) {
              updatedChat.messageSeen = false;
            }

            await updateDoc(userChatsRef, {
              chatsData: userChatData.chatsData,
            });
          } else {
            console.error("Chat not found in chatsData.");
          }
        } else {
          console.error("User chat document does not exist.");
        }
      })
    );
  };

  const sendMessage = async () => {
    const inputValue = input.trim();
    setInput("");
    if (!inputValue || !messagesId || !chatUser || !chatUser.sId) {
      return;
    }

    try {
      await updateDoc(doc(db, "messages", messagesId), {
        messages: arrayUnion({
          sId: userData.id,
          text: inputValue,
          createdAt: new Date(),
        }),
      });
      await updateChatData(
        [chatUser.rId, userData.id],
        inputValue.slice(0, 30)
      );
    } catch (error) {
      toast.error(error.message);
      console.log("Error sending message:", error);
    }
  };

  const sendImage = async (e) => {
    try {
      const fileUrl = await upload(e.target.files[0]);

      if (fileUrl && messagesId) {
        await updateDoc(doc(db, "messages", messagesId), {
          messages: arrayUnion({
            sId: userData.id,
            image: fileUrl,
            createdAt: new Date(),
          }),
        });

        await updateChatData([chatUser.rId, userData.id], "Image");
      }
    } catch (error) {
      toast.error(error.message);
      console.error(error);
    }
  };

  const convertTimestamp = (timestamp) => {
    const date = timestamp.toDate();
    return `${date.getHours().toString().padStart(2, "0")}:${date
      .getMinutes()
      .toString()
      .padStart(2, "0")}`;
  };

  useEffect(() => {
    if (!chatUser || !chatUser.userData?.lastSeen) return;

    const updateLastSeen = async () => {
      const userRef = doc(db, "users", chatUser.userData.id);
      const userSnap = await getDoc(userRef);

      if (userSnap.exists()) {
        const { lastSeen } = userSnap.data();
        const lastSeenDifference = Date.now() - lastSeen;
        setIsOnline(lastSeenDifference <= 12000);
      }
    };

    updateLastSeen();
    const intervalId = setInterval(updateLastSeen, 10000);
    return () => clearInterval(intervalId);
  }, [chatUser]);

  return chatUser ? (
    <div
      style={{
        backgroundImage: `${
          theme === "helloKitty" ? "url(/hellokity3.png)" : "url(/wptheme.jpg)"
        }`,
      }}
      className="chat-box"
    >
      <div
        className="chat-user"
        onClick={() => {
          toggleProfile();
        }}
      >
        <img
          id="chat-user-pic"
          src={chatUser.userData.avatar || assets.avatar_icon}
          alt="profile"
        />
        <p>
          <span>{chatUser.userData.name}</span>
          {isOnline && <img src={assets.green_dot} className="dot" alt="" />}
        </p>
      </div>

      <div className="chat-msg">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={msg.sId === userData.id ? "s-msg" : "r-msg"}
          >
            <div className={`msg ${msg.image ? "msg-img-container" : ""}`}>
              {msg.image ? (
                <>
                  <img src={msg.image} alt="message" />
                  <span>{convertTimestamp(msg.createdAt)}</span>
                </>
              ) : (
                <>
                  {msg.text} <span>{convertTimestamp(msg.createdAt)}</span>
                </>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="chat-input-area">
        <input
          autoComplete="off"
          autoCorrect="off"
          spellCheck="false"
          type="search"
          inputMode="text"
          onChange={(e) => setInput(e.target.value)}
          value={input}
          placeholder="Send a message.."
          className="chat-input"
          id="chat-input"
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
        />
        <input
          autoComplete="off"
          onChange={sendImage}
          type="file"
          id="image"
          accept="image/png, image/jpeg"
          hidden
        />{" "}
        <span>
          <label htmlFor="image">
            <img src={assets.gallery_icon} alt="gallery" />
          </label>
          <img onClick={sendMessage} src={assets.send_button} alt="send" />
        </span>
      </div>
    </div>
  ) : (
    <div className="chat-welcome">
      <img src="/chat_app.svg" alt="logo" />
      <p>Chat anytime, anywhere</p>
    </div>
  );
};

export default Chatbox;
