import React from "react";


function Home() {
  return (
    <div className="about">
      <div className="container">
        <div className="row align-items-center my-5">
          <div className="col-lg-7">
          </div>
          <div className="col-lg-5">
            <h1 className="font-weight-light">About BlueRetro</h1>
            
            <p>BlueRetro is a bluetooth adapter for a multitude of retro gaming consoles.</p>

            <p>(coming soon) More advanced settings for specific consoles.</p>

            <p>N64 controller pak manager lets you read/write/format your N64 controller paks.</p>

            <p>Presets lets you flash a controller preset.</p>

            <p>(coming soon) Presets maker will let you make custom presets right from your phone, and bind controls using a controller on your PC</p>

            <p>OTA Update lets you update your blueretro device right from your phone/PC over bluetooth.</p>

            
          </div>
        </div>
      </div>
    </div>
  );
}

export default Home;