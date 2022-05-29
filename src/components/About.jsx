import React from "react";
import Box from "@mui/material/Box";

function About() {
  return (
    <div className="Blueretro">
        <h1 className="font-weight-light">About BlueRetro</h1>

        <p>
          BlueRetro is a bluetooth adapter for a multitude of retro gaming
          consoles.
        </p>

        <p>(coming soon) More advanced settings for specific consoles.</p>

        <p>
          N64 controller pak manager lets you read/write/format your N64
          controller paks.
        </p>

        <p>Presets lets you flash a controller preset.</p>

        <p>
          (coming soon) Presets maker will let you make custom presets right
          from your phone, and bind controls using a controller on your PC
        </p>

        <p>
          OTA Update lets you update your blueretro device right from your
          phone/PC over bluetooth.
        </p>
      
    </div>
  );
}

export default About;
