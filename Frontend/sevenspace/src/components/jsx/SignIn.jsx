import { Link } from "react-router-dom";
import '../css/SignIn.css';

const SignIn = () => {

  return (
    <div id="SignIn">
      <div id="SignIn_Inner">
        <span id="SignIn_Text">Sign In</span>
        <form id="SignIn_Form">
          <input type="email" placeholder="Email" id="Email" className="SignIn_Input"></input>
          <input type="password" placeholder="Password" id="Password" className="SignIn_Input"></input>
          <div className="SignIn_Input SingIn_Button parentpopup"><span className="popup">SIGN IN</span></div>
        </form>
        <span className="SignIn_Extra_Text"><Link to="/ForgotPassword" style={{color: '#524f4f'}} className="Hover_Effect">Forgot Password?</Link></span>
        <span className="SignIn_Extra_Text extra">Already have an account? &nbsp;<Link to="/SignUp" style = {{color : 'rgb(49,87,222)'}} className="Hover_Effect">Sign Up</Link></span>
      </div>
    </div>
  );
};

export default SignIn;