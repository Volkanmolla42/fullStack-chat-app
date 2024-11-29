import { useContext, useEffect, useState } from "react";
import assets from "../../../../assets/assets";
import "./RightSidebar.css";
import { AppContext } from "../../../../context/AppContext";

const RightSidebar = () => {
  const { chatUser, messages, isProfileOpen, toggleProfile } =
    useContext(AppContext);
  const [msgImages, setMsgImages] = useState([]);
  useEffect(() => {
    setMsgImages([]);
    const tempArray = messages
      .filter((msg) => msg.image)
      .map((msg) => msg.image);
    setMsgImages(tempArray);
  }, [messages]);

  if (chatUser) {
    return (
      <div className={`rs ${isProfileOpen ? "open" : ""}`}>
        <div className="rs-profile">
          <button onClick={toggleProfile} className="close-profile-x">
            <img src={assets.close_icon} alt="close profile button" />
          </button>
          <img
            src={chatUser.userData.avatar || assets.avatar_icon}
            alt="profile image"
            className="rs-profile-pic"
          />
          <h3>{chatUser.userData.name}</h3>
          <p> {chatUser.userData.bio} </p>
          <hr />
        </div>
        <div className="rs-media">
          <p className="">Media</p>
          <div className="rs-media-list">
            {msgImages.length === 0 ? (
              <p>No images</p>
            ) : (
              msgImages.map((url, index) => (
                <img
                  src={url}
                  alt="message image"
                  onClick={() => window.open(url)}
                  key={index}
                />
              ))
            )}
          </div>
        </div>
      </div>
    );
  }
};

export default RightSidebar;
