import React from "react";


function Home() {
  return (
    <div className="about">
      <div class="container">
        <div class="row align-items-center my-5">
          <div class="col-lg-7">
            <img
              class="img-fluid rounded mb-4 mb-lg-0"
              src="http://placehold.it/900x400"
              alt=""
            />
          </div>
          <div class="col-lg-5">
            <h1 class="font-weight-light">About BlueRetro</h1>
            
            <p>BlueRetro is a bluetooth adapter for a multitude of retro gaming consoles.</p>

            <p>Advanced Config lets you manually bind controls in real time, along with more advanced settings for specific consoles.</p>

            <p>n64 controller pak manager lets you manage N64 controller pak files.</p>

            <p>Presets lets you flash a controller preset.</p>

            <p>OTA Update lets you update your blueretro device right from your phone/PC over bluetooth.</p>

            
          </div>
        </div>
      </div>
    </div>
  );
}

export default Home;