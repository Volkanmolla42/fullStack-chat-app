import { useContext, useEffect, useState } from "react";
import Chatbox from "../../components/ChatBox/Chatbox";
import LeftSidebar from "../../components/LeftSidebar/LeftSidebar";
import RightSidebar from "../../components/RightSidebar/RightSidebar";
import "./Chat.css";
import { AppContext } from "../../context/AppContext";

const Chat = () => {
  const [profileState, setProfileState] = useState(false);
  const toggleProfile = () => {
    setProfileState(!profileState);
  };

  const { chatData, userData } = useContext(AppContext);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (chatData && userData) {
      setLoading(false);
    }
    return () => {};
  }, [chatData, userData]);
  return (
    <div className="chat">
      {loading ? (
        <p className="loading">Loading..</p>
      ) : (
        <div className={`chat-container ${profileState ? "profile-open" : ""}`}>
          <LeftSidebar />
          <Chatbox toggleProfile={toggleProfile} />
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
