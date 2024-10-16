import { Route, Routes, useNavigate } from "react-router-dom";
import Login from "./pages/Login/Login";
import Chat from "./pages/Chat/Chat";
import ProfileUpdate from "./pages/ProfileUpdate/ProfileUpdate";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useContext, useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./config/firebase";
import { AppContext } from "./context/AppContext";

const App = () => {
  const navigate = useNavigate();
  const { loadUserData } = useContext(AppContext);
  const [theme, setTheme] = useState(localStorage.getItem("theme") || "dark");

  const themeStyles = {
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
  };

  const applyTheme = (theme) => {
    const root = document.documentElement;
    const styles = themeStyles[theme];

    Object.entries(styles).forEach(([key, value]) => {
      root.style.setProperty(key, value);
    });

    localStorage.setItem("theme", theme);
  };

  useEffect(() => {
    applyTheme(theme);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [theme]);

  const handleAuthStateChange = (user) => {
    if (user) {
      navigate("/chat", { replace: true });
      loadUserData(user.uid);
    } else {
      navigate("/", { replace: true });
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, handleAuthStateChange);
    return () => unsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <ToastContainer />
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/chat" element={<Chat />} />
        <Route
          path="/profile"
          element={<ProfileUpdate setTheme={setTheme} />}
        />
      </Routes>
    </>
  );
};

export default App;
