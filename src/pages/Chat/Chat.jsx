import { useContext, useEffect, useState } from "react";
import Chatbox from "./components/ChatBox/Chatbox";
import LeftSidebar from "./components/LeftSidebar/LeftSidebar";
import RightSidebar from "./components/RightSidebar/RightSidebar";

import "./Chat.css";

import { AppContext } from "../../context/AppContext";

const Chat = () => {
  const [profileState, setProfileState] = useState(false);
  const [isFriendsOpen, setisFriendsOpen] = useState(true);
  const { chatData, userData } = useContext(AppContext);
  const [loading, setLoading] = useState(true);

  const toggleProfile = () => {
    setisFriendsOpen(false);
    setProfileState(!profileState);
  };

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
        <div className={`chat-container ${profileState ? "profile-open" : ""}`}>
          <LeftSidebar
            isFriendsOpen={isFriendsOpen}
            setisFriendsOpen={setisFriendsOpen}
            setProfileState={setProfileState}
          />
          <Chatbox
            isFriendsOpen={isFriendsOpen}
            setisFriendsOpen={setisFriendsOpen}
            toggleProfile={toggleProfile}
          />
          <RightSidebar
            profileState={profileState}
            toggleProfile={toggleProfile}
          />
        </div>
      )}
    </div>
  );
};

export default Chat;
