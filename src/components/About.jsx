import React from "react";
import Paper from "@mui/material/Paper";

function About() {
  return (
    <Paper className="Blueretro" sx={{p:2, width: "66%", marginBottom: "25px"}}>
        <h1 className="font-weight-light">About BlueRetro</h1>

        <p>
          BlueRetro is a bluetooth adapter for a multitude of retro gaming
          consoles.
        </p>

        <p>Advanced settings lets you configure controller settings such as rumble and special controller types. It also allows for advance settings such as deep sleep and Factory Reset</p>

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
      
    </Paper>
  );
}

export default About;
