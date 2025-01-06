import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
// import { useDispatch,  useSelector } from "react-redux";
// import { signInStart, signInSuccess, signInFailure } from "../redux/user/userSlice.js";
// import OAuth from "../components/OAuth.jsx";

const SignIn = () => {

  return (
    <div className="p-3 max-w-lg mx-auto">
      <h1 className="text-3xl text-center font-semibold my-7">Sign In</h1>
      <form className="flex flex-col gap-4">
        <input
          type="email"
          placeholder="Email"
          className="border p-3 rounded-lg"
          id="email"
          // onChange={handleChange}
        />
        <input
          type="password"
          placeholder="Password"
          className="border p-3 rounded-lg"
          id="password"
          // onChange={handleChange}        
        />
        <button  className="bg-slate-700 text-white p-3 rounded-lg uppercase hover:opacity-95 disabled:opacity-80">
          Sign In
         </button>
        {/* <OAuth /> */}
      </form>

      <div className="flex gap-2 mt-5">
        <p>Dont have an account?</p>
        <Link to={"/sign-up"}>
        <span className="text-blue-700">Sign Up</span>
        </Link>
      </div>
      {/* {error && <p className="text-red-500 m">{error}</p>} */}
    </div>
  );
};

export default SignIn;