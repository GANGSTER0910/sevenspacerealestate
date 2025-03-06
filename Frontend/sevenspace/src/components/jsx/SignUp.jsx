// import { Link, Navigate } from "react-router-dom";
// import { useState } from "react";
// import '../css/SignUp.css';

// const SignUp = () => {
//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");
//   const [otp, setOtp] = useState("");
//   const [otpSent, setOtpSent] = useState(false);

//   const OTP_Generate = async () => {
//     if (!email) {
//       alert("Please enter your email.");
//       return;
//     }
//     try {
//       const response = await fetch("http://localhost:8000/generate-otp", {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify({ email }),
//       });

//       const data = await response.json();
//       if (response.ok) {
//         alert("OTP sent successfully!");
//         setOtpSent(true);
//       } else {
//         alert(data.message || "Failed to send OTP.");
//       }
//     } catch (error) {
//       console.error("Error sending OTP:", error);
//       alert("An error occurred while sending OTP.");
//     }
//   };

//   const handleSignUp = async () => {
//     if (!email || !password || !otp) {
//       alert("Please fill in all fields.");
//       return;
//     }
//     try {
//       const response = await fetch("http://localhost:8000/user", {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify({ email, password, otp }),
//       });

//       const data = await response.json();
//       if (response.ok) {
//         alert("Sign up successful!");
//         Navigate("/");
//       } else {
//         alert(data.message || "Sign up failed.");
//       }
//     } catch (error) {
//       console.error("Error signing up:", error);
//       alert("An error occurred while signing up.");
//     }
//   };

//   return (
//     <div id="SignIn">
//       <div id="SignIn_Inner">
//         <span id="SignIn_Text">Sign Up</span>
//         <form
//           id="SignIn_Form"
//           onSubmit={(e) => {
//             e.preventDefault();
//             handleSignUp();
//           }}
//         >
//           <input
//             type="email"
//             placeholder="Email"
//             id="Email"
//             className="SignIn_Input"
//             value={email}
//             onChange={(e) => setEmail(e.target.value)}
//           />
//           <input
//             type="password"
//             placeholder="Password"
//             id="Password"
//             className="SignIn_Input"
//             value={password}
//             onChange={(e) => setPassword(e.target.value)}
//           />
//           <div id="OTP_Field">
//             <div
//               className="SignIn_OTP parentpopup"
//               onClick={OTP_Generate}
//             >
//               <span className="OTP_Text popup">{otpSent ? "Resend OTP" : "Send OTP"}</span>
//             </div>
//             <input
//               className="SignIn_OTP_Input"
//               type="number"
//               id="OTP"
//               placeholder="Enter OTP"
//               value={otp}
//               onChange={(e) => setOtp(e.target.value)}
//             />
//           </div>
//           <button
//             type="submit"
//             className="SignIn_Input SingIn_Button OTP_Text parentpopup"
//           >
//             <span className="popup">SIGN UP</span>
//           </button>
//         </form>
//         <span id="Not_Account">
//           Already have an account? &nbsp;{" "}
//           <Link
//             to="/SignIn"
//             className="Hover_Effect"
//             style={{ color: "rgb(49,87,222)" }}
//           >
//             Sign In
//           </Link>
//         </span>
//       </div>
//     </div>
//   );
// };

// export default SignUp;
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import "../css/SignUp.css";

const SignUp = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const navigate = useNavigate();

  const OTP_Generate = async () => {
    if (!email) {
      alert("Please enter your email.");
      return;
    }
    try {
      const response = await fetch("http://localhost:8000/generate-otp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();
      if (response.ok) {
        alert("OTP sent successfully!");
        setOtpSent(true);
      } else {
        alert(data.message || "Failed to send OTP.");
      }
    } catch (error) {
      console.error("Error sending OTP:", error);
      alert("An error occurred while sending OTP.");
    }
  };

  const handleSignUp = async () => {
    if (!email || !password || !otp) {
      alert("Please fill in all fields.");
      return;
    }
    try {
      const response = await fetch("http://localhost:8000/user", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password, otp }),
      });

      const data = await response.json();
      if (response.ok) {
        alert("Sign up successful!");
        navigate("/");
      } else {
        alert(data.message || "Sign up failed.");
      }
    } catch (error) {
      console.error("Error signing up:", error);
      alert("An error occurred while signing up.");
    }
  };

  const handleGoogleAuth = async () => {
    try {
      const response = await fetch("https://sevenspacerealestate.onrender.com/google/login", {
        method: "GET",
        credentials: "include", 
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
        <span id="SignIn_Text">Sign Up</span>
        <form
          id="SignIn_Form"
          onSubmit={(e) => {
            e.preventDefault();
            handleSignUp();
          }}
        >
          <input
            type="email"
            placeholder="Email"
            id="Email"
            className="SignIn_Input"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            type="password"
            placeholder="Password"
            id="Password"
            className="SignIn_Input"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <div id="OTP_Field">
            <div
              className="SignIn_OTP parentpopup"
              onClick={OTP_Generate}
            >
              <span className="OTP_Text popup">{otpSent ? "Resend OTP" : "Send OTP"}</span>
            </div>
            <input
              className="SignIn_OTP_Input"
              type="number"
              id="OTP"
              placeholder="Enter OTP"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
            />
          </div>
          <button
            type="submit"
            className="SignIn_Input SingIn_Button OTP_Text parentpopup"
          >
            <span className="popup">SIGN UP</span>
          </button>
        </form>
        <button
          onClick={handleGoogleAuth}
          className="SignIn_Input SingIn_Button Google_Button parentpopup"
        >
          <span className="popup">Continue with Google</span>
        </button>
        <span id="Not_Account">
          Already have an account? &nbsp;{" "}
          <Link
            to="/SignIn"
            className="Hover_Effect"
            style={{ color: "rgb(49,87,222)" }}
          >
            Sign In
          </Link>
        </span>
      </div>
    </div>
  );
};

export default SignUp;
