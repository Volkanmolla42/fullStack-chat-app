import "./ProfileUpdate.css";
import assets from "../../assets/assets";
import { useContext, useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "../../config/firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import upload from "../../lib/upload";
import { AppContext } from "../../context/AppContext";
// eslint-disable-next-line react/prop-types
const ProfileUpdate = ({ setTheme }) => {
  const [image, setImage] = useState(false);
  const [name, setName] = useState("");
  const [bio, setBio] = useState("");
  const [uid, setUid] = useState("");
  const [prevImage, setPrevImage] = useState("");
  const [count, setCount] = useState(0);
  const { setUserData } = useContext(AppContext);
  const navigate = useNavigate();

  useEffect(() => {
    onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUid(user.uid);
        const docRef = doc(db, "users", user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.data().name) setName(docSnap.data().name);
        if (docSnap.data().bio) setBio(docSnap.data().bio);
        if (docSnap.data().avatar) setPrevImage(docSnap.data().avatar);
      } else {
        navigate("/", { replace: true });
      }
    });
  }, [navigate]);

  const updateProfile = async (e) => {
    e.preventDefault();
    try {
      const docRef = doc(db, "users", uid);
      if (image) {
        const imgUrl = await upload(image);
        setPrevImage(imgUrl);
        await updateDoc(docRef, {
          avatar: imgUrl,
          bio: bio,
          name: name,
        });
      } else {
        await updateDoc(docRef, {
          bio: bio,
          name: name,
        });
      }
      const snap = await getDoc(docRef);
      setUserData(snap.data());
      navigate("/chat", { replace: "true" });
    } catch (error) {
      console.error(error);
      toast.error("An error occurred. Please try again.");
    }
  };

  const SwitchThemeTo = (theme) => {
    setTheme(theme);
  };

  const specialTheme = () => {
    setCount((c) => c + 1);
    console.log(count);
    if (count === 4) {
      SwitchThemeTo("helloKitty");
    }
  };

  return (
    <div className="profile">
      <div className="profile-container">
        <div className=" side left-side">
          <form onSubmit={updateProfile}>
            <h3>Profile Details</h3>
            <label htmlFor="avatar">
              <input
                onChange={(e) => setImage(e.target.files[0])}
                type="file"
                id="avatar"
                accept=".png, .jpg, .jpeg"
                hidden
              />
              <img
                src={
                  image
                    ? URL.createObjectURL(image)
                    : prevImage
                    ? prevImage
                    : assets.avatar_icon
                }
                alt=""
              />
              upload profile image
            </label>
            <input
              onChange={(e) => setName(e.target.value)}
              value={name}
              type="text"
              placeholder="Your name"
              required
              maxLength={20}
              autoComplete="off"
            />
            <textarea
              onChange={(e) => setBio(e.target.value)}
              value={bio}
              placeholder="Write profile bio"
              required
              autoComplete="off"
            ></textarea>

            <button type="submit">Save</button>
          </form>
        </div>
        <div className=" side right-side">
          <img
            onClick={() => specialTheme()}
            className="profile-pic-big"
            src={
              image
                ? URL.createObjectURL(image)
                : prevImage
                ? prevImage
                : assets.avatar_icon
            }
            alt=""
          />
          <div>
            <button onClick={() => SwitchThemeTo("light")} type="button">
              Light Mode
            </button>
            <button onClick={() => SwitchThemeTo("dark")} type="button">
              Dark mode
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileUpdate;
