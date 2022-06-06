import React from "react";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import SystemUpdateIcon from "@mui/icons-material/SystemUpdate";
import GamepadIcon from "@mui/icons-material/Gamepad";
import SportsEsportsIcon from "@mui/icons-material/SportsEsports";
import SettingsIcon from "@mui/icons-material/Settings";
import SdCardIcon from "@mui/icons-material/SdCard";
import { Typography } from "@mui/material";

function About() {
  return (
    <Paper
      className="Blueretro"
      sx={{ p: 2, width: {xs:"90%", lg:"66%"}, marginBottom: "25px" }}
    >
      <Stack spacing={3}>
        <h1 className="font-weight-light">About BlueRetro</h1>
        <Typography>
          BlueRetro is a bluetooth adapter for a multitude of retro gaming
          consoles.
        </Typography>
        <Stack direction="row" alignItems="center" gap={1}>
          <SettingsIcon />
          <Typography variant="body1">
            Advanced settings lets you configure controller settings such as
            rumble and special controller types. It also allows for advance
            settings such as deep sleep and Factory Reset
          </Typography>
        </Stack>
        <Stack direction="row" alignItems="center" gap={1}>
          <SdCardIcon />
          <Typography variant="body1">
            N64 controller pak manager lets you read/write/format your N64
            controller paks.
          </Typography>
        </Stack>
        <Stack direction="row" alignItems="center" gap={1}>
          <GamepadIcon />
          <Typography variant="body1">
            Presets lets you flash a controller preset.
          </Typography>
        </Stack>
        <Stack direction="row" alignItems="center" gap={1}>
          <SportsEsportsIcon />
          <Typography variant="body1">
            (coming soon) Presets maker will let you make custom presets right
            from your phone, and bind controls using a controller on your PC
          </Typography>
        </Stack>
        <Stack direction="row" alignItems="center" gap={1}>
          <SystemUpdateIcon />
          <Typography variant="body1">
            OTA Update lets you update your blueretro device right from your
            phone/PC over bluetooth.
          </Typography>
        </Stack>
      </Stack>
    </Paper>
  );
}

export default About;
