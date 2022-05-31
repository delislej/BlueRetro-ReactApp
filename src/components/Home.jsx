import React from "react";
import { Route, Routes } from "react-router-dom";
import { Box } from "@mui/material";
import CircularProgress from "@mui/material/CircularProgress";
import N64Configuration from "./N64Configuration";
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
  const [showNavMenu, setShowNavMenu] = useState(false);
  const [showLoading, setShowLoading] = useState(false);
  const [allowN64, setAllowN64] = useState(false);
  const [apiVersion, setApiVersion] = useState(null);
  const [allowPakManager, setAllowPakManager] = useState(false);
  //const [globalCfg, setGlobalCfg] = useState(null);
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
        //add on disconnect function
        device.addEventListener("gattserverdisconnected", onDisconnected);
        //save bluetooth device to hook for access from all components
        setBluetoothDevice(device);

        return device.gatt.connect();
      })
      .then((server) => {
        ChromeSamples.log("Getting BlueRetro Service...");
        //get primary bluetooth service
        return server.getPrimaryService(brUuid[0]);
      })
      .then((service) => {
        // save service to hook for access from all components
        setBtService(service);
        //access app version characteristic
        service
          .getCharacteristic(brUuid[9])
          .then((chrc) => {
            ChromeSamples.log("Reading App version...");
            return chrc.readValue();
          })
          .then((value) => {
            var enc = new TextDecoder("utf-8");
            ChromeSamples.log("App version: " + enc.decode(value));
            let version = enc.decode(value).split(" ")[0].split("v")[1];
            //check if BR version allows for n64 memory pak management, if so save true to hook
            if (versionCompare("1.6.1", version) <= 0) {
              setAllowPakManager(true);
            }
            //we need to search for _external or _internal then slice the game console
            if (enc.decode(value).search("internal") === -1) {
              setBrSpiffs(
                enc.decode(value).split(" ")[1].split("_external")[0]
              );
            } else {
              setBrSpiffs(
                enc.decode(value).split(" ")[1].split("_internal")[0]
              );
            }

            if (enc.decode(value).search("n64") !== 1) {
              setAllowN64(true);
            }
            //navigate to home component and hide loading/show navbar
            navigate("/");
            setShowLoading(false);
            setShowNavMenu(true);
          });

        service
          .getCharacteristic(brUuid[6])
          .then((chrc) => {
            ChromeSamples.log("Reading Api version...");
            return chrc.readValue();
          })
          .then((value) => {
            ChromeSamples.log("Api version size: " + value.byteLength);
            console.log("api version test: " + value.getUint8(0));
            setApiVersion(value.getUint8(0));
            ChromeSamples.log("Api version: " + apiVersion);
          })
          .catch((error) => {
            throw new Error(error);
          });

        service
          .getCharacteristic(brUuid[1])
          .then((chrc) => {
            ChromeSamples.log("Reading Global Config...");
            return chrc.readValue();
          })
          .then((value) => {
            ChromeSamples.log("Global Config size: " + value.byteLength);
            //document.getElementById("systemCfg").value = value.getUint8(0);
            //document.getElementById("multitapCfg").value = value.getUint8(1);
            if (apiVersion > 0) {
              ChromeSamples.log("api > 0");
              //document.getElementById("inquiryMode").value = value.getUint8(2);
            }
            if (apiVersion > 1) {
              //document.getElementById("banksel").value = value.getUint8(3);
              ChromeSamples.log("api > 1");
            }
          });
      })
      //on error, print to logbox and force navigate back to home, hide loading for when error occures on connect
      .catch((error) => {
        ChromeSamples.log("Argh! " + error);
        navigate("/");
        setShowLoading(false);
      });
  };

  const onDisconnected = () => {
    //print disconnect to logbox, save null to device hook, hide navmenu
    ChromeSamples.log("> Bluetooth Device disconnected");
    console.log("on disconnect!");
    setBluetoothDevice(null);
    setShowNavMenu(false);
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
        {showNavMenu && <MainNavigation allowN64={allowN64} />}
        {/* show connect button if device is null*/}
        
        <Routes>
          <Route path="/" element={<About />} />
          <Route
            path="/n64config"
            element={
              <N64Configuration
                btDevice={bluetoothDevice}
                btService={btService}
                allowManager={allowPakManager}
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
        
      </Stack>
      <Stack
        className="Blueretro"
        sx={{
          alignItems: "center",
          justifyContent: "center",
        }}
      >
      {bluetoothDevice === null ? (
          <Box>
            <Button
              id="btConn"
              onClick={() => {
                btConn();
              }}
            >
              Connect BlueRetro
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
        <Logbox />
        </Stack>
    </Box>
  );
}

export default Home;