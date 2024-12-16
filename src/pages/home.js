import React from 'react';
import '../app.css';

function Home() {
  return (
    <div className="home-wrapper">
      {/* Headshot and text container */}
      <div className="home-container">
        <div className="text-container">
          <h2>Hi! I'm Jadiha, a Systems Design Engineering Student @ UWaterloo!</h2>
          <h3>A Software Engineer seeking opportunities in robotics, neurotech, and space...</h3>
        </div>
        <div className="image-container">
          <img src="/images/headshot.jpg" alt="headshot" className="headshot" />
        </div>
      </div>

      {/* Image scroll container */}
      <div className="scroll-container">
        <img src="/images/Ambassadors.jpg" alt="Eng Ambassadors" />
        <img src="/images/acapella.jpg" alt="ACE Acapella" />
        <img src="/images/engday.jpg" alt="Eng Day" />
        <img src="/images/HackTheNorth.jpg" alt="Hack The North" />
        <img src="/images/danceteam.jpg" alt="Warriors Dance Team" />
        <img src="/images/WiE.jpg" alt="WiE Events Team" />
      </div>
    </div>
  );
}

export default Home;
