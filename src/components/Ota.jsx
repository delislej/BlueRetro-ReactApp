import { useState, useRef, useEffect } from "react";
import ProgressBar from "react-bootstrap/ProgressBar";
import ChromeSamples from "../utils/ChromeSamples";
import { useFilePicker } from "use-file-picker";
import { useNavigate } from "react-router-dom";
import Button from "@mui/material/Button";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import otaWriteFirmware from "../utils/otaWriteFirmware";

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
    startTime.current = performance.now();
    setProgress(0);
    setShowUpdate(false);
    setShowCancel(true);
    otaWriteFirmware(
      props.btService,
      filesContent[0].content,
      setProgress,
      cancel
    )
      .then((_) => {
        setShowCancel(false);
        setProgress(0);
        ChromeSamples.log(
          "FW upload done. Took: " +
            (performance.now() - startTime.current) / 1000 +
            " sec"
        );
        setShowUpdate(true);
      })
      .catch((error) => {
        ChromeSamples.log("Argh! " + error);
        cancel.current = 0;
        clear();
        setShowUpdate(true);
      });
  };

  return (
    <Paper
      sx={{ p: 2, 
        marginBottom: "25px", 
        width: {xs:"90%", lg:"66%"},
        }}
    >
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
            {filesContent.length > 0
              ? filesContent[0].name
              : "Select Firmware .bin"}
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
          <Button
            id="btnFwUpdateCancel"
            onClick={() => {
              ChromeSamples.log("aborting");
              cancel.current = 1;
              setProgress(0);
              setShowCancel(false);
            }}
          >
            Cancel
          </Button>
        )}
      </Stack>
    </Paper>
  );
}

export default Ota;
