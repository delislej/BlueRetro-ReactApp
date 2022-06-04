import { useState, useRef, useEffect } from "react";
import ProgressBar from "react-bootstrap/ProgressBar";
import { brUuid, ota_abort, ota_end, ota_start, mtu } from "../utils/constants";
import ChromeSamples from "../utils/ChromeSamples";
import { useFilePicker } from "use-file-picker";
import { useNavigate } from "react-router-dom";
import Button from "@mui/material/Button";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";

function Ota(props) {
  const navigate = useNavigate();
  const [progress, setProgress] = useState(0);
  const [showCancel, setShowCancel] = useState(false);
  const [showUpdate, setShowUpdate] = useState(true);
  const cancel = useRef(0);
  const startTime = useRef(0);
  const [openFileSelector, { filesContent, clear, loading }] = useFilePicker({
    accept: ".bin",
    multiple: false,
    readAs: "ArrayBuffer",
  });

  useEffect(() => {
    if (props.btDevice === null) {
      navigate("/");
    }
    if (props.globalCfg[0] === 255) {
      navigate("/");
    }
  }, [props.btDevice, props.globalCfg, navigate]);

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
  };

  const writeFirmware = (data) => {
    setShowUpdate(false);
    var cmd = new Uint8Array(1);
    let ctrl_chrc = null;
    var brService;
    props.btDevice.gatt
      .connect()
      .then((server) => {
        ChromeSamples.log("Getting BlueRetro Service...");
        return server.getPrimaryService(brUuid[0]);
      })
      .then((service) => {
        brService = service;
        return service.getCharacteristic(brUuid[7]);
      })
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
            setShowCancel(false);
            setProgress(0);
            resolve();
          }
        })
        .catch((error) => {
          reject(error);
        });
    });
  };

  return (
    <Paper sx={{p:2, marginBottom: "25px", minWidth: "66%", maxWidth:"75%"}}>
      <h1 className="font-weight-light">OTA Firmware Update</h1>
      <Stack spacing={3}>
      {!showCancel && !loading && (
        <Button
          variant="outlined"
          id="fileSelector"
          onClick={() => {
            openFileSelector();
          }}
        >
          {filesContent.length > 0 ? filesContent[0].name : "Select Firmware .bin"}
        </Button>
      )}
      
      {filesContent.length > 0 ? (
        showUpdate === true ? (
          <Button
            variant="outlined"
            id="btnFwUpdate"
            onClick={() => firmwareUpdate()}
          >
            Update Firmware
          </Button>
        ) : null
      ) : null}
      {showCancel && <ProgressBar now={progress} label={`${progress}%`} />}
      {showCancel && (
        <Button id="btnFwUpdateCancel" onClick={() => abortFwUpdate()}>
          Cancel
        </Button>
      )}
      </Stack>
    </Paper>
  );
}

export default Ota;
