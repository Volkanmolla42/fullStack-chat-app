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
const ProfileUpdate = () => {
  const [image, setImage] = useState(false);
  const [name, setName] = useState("");
  const [bio, setBio] = useState("");
  const [uid, setUid] = useState("");
  const [userName, setUserName] = useState();
  const [prevImage, setPrevImage] = useState("");
  const [isFormEdit, setIsFormEdit] = useState(true);
  const [count, setCount] = useState(0);
  const { setUserData, setTheme } = useContext(AppContext);
  const navigate = useNavigate();

  useEffect(() => {
    onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUid(user.uid);
        const docRef = doc(db, "users", user.uid);
        const docSnap = await getDoc(docRef);
        setUserName(docSnap.data().username);
        if (docSnap.data().name) setName(docSnap.data().name);

        if (docSnap.data().bio) setBio(docSnap.data().bio);
        if (docSnap.data().avatar) setPrevImage(docSnap.data().avatar);
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
      setIsFormEdit(false);
    } catch (error) {
      console.error(error);
      toast.error("An error occurred. Please try again.");
    }
  };

  const specialTheme = () => {
    setCount((c) => c + 1);
    if (count > 5) setCount(0);

    console.log(count);
    if (count === 4) {
      setTheme("helloKitty");
    }
  };

  const toggleForm = () => {
    setIsFormEdit(!isFormEdit);
  };

  return (
    <div className="profile">
      <div className="profile-container">
        <div className="top-buttons">
          <div onClick={() => navigate("/chat", { replace: true })}>
            <span>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512">
                <path d="M9.4 233.4c-12.5 12.5-12.5 32.8 0 45.3l160 160c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L109.2 288 416 288c17.7 0 32-14.3 32-32s-14.3-32-32-32l-306.7 0L214.6 118.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0l-160 160z" />
              </svg>
            </span>
            <span>Back</span>
          </div>
          <div onClick={toggleForm}>
            <span> {isFormEdit ? "View" : "Edit"} Profile</span>
            <span>
              {isFormEdit ? (
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 576 512">
                  <path d="M288 32c-80.8 0-145.5 36.8-192.6 80.6C48.6 156 17.3 208 2.5 243.7c-3.3 7.9-3.3 16.7 0 24.6C17.3 304 48.6 356 95.4 399.4C142.5 443.2 207.2 480 288 480s145.5-36.8 192.6-80.6c46.8-43.5 78.1-95.4 93-131.1c3.3-7.9 3.3-16.7 0-24.6c-14.9-35.7-46.2-87.7-93-131.1C433.5 68.8 368.8 32 288 32zM144 256a144 144 0 1 1 288 0 144 144 0 1 1 -288 0zm144-64c0 35.3-28.7 64-64 64c-7.1 0-13.9-1.2-20.3-3.3c-5.5-1.8-11.9 1.6-11.7 7.4c.3 6.9 1.3 13.8 3.2 20.7c13.7 51.2 66.4 81.6 117.6 67.9s81.6-66.4 67.9-117.6c-11.1-41.5-47.8-69.4-88.6-71.1c-5.8-.2-9.2 6.1-7.4 11.7c2.1 6.4 3.3 13.2 3.3 20.3z" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
                  <path d="M471.6 21.7c-21.9-21.9-57.3-21.9-79.2 0L362.3 51.7l97.9 97.9 30.1-30.1c21.9-21.9 21.9-57.3 0-79.2L471.6 21.7zm-299.2 220c-6.1 6.1-10.8 13.6-13.5 21.9l-29.6 88.8c-2.9 8.6-.6 18.1 5.8 24.6s15.9 8.7 24.6 5.8l88.8-29.6c8.2-2.7 15.7-7.4 21.9-13.5L437.7 172.3 339.7 74.3 172.4 241.7zM96 64C43 64 0 107 0 160L0 416c0 53 43 96 96 96l256 0c53 0 96-43 96-96l0-96c0-17.7-14.3-32-32-32s-32 14.3-32 32l0 96c0 17.7-14.3 32-32 32L96 448c-17.7 0-32-14.3-32-32l0-256c0-17.7 14.3-32 32-32l96 0c17.7 0 32-14.3 32-32s-14.3-32-32-32L96 64z" />
                </svg>
              )}
            </span>
          </div>
        </div>
        <h3>Profile Details</h3>

        <div className="profile-info">
          {isFormEdit ? (
            <div className="profile-edit">
              <form onSubmit={updateProfile}>
                <label htmlFor="avatar">
                  <input
                    onChange={(e) => setImage(e.target.files[0])}
                    type="file"
                    id="avatar"
                    accept=".png, .jpg, .jpeg"
                    hidden
                  />

                  <img
                    className="profile-pic-big"
                    src={
                      image
                        ? URL.createObjectURL(image)
                        : prevImage
                        ? prevImage
                        : assets.avatar_icon
                    }
                    alt="profile-image"
                  />
                </label>

                <input
                  autoComplete="off"
                  onChange={(e) => setName(e.target.value)}
                  value={name}
                  type="text"
                  placeholder="Your name"
                  required
                  maxLength={20}
                />

                <textarea
                  autoComplete="off"
                  onChange={(e) => setBio(e.target.value)}
                  value={bio}
                  placeholder="Write profile bio"
                  required
                ></textarea>
                <button type="submit">Save</button>
              </form>
            </div>
          ) : (
            <div className=" profile-view">
              <img
                onClick={specialTheme}
                className="profile-pic-big"
                src={
                  image
                    ? URL.createObjectURL(image)
                    : prevImage
                    ? prevImage
                    : assets.avatar_icon
                }
                alt="profile-image"
              />
              <p className="name">{name}</p>

              <p className="bio"> {bio} </p>
              <hr />
              <p className="username">
                <i>Username:</i> {userName}
              </p>
            </div>
          )}
        </div>

        <div className="themes">
          <button onClick={() => setTheme("light")} type="button">
            Light Mode
          </button>
          <button onClick={() => setTheme("dark")} type="button">
            Dark mode
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProfileUpdate;
