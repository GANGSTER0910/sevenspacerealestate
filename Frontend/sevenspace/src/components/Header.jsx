// import React from 'react'
// import {FaSearch} from 'react-icons/fa';
// import {Link} from 'react-router-dom';
// const Header = () => {
//   return (
//     <header className='bg-slate-200 shadow-md'>
//         <div className='flex justify-between items-center max-w-6xl mx-auto p-3'>
//             <Link to="/">
//             <h1 className='font-bold text-sm sm:text-xl flex flex-wrap'></h1>
//             <span className='text-slate-500'>
//                 SevenSpace Real Estate
//             </span>
//             </Link>
//         <form className=' bg-slate-100 p-3 rounded-lg flex items-center'>
//             <input type='text' placeholder='Search ...' className='bg-transparent focus:outline-none w-24 sm:w-64'/>
//             <FaSearch className='text-slate-600' />
//         </form>
//         <ul className='flex gap-4'>
//             <Link to="/">
//             <li className='hidden sm:inline text-slate-700 hover:underline'>Home</li>
//             </Link>
//             <Link to="/about">
//             <li className='hidden sm:inline text-slate-700 hover:underline'>About</li>
//             </Link>
//             <Link to="/sign-in">
//             <li className='sm:inline text-slate-700 hover:underline'>SignIn</li>
//             </Link>
//         </ul>
//         </div>
//     </header>
//   )
// }

// export default Header
import React from 'react';
import { FaSearch } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import Logo from 'D://seven_space//Frontend//sevenspace//src//assets//Logo_main.jpg'
const Header = () => {
  return (
    <header className="bg-slate-200 shadow-md">
      <div className="flex justify-between place-items-start max-w-6xl mx-auto px-4 py-3">
        <Link to="/" className="flex place-items-start gap-2">
          <img src ={Logo}
          alt="Logo"
          className="h-8 sm:h-10" 
          /> 
          <div>
          <h1 className=" font-bold text-lg sm:text-2xl">SevenSpace </h1>
          <span className="text-slate-500 text-sm">Real Estate</span>
          </div>
        </Link>

        {/* Right Section: Search and Navigation */}
        <div className="flex items-center gap-6">
          {/* Search Bar */}
          <form className="flex items-center bg-slate-100 px-3 py-2 rounded-lg">
            <input
              type="text"
              placeholder="Search ..."
              className="bg-transparent focus:outline-none w-24 sm:w-64"
            />
            <FaSearch className="text-slate-600 ml-2" />
          </form>

          {/* Navigation Links */}
          <ul className="flex gap-4">
            <Link to="/">
              <li className="text-slate-700 hover:underline">Home</li>
            </Link>
            <Link to="/sign-in">
              <li className="text-slate-700 hover:underline">Sign In</li>
            </Link>
            <Link to="/property">
              <li className="hidden sm:inline text-slate-700 hover:underline">Property</li>
            </Link>
            <Link to="/about">
              <li className="hidden sm:inline text-slate-700 hover:underline">About</li>
            </Link>
            <Link to="/service">
              <li className="hidden sm:inline text-slate-700 hover:underline">Services</li>
            </Link>
            <Link to="/contactus">
              <li className="hidden sm:inline text-slate-700 hover:underline">Contact Us</li>
            </Link>

            
            
          </ul>
        </div>
      </div>
    </header>
  );
};

export default Header;
