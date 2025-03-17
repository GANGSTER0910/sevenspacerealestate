import React from 'react';
import '../css/About.css';
import img1 from "../../assets/Logo_main.jpg";

export default function About() {
  return (
    <div id="About">
      <div id="About_Inner">
        <span className='About_Heading'>About SevenSpace</span>
        <span className='About_Para'>Welcome to SevenSpace, a premier real estate company committed to creating exceptional living and investment opportunities. With a passion for excellence, we specialize in offering a diverse portfolio of properties that cater to the unique needs of each client. From residential homes that embody comfort and style to high-end commercial spaces that foster business growth, SevenSpace ensures that every space we represent is more than just a structure—it's a place to call home or grow your business.  

          Our experienced team of real estate professionals is driven by a shared vision of providing personalized service, innovative solutions, and unmatched market insight. We understand that buying, selling, or investing in real estate can be a life-changing decision, and we are here to guide you every step of the way.  

          Whether you're looking to invest in your first home, expand your business, or diversify your property portfolio, SevenSpace is your trusted partner. With a focus on integrity, transparency, and customer satisfaction, we aim to build long-lasting relationships that go beyond transactions. Let SevenSpace help you unlock the door to your next great opportunity.
        </span>
        <span className="About_Heading">Board of Directors</span>
        
        <div className='BOD_Outer'>
          <div className='BOD_Img'>
            <img src={img1} alt="Board of Director" className='BOD_Img_edit'></img>
          </div>
          <div className='BOD_Text'>
            <span className='BOD_Text_edit BOD_Text_edit_Bold' id="BOD_Position">FOUNDER & MANAGING DIRECTOR</span>
            <span className='BOD_Text_edit BOD_Text_edit_Bold' id="BOD_Name">Mr. Harsh Panchal</span>
            <span className='BOD_Text_edit' id="BOD_Degree">Btech</span>
            <span className='BOD_Text_edit' id="BOD_Desc">The proud owner and managing director of the City Estate Management , Founder – President of Ahmedabad Realtors Association and Ex-Vice President of NAR, India & Chairman (PR & Communication) of NAR, India being first in this service industry builds professionalism and creates a corporate culture in Real Estate Consulting Business. He leads strategic planning and corporate development across the group’s portfolio of real estate businesses. He is leading teams across client services, projects, editorial and marketing. As a leader of the company, he advises the management team, motivates employees, and drives change within the organization. Mr. Pravin Bavadiya has given employment to middle class unemployed people and moreover in those 200 and more has their own offices now. A successfully completed 22 years, setting a benchmark in real estate management with only a motto to be transparent in all dealings and satisfy customers at any cost. </span>
          </div>
        </div>
      </div>
    </div>
  )
}