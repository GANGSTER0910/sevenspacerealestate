import Logo from "../../assets/Logo_main.jpg";
import "../css/Footer.css";
import call from "../../assets/call.png";
import email from "../../assets/mail.png";
import map from "../../assets/map-pin.png";
import { Link } from "react-router-dom";

export default function Footer() {
    return (
        <div id="footer_main">
            <div id="footer_detail">
                <img src={Logo} alt="App Logo" id="footer_img" />
                <p className="footer_detail_text">
                    Lorem ipsum dolor sit amet, consectetur adipisicing elit. Tempore nihil fugiat voluptatum sint,
                    repudiandae accusantium dolor adipisci voluptates natus.
                </p>
            </div>
            <div id="footer_links">
                <h3 className="footer_link_text">Helpful Links</h3>
                <ul className="footer_link_ul">
                    <Link to="/"><li className="footer_link_li">Home</li></Link>
                    <Link to="/Property"><li className="footer_link_li">Property</li></Link>
                    <Link to="/about"><li className="footer_link_li">About</li></Link>
                    <Link to="/service"><li className="footer_link_li">Services</li></Link>
                </ul>
            </div>
            <div id="footer_contact">
                <h3 className="footer_link_text">Corporate Head Office</h3>
                <div className="footer_contact_main">
                    <div className="footer_contact_details">
                        <img src={call} alt="Phone" className="footer_contact_img" />
                        <span>Phone:</span>
                    </div>
                    <span className="footer_contact_text">123-456-7890</span>
                </div>
                <div className="footer_contact_main">
                    <div className="footer_contact_details">
                        <img src={email} alt="Email" className="footer_contact_img" />
                        <span>Email:</span>
                    </div>
                    <span className="footer_contact_text">contact@domain.com</span>
                </div>
                <div className="footer_contact_main">
                    <div className="footer_contact_details">
                        <img src={map} alt="Address" className="footer_contact_img" />
                        <span>Address:</span>
                    </div>
                    <span className="footer_contact_text">
                        123 Corporate Blvd, City, Country
                    </span>
                </div>
            </div>
        </div>
    );
}
