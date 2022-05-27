import React from "react";
import { Route, Routes } from "react-router-dom";
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
import { useNavigate } from 'react-router-dom';

function Home() {
  const [bluetoothDevice, setBluetoothDevice] = useState(null);
  const [btService, setBtService] = useState(null);
  const [btConnected, setBtConnected] = useState(false);
  const [version, setVersion] = useState("");
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
            setVersion(enc.decode(value).split(" ")[0].split("v")[1]);
            //we need to search for _external or _internal then slice the game console
            setBrSpiffs(enc.decode(value).split(" ")[1].split("_external")[0]);
            navigate("/");
            setBtConnected(true);
          });
      })
      .then((_) => {
        ChromeSamples.log("Init Cfg DOM...");
      })
      .catch((error) => {
        ChromeSamples.log("Argh! " + error);
      });
  };

  const onDisconnected = () => {
    ChromeSamples.log("> Bluetooth Device disconnected");
    setBluetoothDevice(null);
    setBtConnected(false);
    navigate("/");
  };
  return (
    <div className="Home">
      { bluetoothDevice === null ? (
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
      ) : null}

      <div>
        {bluetoothDevice === null ? null : (
            <div>
            {btConnected && <MainNavigation />}
            <Routes>
              <Route path="/" element={<About />} />
              <Route
                path="/n64ctrlpak"
                element={
                  <N64ctrlpak
                    btDevice={bluetoothDevice}
                    setBtDevice={setBluetoothDevice}
                    btService={btService}
                    version={version}
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
            </div>
        )}
        <Logbox />
      </div>
    </div>
  );
}

export default Home;
