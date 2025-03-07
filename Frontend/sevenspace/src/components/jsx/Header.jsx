import React from 'react';
import { FaSearch } from 'react-icons/fa';
import { Link, useNavigate} from 'react-router-dom';
import Logo from '../../assets/Logo_main.jpg';
import '../css/Header.css';

const Header = () => {

  const navigate = useNavigate();

  const homePage = () => {
    navigate('/');
  };

  return (
    <header id="Header">
      <div id="Header_Logo" onClick={homePage}>
        <img src={Logo} alt="SEVEN SPACE REAL ESTATE" id="Header_Logo_Img" />
        <div id="Header_Logo_Text">
          <h1 id="Header_Logo_Text_H1">SevenSpace</h1>
          <p id="Header_Logo_Text_P">Real Estate</p>
        </div>
      </div>

      <nav id="Header_Links">
        <ul id="Header_Links_Unordered">
          <li><Link to="/">Home</Link></li>
          <li><Link to="/property">Property</Link></li>
          <li><Link to="/about">About</Link></li>
          <li><Link to="/services">Services</Link></li>
          <li><Link to="/SignIn" id="Signin">Sign In</Link></li>
        </ul>
      </nav>

      <div id="Header_Search">
        <form>
          <div className="search-container">
            <input type="text" placeholder="Search..." id="searchBox" />
            <FaSearch className="search-icon" />
          </div>
        </form>
      </div>
      
    </header>
  );
};

export default Header;
