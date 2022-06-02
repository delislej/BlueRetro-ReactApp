import React, { useState, useRef, useEffect } from "react";
import { ChromeSamples } from "./Logbox";
import { brUuid, mtu, block, pakSize } from "./Btutils";
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

var cancel = 0;

function N64Configuration(props) {
  const navigate = useNavigate();
  const startTime = useRef(0);
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

  const myrange = [1, 2, 3, 4];

  useEffect(() => {
    console.log(props.globalCfg);
    if (props.btDevice === null ) {
      navigate("/");
    }
    if (props.globalCfg[0] === 255) {
      navigate("/");
    }
    
    setBank(props.globalCfg[3] + 1);
    if (props.allowManager === true) {
      setOkVersion(true);
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
        cancel = 0;
      });
  };

  const pakWrite = (evt) => {
    writeFile(filesContent[0].content.slice(0, pakSize));
  };

  // Source: https://newbedev.com/saving-binary-data-as-file-using-javascript-from-a-browser
  function downloadFile(blob, filename) {
    var url = window.URL.createObjectURL(blob);

    var a = document.createElement("a");
    a.style = "display: none";
    a.href = url;
    a.download = filename;

    document.body.appendChild(a);
    a.click();

    document.body.removeChild(a);

    // On Edge, revokeObjectURL should be called only after
    // a.click() has completed, atleast on EdgeHTML 15.15048
    setTimeout(function () {
      window.URL.revokeObjectURL(url);
    }, 1000);
  }

  const abortFileTransfer = () => {
    cancel = 1;
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
    function writeAt(ofs) {
      for (let i = 0; i < 32; i++) data[ofs + i] = block[i];
    }

    const data = new Uint8Array(32768);
    const block = new Uint8Array(32);

    // generate id block
    block[1] = 0 | ((Math.random() * 256) & 0x3f);
    block[5] = 0 | ((Math.random() * 256) & 0x7);
    block[6] = 0 | (Math.random() * 256);
    block[7] = 0 | (Math.random() * 256);
    block[8] = 0 | ((Math.random() * 256) & 0xf);
    block[9] = 0 | (Math.random() * 256);
    block[10] = 0 | (Math.random() * 256);
    block[11] = 0 | (Math.random() * 256);
    block[25] = 0x01; // device bit
    block[26] = 0x01; // bank size int (must be exactly '01')

    // calculate pakId checksum
    let sumA = 0,
      sumB = 0xfff2;
    for (let i = 0; i < 28; i += 2) {
      sumA += (block[i] << 8) + block[i + 1];
      sumA &= 0xffff;
    }
    sumB -= sumA;
    // store checksums
    block[28] = sumA >> 8;
    block[29] = sumA & 0xff;
    block[30] = sumB >> 8;
    block[31] = sumB & 0xff;

    // write checksum block to multiple sections in header page
    writeAt(32);
    writeAt(96);
    writeAt(128);
    writeAt(192);

    // init IndexTable and backup (plus checksums)
    for (let i = 5; i < 128; i++) {
      data[256 + i * 2 + 1] = 3;
      data[512 + i * 2 + 1] = 3;
    }
    data[257] = 0x71;
    data[513] = 0x71;

    //for(let i = 0; i < 32; i++) data[i] = i; // write label - needs to be verified
    //data[0] = 0x81; // libultra's 81 mark

    writeFile(data.buffer);
  };

  const readRecursive = (chrc, data, offset) => {
    return new Promise(function (resolve, reject) {
      if (cancel === 1) {
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
          console.log("error in readRecursive: " + error);
          reject(error);
        });
    });
  };

  const writeRecursive = (chrc, data, offset) => {
    return new Promise(function (resolve, reject) {
      var curBlock = ~~(offset / block) + 1;
      if (cancel === 1) {
        throw new Error("Cancelled");
      }
      transferProgress(data.byteLength, offset);
      let tmpViewSize = curBlock * block - offset;
      if (tmpViewSize > mtu) {
        tmpViewSize = mtu;
      }
      var tmpView = new DataView(data, offset, tmpViewSize);
      chrc
        .writeValue(tmpView)
        .then((_) => {
          offset += tmpViewSize;
          if (offset < data.byteLength) {
            resolve(writeRecursive(chrc, data, offset));
          } else {
            setProgress(100);
            ChromeSamples.log(
              "File upload done. Took: " +
                Math.round(performance.now() - startTime.current) / 1000 +
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

  const writeFile = (data) => {
    setShowButtons(false);
    setShowProgress(true);
    setShowCancel(true);
    var offset = new Uint32Array(1);
    let ctrl_chrc = null;

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
        setShowButtons(false);
        return writeRecursive(chrc, data, 0);
      })
      .then((_) => {
        offset[0] = 0;
        return ctrl_chrc.writeValue(offset);
      })
      .then((_) => {
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
        cancel = 0;
      });
  };

  function saveGlobal(memoryBank) {
    var data = props.globalCfg;
    data[3] = memoryBank - 1;
    return new Promise(function(resolve, reject) {
        ChromeSamples.log('Get Global Config CHRC...');
        props.btService.getCharacteristic(brUuid[1])
        .then(chrc => {
          ChromeSamples.log('Writing Global Config...');
            return chrc.writeValue(data);
        })
        .then(_ => {
            ChromeSamples.log('Global Config saved');
            resolve();
        })
        .catch(error => {
            reject(error);
        });
    });
  }

  return (
    <div>
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
          <Stack spacing={3} sx={{ mx: "auto" }}>
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

      <div className="container">
        <Paper
          sx={{
            m: "auto",
            p: 2,
            width: "100%",
            minWidth: "200px",
            marginBottom: "25px"
          }}
        >
          <Box
            sx={{
              m: "auto",
              width: "95%",
            }}
          >
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
                        <FormControl sx={{ minWidth: "100%" }}>
                          <InputLabel id="memory pak select">
                            Memory Pak
                          </InputLabel>
                          <Select
                            value={pak}
                            onChange={(x) => setPak(x.target.value)}
                          >
                            {myrange.map((number, index) => (
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

                <Accordion elevation={18} sx={{ minWidth: "90%" }}>
                  <AccordionSummary
                    expandIcon={<ExpandMoreIcon />}
                    aria-controls="panel1a-content"
                    id="panel1a-header"
                  >
                    <Typography>Controller Slot Config</Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Stack spacing={3}>
                      <FormControl sx={{ minWidth: "100%" }}>
                        <InputLabel id="memory bank select">
                          Active Memory Bank
                        </InputLabel>
                        <Select
                          value={bank}
                          onChange={(x) => {
                            setBank(x.target.value);
                          }}
                        >
                          {myrange.map((number, index) => (
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
                          saveGlobal(bank);
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
      </div>
    </div>
  );
}

export default N64Configuration;
