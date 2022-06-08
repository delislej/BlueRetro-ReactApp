import React from "react";
import { Route, Routes } from "react-router-dom";
import { Box, Typography } from "@mui/material";
import Grid from "@mui/material/Grid";
import CircularProgress from "@mui/material/CircularProgress";
import N64Configuration from "./N64Configuration";
import Presets from "./Presets";
import Ota from "./Ota";
import About from "./About";
import Advancedconfig from "./Advancedconfig";
import Presetsmaker from "./Presetsmaker";
import MainNavigation from "./MainNavigation";
import { useState } from "react";
import { brUuid } from "../utils/constants";
import versionCompare from "../utils/versionCompare";
import Logbox from "./Logbox";
import ChromeSamples from "../utils/ChromeSamples";
import { useNavigate } from "react-router-dom";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import getApiVersion from "../utils/getApiVersion";
import getGlobalCfg from "../utils/getGlobalCfg";
import getAppVersion from "../utils/getAppVersion";

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
      .then(async (service) => {
        // save service to hook for access from all components
        setBtService(service);

        //access app version characteristics with a wait to avoid errors
        await getApiVersion(service)
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

        await new Promise((resolve) => setTimeout(resolve, 500));

        await getGlobalCfg(service, apiver)
          .then((value) => {
            setGlobalCfg(value);
          })
          .catch((error) => {
            ChromeSamples.log("Argh! " + error);
            setShowNavMenu(false);
            navigate("/");
            setShowLoading(false);
          });

        await new Promise((resolve) => setTimeout(resolve, 500));

        await getAppVersion(service)
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
            //if n64 is found, we unhide the menu option
            if (enc.decode(value).search("n64") !== -1) {
              setAllowN64(true);
            }
            //navigate to home component and hide loading/show navbar
            navigate("/");
            setShowLoading(false);
            setShowNavMenu(true);
          })
          .catch((error) => {
            ChromeSamples.log("Argh! " + error);
            setShowNavMenu(false);
            navigate("/");
            setShowLoading(false);
          });

        await new Promise((resolve) => setTimeout(resolve, 500));
      })
      //on error, print to logbox and force navigate back to home, hide loading for when error occures on connect
      .catch((error) => {
        ChromeSamples.log("Argh! " + error);
        setShowNavMenu(false);
        navigate("/");
        setShowLoading(false);
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
    <Box
      className="home Box"
      display="flex"
      flexWrap="wrap"
      flexDirection="column"
      justifyContent="center"
      alignItems="center"
    >
      <Stack
        className="Blueretro"
        sx={{
          width: "100%",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {showNavMenu === true ? (
          <MainNavigation allowN64={allowN64} />
        ) : (
          <Box sx={{ marginBottom: "25px" }}></Box>
        )}

        <Routes>
          <Route
            path="/"
            element={
              <About
                button={
                  bluetoothDevice === null ? (
                    <Grid item>
                      <Stack spacing={1}>
                        <Button
                          id="btConn"
                          variant="outlined"
                          onClick={() => {
                            btConn();
                          }}
                        >
                          Connect BlueRetro
                        </Button>
                        <small>
                          Disconnect all controllers from BlueRetro before
                          connecting for pak management.
                        </small>
                      </Stack>
                    </Grid>
                  ) : null
                }
                loadingCircle={
                  <Grid container item justifyContent="center">
                    {showLoading && <CircularProgress />}
                  </Grid>
                }
              />
            }
          />
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
                globalCfg={globalCfg}
                brSpiffs={brSpiffs}
                btService={btService}
              />
            }
          />
          <Route
            path="/presetsmaker"
            element={
              <Presetsmaker
                btDevice={bluetoothDevice}
                globalCfg={globalCfg}
                btService={btService}
              />
            }
          />
          <Route
            path="/ota"
            element={
              <Ota
                btDevice={bluetoothDevice}
                globalCfg={globalCfg}
                btService={btService}
              />
            }
          />
        </Routes>
      </Stack>
      <Stack
        className="Blueretro"
        sx={{
          alignItems: "center",
          justifyContent: "center",
          width: "250px",
        }}
      >
        <Logbox />
      </Stack>
    </Box>
  );
}

export default Home;
