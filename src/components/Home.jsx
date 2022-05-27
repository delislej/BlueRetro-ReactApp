import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import N64ctrlpak from "./N64ctrlpak";
import Presets from "./Presets";
import Ota from "./Ota";
import About from "./About";
import Advancedconfig from "./Advancedconfig";
import Presetsmaker from "./Presetsmaker";
import MainNavigation from "./MainNavigation";
import { useState } from "react";
import { brUuid } from "./Btutils";
import Logbox from "./Logbox";
import { ChromeSamples } from "./Logbox";

function Home() {
  const [bluetoothDevice, setBluetoothDevice] = useState(null);
  const [btService, setBtService] = useState(null);
  const [btConnected, setBtConnected] = useState(null);
  const [version, setVersion] = useState("");
  const [brSpiffs, setBrSpiffs] = useState("");
  

  const btConn = () => {
    ChromeSamples.clearLog();
    ChromeSamples.log("Requesting Bluetooth Device...");
    navigator.bluetooth
      .requestDevice({
        filters: [{ namePrefix: "BlueRetro" }],
        optionalServices: [brUuid[0]],
      })
      .then((device) => {
        ChromeSamples.log("Connecting to GATT Server...");
        device.addEventListener("gattserverdisconnected", onDisconnected);
        setBluetoothDevice(device);
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
            setVersion(enc.decode(value).split(" ")[0].split("v")[1]);
            setBrSpiffs(enc.decode(value).split(" ")[1].split("_spiffs")[0]);
          });
      })
      .then((_) => {
        ChromeSamples.log("Init Cfg DOM...");
        setBtConnected(true);
      })
      .catch((error) => {
        ChromeSamples.log("Argh! " + error);
      });
  };

  const onDisconnected = () => {
    ChromeSamples.log("> Bluetooth Device disconnected");
    setBtConnected(false);
  };
  return (
    <div className="Home">
      {!btConnected && (
        <div id="divBtConn">
          <button
            id="btConn"
            onClick={() => {
              btConn();
            }}
          >
            Connect BlueRetro
          </button>
          <br />
          <small>
            <i>
              Disconnect all controllers from BlueRetro before connecting for
              pak management.
            </i>
          </small>
        </div>
      )}

      <div>
        {btConnected === null ? null : (
          <Router>
            <MainNavigation />
            <Routes>
              <Route path="/" element={<About />} />
              <Route
                path="/n64ctrlpak"
                element={
                  <N64ctrlpak
                    btDevice={bluetoothDevice}
                    setBtDevice={setBluetoothDevice}
                    version = {version}
                  />
                }
              />
              <Route
                path="/advancedconfig"
                element={<Advancedconfig btDevice={bluetoothDevice} />}
              />
              <Route
                path="/presets"
                element={<Presets btDevice={bluetoothDevice} brSpiffs={brSpiffs} btService={btService} />}
              />
              <Route
                path="/presetsmaker"
                element={<Presetsmaker btDevice={bluetoothDevice} />}
              />
              <Route path="/ota" element={<Ota btDevice={bluetoothDevice} />} />
            </Routes>
          </Router>
        )}
        <Logbox />
      </div>
    </div>
  );
}

export default Home;
