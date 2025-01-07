import '../css/ForgotPassword.css';

const ForgotPassword = () => {

    const OTP_Generate = () => {

    };

    return (
      <div className="Forgot">
        <div className="Forgot_Inner">
            <span id="Forgot_Text">Forgot Password</span>
            <form id="Forgot_Form">
                <input type="email" placeholder="Email" id="Email" className="Forgot_Input"></input>
                <div id="Forgot_OTP_Field">
                    <div className="Forgot_OTP parentpopup" onClick={OTP_Generate}><span className="Forgot_OTP_Text popup">Send OTP</span></div>
                    <input className="Forgot_OTP_Input" type="number" id="Forgot_OTP_value" placeholder="Enter OTP"></input>
                </div>
                <div id="Validate_Forgot_OTP" className='parentpopup'><span className='popup'>Verify OTP</span></div>
                <input id="New_Password" className="Forgot_Input" type="password" placeholder="Enter New Password" readOnly></input>
                <input id="New_Password_Confirm" className="Forgot_Input" type="password" placeholder="Confirm New Password" readOnly></input>
                <div className='Forgot_OTP_Text Forgot_Input Forgot_Button parentpopup'><span className='popup'>Change Password</span></div>
            </form>
        </div>
      </div>
    );
  };
  
  export default ForgotPassword;