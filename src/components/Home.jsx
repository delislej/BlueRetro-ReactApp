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
  const [allowPakManager, setAllowPakManager] = useState(false);
  const [globalCfg, setGlobalCfg] = useState(new Uint8Array(4).fill(255));
  const [brSpiffs, setBrSpiffs] = useState("");
  const navigate = useNavigate();
  var apiver = -1;

  const btConn = async () => {
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
      .then(async (service) => {
        // save service to hook for access from all components
        setBtService(service);
        //access app version characteristic
        

        

        await new Promise(resolve => setTimeout(resolve, 1000));

        await getApiVersion(service);

        await new Promise(resolve => setTimeout(resolve, 1000));

        await getGlobalCfg(service);
        
        await new Promise(resolve => setTimeout(resolve, 1000));

        await getAppVersion(service);

      })
      //on error, print to logbox and force navigate back to home, hide loading for when error occures on connect
      .catch((error) => {
        ChromeSamples.log("Argh! " + error);
        setShowNavMenu(false);
        navigate("/");
        setShowLoading(false);
      });
  };

  const getAppVersion = async (service) => {
    return new Promise((resolve) => {
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
            setBrSpiffs(enc.decode(value).split(" ")[1].split("_external")[0]);
          } else {
            setBrSpiffs(enc.decode(value).split(" ")[1].split("_internal")[0]);
          }

          if (enc.decode(value).search("n64") !== 1) {
            setAllowN64(true);
          }
          //navigate to home component and hide loading/show navbar
          navigate("/");
          setShowLoading(false);
          setShowNavMenu(true);
        });
      resolve();
    });
  };

  const getApiVersion = async (service) => {
    return new Promise((resolve) => {
      service
        .getCharacteristic(brUuid[6])
        .then((chrc) => {
          ChromeSamples.log("Reading Api version...");
          return chrc.readValue();
        })
        .then((value) => {
          apiver = value.getUint8(0);
          ChromeSamples.log("Api version: " + apiver);
        })
        .catch((error) => {
          setShowNavMenu(false);
          navigate("/");
          setShowLoading(false);
          throw new Error(error);
        });
      resolve();
    });
  };

  const getGlobalCfg = async (service) => {
    return new Promise((resolve) => {
      service
        .getCharacteristic(brUuid[1])
        .then((chrc) => {
          ChromeSamples.log("Reading Global Config...");
          return chrc.readValue();
        })
        .then((value) => {
          if (apiver === -1) {
            setShowNavMenu(false);
            setBluetoothDevice(null);
            navigate("/");
            setShowLoading(false);
            throw new Error("failed to get API version");
          }
          ChromeSamples.log("Global Config size: " + value.byteLength);
          //get global config size from apiVersion
          var temp = new Uint8Array(2);

          if (apiver > 0) {
            temp = new Uint8Array(3);
          }
          if (apiver > 1) {
            temp = new Uint8Array(4);
          }

          //systemCfg value
          temp[0] = value.getUint8(0);
          //multitapCfg value
          temp[1] = value.getUint8(1);
          if (apiver > 0) {
            //document.getElementById("inquiryMode").value = value.getUint8(2);
            temp[2] = value.getUint8(2);
          }
          if (apiver > 1) {
            //bank select value
            temp[3] = value.getUint8(3);
          }
          setGlobalCfg(temp);
          resolve();
        })
        .catch((error) => {
          ChromeSamples.log("Argh! " + error);
          setShowNavMenu(false);
          navigate("/");
          setShowLoading(false);
        });
    });
  };

  const onDisconnected = () => {
    //print disconnect to logbox, save null to device hook, hide navmenu
    ChromeSamples.log("> Bluetooth Device disconnected");
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
                globalCfg={globalCfg}
              />
            }
          />
          <Route
            path="/advancedconfig"
            element={
              <Advancedconfig
                btDevice={bluetoothDevice}
                globalCfg={globalCfg}
                btService={btService}
              />
            }
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
