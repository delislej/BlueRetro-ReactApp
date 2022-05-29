import React from "react";
import { Route, Routes } from "react-router-dom";
import { Box } from "@mui/material";
import CircularProgress from "@mui/material/CircularProgress";
import N64ctrlpak from "./N64ctrlpak";
import Presets from "./Presets";
import Ota from "./Ota";
import About from "./About";
import Advancedconfig from "./Advancedconfig";
import Presetsmaker from "./Presetsmaker";
import MainNavigation from "./MainNavigation";
import { useState } from "react";
import { brUuid, versionCompare } from "./Btutils";
import Logbox from "./Logbox";
import { ChromeSamples } from "./Logbox";
import { useNavigate } from "react-router-dom";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";


function Home() {
  const [bluetoothDevice, setBluetoothDevice] = useState(null);
  const [btService, setBtService] = useState(null);
  const [btConnected, setBtConnected] = useState(false);
  const [showNavMenu, setShowNavMenu] = useState(false);
  const [showLoading, setShowLoading] = useState(false);
  const [allowN64Manager, setAllowN64Manager] = useState(false);
  const [brSpiffs, setBrSpiffs] = useState("");
  const navigate = useNavigate();

  const btConn = () => {
    setBluetoothDevice(null);
    ChromeSamples.clearLog();
    ChromeSamples.log("Requesting Bluetooth Device...");
    navigator.bluetooth
      .requestDevice({
        filters: [{ namePrefix: "BlueRetro" }],
        optionalServices: [brUuid[0]],
      })
      .then((device) => {
        setShowLoading(true);
        ChromeSamples.log("Connecting to GATT Server...");
        device.addEventListener("gattserverdisconnected", onDisconnected);
        setBluetoothDevice(device);
        console.log(device);
        return device.gatt.connect();
      })
      .then((server) => {
        ChromeSamples.log("Getting BlueRetro Service...");
        return server.getPrimaryService(brUuid[0]);
      })
      .then((service) => {
        setBtService(service);
        service
          .getCharacteristic(brUuid[9])
          .then((chrc) => {
            ChromeSamples.log("Reading App version...");
            return chrc.readValue();
          })
          .then((value) => {
            var enc = new TextDecoder("utf-8");
            ChromeSamples.log("App version: " + enc.decode(value));
            let version = enc.decode(value).split(" ")[0].split("v")[1]
            if (versionCompare("1.6.1", version) <= 0) {
              setAllowN64Manager(true);
            }
            //we need to search for _external or _internal then slice the game console
            setBrSpiffs(enc.decode(value).split(" ")[1].split("_external")[0]);
            navigate("/");
            setBtConnected(true);
            setShowLoading(false);
            setShowNavMenu(true);
          });
      })
      .then((_) => {
        ChromeSamples.log("Init Cfg DOM...");
      })
      .catch((error) => {
        ChromeSamples.log("Argh! " + error);
        navigate("/");
        setBtConnected(true);
        setShowLoading(false);
      });
  };

  const onDisconnected = () => {
    ChromeSamples.log("> Bluetooth Device disconnected");
    console.log("on disconnect!");
    setBluetoothDevice(null);
    setShowNavMenu(false);
    setBtConnected(false);
    navigate("/");
  };
  return (
    <Box className="home Box">
      <Stack
        className="Blueretro"
        sx={{
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {showNavMenu && <MainNavigation />}
        {bluetoothDevice === null ? (
          <Box>
            <Button
              id="btConn"
              onClick={() => {
                btConn();
              }}
            >
              Connect BlueRetro
              {btConnected}
            </Button>
            <br />
            <small>
              <i>
                Disconnect all controllers from BlueRetro before connecting for
                pak management.
              </i>
            </small>
          </Box>
        ) : null}
        <Routes>
          <Route path="/" element={<About />} />
          <Route
            path="/n64ctrlpak"
            element={
              <N64ctrlpak
                btDevice={bluetoothDevice}
                btService={btService}
                allowManager={allowN64Manager}
              />
            }
          />
          <Route
            path="/advancedconfig"
            element={<Advancedconfig btDevice={bluetoothDevice} />}
          />
          <Route
            path="/presets"
            element={
              <Presets
                btDevice={bluetoothDevice}
                brSpiffs={brSpiffs}
                btService={btService}
              />
            }
          />
          <Route
            path="/presetsmaker"
            element={<Presetsmaker btDevice={bluetoothDevice} />}
          />
          <Route path="/ota" element={<Ota btDevice={bluetoothDevice} />} />
        </Routes>
        {showLoading && <CircularProgress />}

        <Logbox />
      </Stack>
    </Box>
  );
}

export default Home;
