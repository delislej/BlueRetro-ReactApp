import React, { useState, useRef, useEffect } from "react";
import ChromeSamples from "../utils/ChromeSamples";
import { brUuid, pakSize } from "../utils/constants";
import Button from "@mui/material/Button";
import ProgressBar from "react-bootstrap/ProgressBar";
import { useFilePicker } from "use-file-picker";
import { Box } from "@mui/material";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import Accordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import Select from "@mui/material/Select";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import { Divider, Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";
import downloadFile from "../utils/downloadFile";
import saveGlobalCfg from "../utils/saveGlobalCfg";
import makeFormattedPak from "../utils/makeFormattedPak";
import n64WriteFile from "../utils/n64WriteFile";

function N64Configuration(props) {
  const navigate = useNavigate();
  const startTime = useRef(0);
  const cancel = useRef(0);
  const [show, setShow] = useState(false);
  const handleClose = () => setShow(false);
  const handleFormat = () => setShow(true);
  const [showProgress, setShowProgress] = useState(false);
  const [showCancel, setShowCancel] = useState(false);
  const [showButtons, setShowButtons] = useState(false);
  const [okVersion, setOkVersion] = useState(false);
  const [progress, setProgress] = useState(0);
  const [pak, setPak] = useState(1);
  const [bank, setBank] = useState(1);
  const [openFileSelector, { filesContent, clear }] = useFilePicker({
    accept: ".mpk",
    multiple: false,
    readAs: "ArrayBuffer",
  });

  const bankRange = [1, 2, 3, 4, ];

  useEffect(() => {
    if (props.btDevice === null) {
      navigate("/");
    }
    if (props.globalCfg[0] === 255) {
      navigate("/");
    }

    setBank(props.globalCfg[3] + 1);
    if (props.allowManager === true) {
      setOkVersion(true);
      setShowButtons(true);
    } else {
      setShowButtons(true);
    }
  }, [props.allowManager, props.globalCfg, props.btDevice, navigate]);

  const pakRead = (evt) => {
    // Reset progress indicator on new file selection.
    setProgress(0);
    setShowProgress(true);
    setShowButtons(false);
    ChromeSamples.log("Reading Memory Pak: " + pak);
    var data = new Uint8Array(pakSize);
    readFile(data)
      .then((value) => {
        let pakNum = pak;
        downloadFile(
          new Blob([value.buffer], { type: "application/mpk" }),
          "ctrl_pak" + pakNum + ".mpk"
        );
        setShowProgress(false);
        setShowCancel(false);
        setShowButtons(true);
      })
      .catch((error) => {
        ChromeSamples.log("Argh! " + error);
        setShowCancel(false);
        setShowProgress(false);
        setShowButtons(true);
        cancel.current = 0;
      });
  };

  const pakWrite = (evt) => {
    setShowButtons(false);
    setShowProgress(true);
    setShowCancel(true);
    startTime.current = performance.now();
    n64WriteFile(props.btService, filesContent[0].content.slice(0, pakSize), pak, setProgress, cancel).then((_) => {
      clear();
      setShowButtons(true);
      setShowCancel(false);
      setShowProgress(false);
    })
    .catch((error) => {
      ChromeSamples.log("Argh! " + error);
      setShowButtons(true);
      setShowCancel(false);
      setShowProgress(false);
      cancel.current = 0;
    });
  };

  const abortFileTransfer = () => {
    cancel.current = 1;
  };

  const transferProgress = (total, loaded) => {
    var percentLoaded = Math.round((loaded / total) * 100);
    // Increase the progress bar length.
    if (percentLoaded < 100) {
      setProgress(percentLoaded);
    }
  };

  // Init function taken from MPKEdit by bryc:
  // https://github.com/bryc/mempak/blob/dbd78db6ac55575838c6e107e5ea1e568981edc4/js/state.js#L8
  const pakFormat = (evt) => {
    handleClose();
    setProgress(0);
    setShowButtons(false);
    setShowProgress(true);
    setShowCancel(true);
    startTime.current = performance.now();
    n64WriteFile(props.btService, makeFormattedPak().buffer, pak, setProgress, cancel).then((_) => {
      setShowButtons(true);
      setShowCancel(false);
      setShowProgress(false);
    })
    .catch((error) => {
      ChromeSamples.log("Argh! " + error);
      setShowButtons(true);
      setShowCancel(false);
      setShowProgress(false);
      cancel.current = 0;
    });
  };

  const readRecursive = (chrc, data, offset) => {
    return new Promise(function (resolve, reject) {
      if (cancel.current === 1) {
        throw new Error("Cancelled");
      }
      transferProgress(pakSize, offset);
      chrc
        .readValue()
        .then((value) => {
          var tmp = new Uint8Array(value.buffer);
          data.set(tmp, offset);
          offset += value.byteLength;
          if (offset < pakSize) {
            resolve(readRecursive(chrc, data, offset));
          } else {
            setProgress(100);
            setShowCancel(false);
            ChromeSamples.log(
              "File download done. Took: " +
                Math.round(performance.now() - startTime.current) / 1000 +
                " sec"
            );
            resolve(data);
          }
        })
        .catch((error) => {
          reject(error);
        });
    });
  };

  const readFile = (data) => {
    setShowCancel(true);
    return new Promise(function (resolve, reject) {
      var offset = new Uint32Array(1);
      let ctrl_chrc = null;
      setShowProgress(true);
      props.btService
        .getCharacteristic(brUuid[10])
        .then((chrc) => {
          ctrl_chrc = chrc;
          offset[0] = Number(pak) * pakSize;
          return ctrl_chrc.writeValue(offset);
        })
        .then((_) => {
          return props.btService.getCharacteristic(brUuid[11]);
        })
        .then((chrc) => {
          startTime.current = performance.now();
          return readRecursive(chrc, data, 0);
        })
        .then((_) => {
          offset[0] = 0;
          return ctrl_chrc.writeValue(offset);
        })
        .then((_) => {
          resolve(data);
        })
        .catch((error) => {
          reject(error);
        });
    });
  };

  return (
    <Paper
      sx={{
        width: "66%",
        marginBottom: "25px",
        p: 2,
      }}
    >
      <Dialog open={show}>
        <DialogTitle>Format Memory Pak</DialogTitle>
        <DialogContent>
          <DialogContentText>
            This will format your memory pak!
            <br />
            There is no way to undo this!
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Stack spacing={3}>
            <Button
              variant="outlined"
              sx={{ color: "black", backgroundColor: "red" }}
              onClick={() => {
                pakFormat();
              }}
            >
              Format Memory Pak
            </Button>
            <Button color="primary" variant="outlined" onClick={handleClose}>
              Close
            </Button>
          </Stack>
        </DialogActions>
      </Dialog>
      <Box>
        {showButtons && (
          <Stack spacing={3}>
            <Typography align="center">N64 Configuration</Typography>
            <Divider />

            {okVersion && (
              <Accordion elevation={18}>
                <AccordionSummary
                  expandIcon={<ExpandMoreIcon />}
                  aria-controls="panel1a-content"
                  id="panel1a-header"
                >
                  <Typography>Controller Pak Data Managment</Typography>
                </AccordionSummary>
                <AccordionDetails sx={{ alignItems: "center" }}>
                  <Stack spacing={3}>
                    <FormControl>
                      <InputLabel id="memory pak select">Memory Pak</InputLabel>
                      <Select
                        value={pak}
                        onChange={(x) => setPak(x.target.value)}
                      >
                        {bankRange.map((number, index) => (
                          <MenuItem key={index} value={number}>
                            {number}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                    <Divider />
                    <Button
                      id="btnPakRead"
                      variant="outlined"
                      onClick={() => {
                        pakRead();
                      }}
                    >
                      Read
                    </Button>
                    <Divider />
                    <Button
                      variant="outlined"
                      id="fileSelector"
                      onClick={() => {
                        openFileSelector();
                      }}
                    >
                      {filesContent.length > 0
                        ? filesContent[0].name
                        : "Select .mpk"}
                    </Button>
                    {filesContent.length > 0 ? (
                      <Button
                        variant="outlined"
                        id="btnPakWrite"
                        onClick={() => {
                          pakWrite();
                        }}
                      >
                        Write
                      </Button>
                    ) : null}
                    <Divider />
                    <Button
                      variant="outlined"
                      sx={{ color: "black", backgroundColor: "red" }}
                      id="btnPakFormat"
                      onClick={() => {
                        handleFormat();
                      }}
                    >
                      Format
                    </Button>
                  </Stack>
                </AccordionDetails>
              </Accordion>
            )}

            <Divider />
            <Accordion elevation={18}>
              <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                aria-controls="panel1a-content"
                id="panel1a-header"
              >
                <Typography>Controller Slot Config</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Stack spacing={3}>
                  <FormControl>
                    <InputLabel id="memory bank select">
                      Active Memory Bank
                    </InputLabel>
                    <Select
                      value={bank}
                      onChange={(x) => {
                        setBank(x.target.value);
                      }}
                    >
                      {bankRange.map((number, index) => (
                        <MenuItem key={index} value={number}>
                          {number}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                  <Button
                    id="btnPakRead"
                    variant="outlined"
                    onClick={() => {
                      let globalCfg = props.globalCfg;
                      globalCfg[3] = bank - 1;
                      saveGlobalCfg(props.btService, globalCfg);
                    }}
                  >
                    Save
                  </Button>
                </Stack>
              </AccordionDetails>
            </Accordion>
          </Stack>
        )}
        <Box>
          <Stack spacing={5}>
            {showProgress && (
              <ProgressBar now={progress} label={`${progress}%`} />
            )}
            {showCancel && (
              <Button
                variant="outlined"
                id="btnFileTransferCancel"
                onClick={() => {
                  abortFileTransfer();
                }}
              >
                Cancel
              </Button>
            )}
          </Stack>
        </Box>
      </Box>
    </Paper>
  );
}

export default N64Configuration;
