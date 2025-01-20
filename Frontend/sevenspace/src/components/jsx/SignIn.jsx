import { Link, useNavigate } from "react-router-dom";
import '../css/SignIn.css';
import { useState } from "react";

const SignIn = () => {
  const navigate = useNavigate(); 

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const handleSignIn = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch("http://localhost:8000/user/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const error = await response.json();
        setErrorMessage(error.message || "Sign In failed");
        return;
      }

      const data = await response.json();
      console.log("Login successful:", data);
      navigate("/"); 
    } catch (error) {
      console.error("Error during sign-in:", error);
      setErrorMessage("Something went wrong. Please try again.");
    }
  };

  const handleGoogleAuth = async () => {
    try {
      const response = await fetch("http://localhost:8000/google/login", {
        method: "GET",
        credentials: "include", // Ensures cookies are included
      });
  
      if (response.ok) {
        navigate("/home");
      } else {
        alert("Google authentication failed.");
      }
    } catch (error) {
      console.error("Error during Google authentication:", error);
      alert("An error occurred during Google authentication.");
    }
  };
  
  return (
    <div id="SignIn">
      <div id="SignIn_Inner">
        <span id="SignIn_Text">Sign In</span>
        <form id="SignIn_Form" onSubmit={handleSignIn}>
          <input 
            type="email"
            placeholder="Email"
            id="Email"
            className="SignIn_Input"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Password"
            id="Password"
            className="SignIn_Input"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button type="submit" className="SignIn_Input SingIn_Button parentpopup">
            <span className="popup">SIGN IN</span>
          </button>
        </form>
        {errorMessage && <span className="error-message">{errorMessage}</span>}
        <div className="SignIn_Extra_Options">
          <button
            onClick={handleGoogleAuth}
            className="Hover_Effect google-auth-button"
            style={{
              border: "none",
              background: "none",
              color: "rgb(49,87,222)",
              cursor: "pointer",
              textDecoration: "underline",
            }}
          >
            Continue with Google
          </button>
          <Link
            to="/ForgotPassword"
            style={{ color: "#524f4f", textDecoration: "underline" }}
            className="Hover_Effect"
          >
            Forgot Password?
          </Link>
        </div>
        <span className="SignIn_Extra_Text extra">
          Don't have an account? &nbsp;
          <Link to="/SignUp" style={{ color: "rgb(49,87,222)" }} className="Hover_Effect">
            Sign Up
          </Link>
        </span>
      </div>
    </div>
  );
};

export default SignIn;
