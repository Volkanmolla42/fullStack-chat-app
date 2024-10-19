import "./Login.css";
import { login, signup, resetPass } from "../../config/firebase";
import { useState } from "react";

const Login = () => {
  const [userName, setUserName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isNewUser, toggleIsNewUser] = useState(true);

  const handleOnSubmit = (e) => {
    e.preventDefault();
    if (isNewUser) {
      signup(userName, email, password);
    } else {
      login(email, password);
    }
  };

  return (
    <div className="login">
      <div className="login-logo">
        <img src="/chat_app.svg" alt="" />
        <div>ChatApp</div>
      </div>
      <div className="login-form-container">
        <form className="login-form" onSubmit={handleOnSubmit}>
          <h2>{isNewUser ? "Sign Up" : "Log In"} </h2>
          {isNewUser ? (
            <input
              autoComplete="off"
              type="text"
              placeholder="Username"
              required
              className="form-input"
              onChange={(e) => setUserName(e.target.value)}
              value={userName}
            />
          ) : null}

          <input
            autoComplete="off"
            type="email"
            placeholder="Email adress"
            required
            className="form-input"
            onChange={(e) => setEmail(e.target.value)}
            value={email}
          />
          <input
            autoComplete="off"
            type="password"
            placeholder="Password"
            required
            className="form-input"
            onChange={(e) => setPassword(e.target.value)}
            value={password}
          />
          <button type="submit">
            {isNewUser ? "Create an account" : "Login Now"}
          </button>
          {isNewUser ? (
            <div className="login-term">
              <input type="checkbox" id="term" required />
              <label htmlFor="term">
                Agree to the terms of use & privacy policy
              </label>
            </div>
          ) : null}

          <div className="login-forgot">
            <div>
              <span
                onClick={() => {
                  toggleIsNewUser(!isNewUser);
                }}
                className="login-sub-text"
              >
                {isNewUser
                  ? "Already have an account? "
                  : "Don't have an account? "}
              </span>
            </div>
            {!isNewUser && (
              <div>
                <span
                  onClick={() => {
                    resetPass(email);
                  }}
                  className="login-sub-text"
                >
                  Forgot password?{" "}
                </span>
              </div>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;
