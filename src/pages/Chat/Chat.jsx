import { useContext, useEffect, useState } from "react";
import Chatbox from "./components/ChatBox/Chatbox";
import LeftSidebar from "./components/LeftSidebar/LeftSidebar";
import RightSidebar from "./components/RightSidebar/RightSidebar";

import "./Chat.css";

import { AppContext } from "../../context/AppContext";

const Chat = () => {
  const { chatData, userData, isProfileOpen } = useContext(AppContext);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (chatData && userData) {
      setLoading(false);
    }
  }, [chatData, userData]);
  return (
    <div className="chat">
      {loading ? (
        <p className="loading">Loading..</p>
      ) : (
        <div
          className={`chat-container ${
            isProfileOpen ? "profile-open" : ""
          } message-open`}
        >
          <LeftSidebar />
          <Chatbox />
          <RightSidebar />
        </div>
      )}
    </div>
  );
};

export default Chat;
