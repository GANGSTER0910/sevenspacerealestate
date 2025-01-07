import { Link } from "react-router-dom";
import '../css/SignUp.css';

const SignUp = () => {

  const OTP_Generate = () => {

  };

  return (
    <div id="SignIn">
      <div id="SignIn_Inner">
        <span id="SignIn_Text">Sign Up</span>
        <form id="SignIn_Form">
          <input type="email" placeholder="Email" id="Email" className="SignIn_Input"></input>
          <input type="password" placeholder="Password" id="Password" className="SignIn_Input"></input>
          <div id="OTP_Field">
            <div className="SignIn_OTP parentpopup" onClick={OTP_Generate}><span className="OTP_Text popup">Send OTP</span></div>
            <input className="SignIn_OTP_Input" type="number" id="OTP" placeholder="Enter OTP"></input>
          </div>
          <div className="SignIn_Input SingIn_Button OTP_Text parentpopup"><span className="popup">SIGN UP</span></div>
        </form>
        <span id="Not_Account">Already have an account? &nbsp; <Link to="/SignIn" className="Hover_Effect" style={{ color: 'rgb(49,87,222)' }}>Sign In</Link></span>
      </div>
    </div>
  );
};

export default SignUp;
