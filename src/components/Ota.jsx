import { useState, useRef } from "react";
import ProgressBar from "react-bootstrap/ProgressBar";
import {
  brUuid,
  ota_abort,
  ota_end,
  ota_start,
  mtu,
  getAppVersion,
} from "./Btutils";
import Logbox from "./Logbox";
import { ChromeSamples } from "./Logbox";
import { useFilePicker } from "use-file-picker";

var bluetoothDevice;
let brService;

function Ota() {
  const [progress, setProgress] = useState(0);
  const [showCancel, setShowCancel] = useState(false);
  const [showUpdate, setShowUpdate] = useState(true);
  const [btConnected, setBtConnected] = useState(false);
  const cancel = useRef(0);
  const startTime = useRef(0);
  const [openFileSelector, { filesContent, clear, loading }] = useFilePicker({
    accept: ".bin",
    multiple: false,
    readAs: "ArrayBuffer",
  });

  const firmwareUpdate = () => {
    // Reset progress indicator on new file selection.
    setProgress(0);
    setShowCancel(true);
    writeFirmware(filesContent[0].content);
  };

  const abortFwUpdate = () => {
    ChromeSamples.log("aborting");
    cancel.current = 1;
    setProgress(0);
    setShowCancel(false);
    setBtConnected(false);
  };

  const onDisconnected = () => {
    ChromeSamples.log("> Bluetooth Device disconnected");
    cancel.current = 0;
    setBtConnected(false);
  };

  const btConn = () => {
    ChromeSamples.clearLog();
    cancel.current = 0;
    ChromeSamples.log("Requesting Bluetooth Device...");
    navigator.bluetooth
      .requestDevice({
        filters: [{ name: "BlueRetro" }],
        optionalServices: [brUuid[0]],
      })
      .then((device) => {
        ChromeSamples.log("Connecting to GATT Server...");
        bluetoothDevice = device;
        bluetoothDevice.addEventListener(
          "gattserverdisconnected",
          onDisconnected
        );
        return bluetoothDevice.gatt.connect();
      })
      .then((server) => {
        ChromeSamples.log("Getting BlueRetro Service...");
        return server.getPrimaryService(brUuid[0]);
      })
      .then((service) => {
        brService = service;
        return getAppVersion(brService);
      })
      .then((_) => {
        ChromeSamples.log("Init Cfg DOM...");
        setBtConnected(true);
      })
      .catch((error) => {
        ChromeSamples.log("Argh! " + error);
      });
  };

  const writeFirmware = (data) => {
    setShowUpdate(false);
    var cmd = new Uint8Array(1);
    let ctrl_chrc = null;
    brService
      .getCharacteristic(brUuid[7])
      .then((chrc) => {
        ctrl_chrc = chrc;
        cmd[0] = ota_start;
        return ctrl_chrc.writeValue(cmd);
      })
      .then((_) => {
        return brService.getCharacteristic(brUuid[8]);
      })
      .then((chrc) => {
        startTime.current = performance.now();
        return writeFwRecursive(chrc, data, 0);
      })
      .then((_) => {
        cmd[0] = ota_end;
        setShowUpdate(true);
        return ctrl_chrc.writeValue(cmd);
      })
      .catch((error) => {
        ChromeSamples.log("Argh! " + error);
        cancel.current = 0;
        clear();
        cmd[0] = ota_abort;
        setShowUpdate(true);
        return ctrl_chrc.writeValue(cmd);
      });
  };

  const writeFwRecursive = (chrc, data, offset) => {
    return new Promise(function (resolve, reject) {
      if (cancel.current === 1) {
        throw new Error("Cancelled");
      }
      setProgress(Math.round((offset / data.byteLength) * 100));
      var tmpViewSize = data.byteLength - offset;
      if (tmpViewSize > mtu) {
        tmpViewSize = mtu;
      }
      var tmpView = new DataView(data, offset, tmpViewSize);
      chrc
        .writeValue(tmpView)
        .then((_) => {
          offset += Number(mtu);
          if (offset < data.byteLength) {
            resolve(writeFwRecursive(chrc, data, offset));
          } else {
            ChromeSamples.log(
              "FW upload done. Took: " +
                (performance.now() - startTime.current) / 1000 +
                " sec"
            );
            resolve();
          }
        })
        .catch((error) => {
          reject(error);
        });
    });
  };

  return (
    <div className="about">
      <div className="container">
        <div>
          <div style={{ margin: "auto", width: "50%" }}>
            <h1 className="font-weight-light">OTA Firmware Update</h1>
            <div>
              {!btConnected && (
                <div id="divBtConn">
                  <button
                    id="btConn"
                    onClick={() => {
                      setProgress(0);
                      btConn();
                    }}
                  >
                    Connect BlueRetro
                  </button>
                  <br />
                  <small>
                    <i>
                      Disconnect all controllers from BlueRetro before
                      connecting for update.
                    </i>
                  </small>
                </div>
              )}
              {btConnected && (
                <div>
                  <div id="divFwSelect">
                    Select firmware:
                    {!showCancel && !loading && (
                      <button
                        id="fileSelector"
                        onClick={() => {
                          openFileSelector();
                        }}
                      >
                        {filesContent.length > 0
                          ? filesContent[0].name
                          : "Select .bin"}
                      </button>
                    )}
                    {filesContent.length > 0 ? (
                      showUpdate === true ? (
                        <button
                          id="btnFwUpdate"
                          onClick={() => firmwareUpdate()}
                        >
                          Update Firmware
                        </button>
                      ) : null
                    ) : null}
                  </div>
                  <div id="divFwUpdate">
                    <div id="progress_bar">
                      {showCancel && (
                        <ProgressBar now={progress} label={`${progress}%`} />
                      )}
                    </div>
                    {showCancel && (
                      <button
                        id="btnFwUpdateCancel"
                        onClick={() => abortFwUpdate()}
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
        <Logbox />
      </div>
    </div>
  );
}

export default Ota;
