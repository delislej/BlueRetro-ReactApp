import React, { useState, useRef, useEffect, useCallback } from "react";
import { ChromeSamples } from "./Logbox";
import { brUuid, mtu, block, pakSize } from "./Btutils";
import Button from "@mui/material/Button";
import ProgressBar from "react-bootstrap/ProgressBar";
import { useFilePicker } from "use-file-picker";
import Select from "react-select";
import { Box } from "@mui/material";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import { Divider, Typography } from "@mui/material";
import { NavLink } from "react-router-dom";

var cancel = 0;

function N64ctrlpak(props) {
  const startTime = useRef(0);
  const [show, setShow] = useState(false);
  const [showLowVersionError, setShowLowVersionError] = useState(false);
  const handleClose = () => setShow(false);
  const handleFormat = () => setShow(true);
  const [showProgress, setShowProgress] = useState(false);
  const [showCancel, setShowCancel] = useState(false);
  const [showButtons, setShowButtons] = useState(false);
  const [okVersion, setOkVersion] = useState(false);
  const [progress, setProgress] = useState(0);
  const [pak, setPak] = useState(0);
  const [openFileSelector, { filesContent, clear }] = useFilePicker({
    accept: ".mpk",
    multiple: false,
    readAs: "ArrayBuffer",
  });

  const myrange = [1, 2, 3, 4];

  const getBrVersion = useCallback(() => {
    return new Promise(function (resolve, reject) {
      props.btService
        .getCharacteristic(brUuid[9])
        .then((chrc) => {
          return chrc.readValue();
        })
        .then((value) => {
          var enc = new TextDecoder("utf-8");
          let temp = enc.decode(value).split(" ")[0].split("v")[1];
          if (versionCompare("1.6.1", temp) <= 0) {
            setOkVersion(true);
            setShowButtons(true);
          } else {
            setShowLowVersionError(true);
          }

          resolve();
        })
        .catch((error) => {
          resolve();
        });
    });
  }, [props.btService]);

  useEffect(() => {
    console.log(props.btService);
    getBrVersion(props.btService);
  }, [props.btService, getBrVersion]);

  const versionCompare = (v1, v2) => {
    // vnum stores each numeric
    // part of version
    var vnum1 = 0,
      vnum2 = 0;

    // loop until both string are
    // processed
    for (var i = 0, j = 0; i < v1.length || j < v2.length; ) {
      // storing numeric part of
      // version 1 in vnum1
      while (i < v1.length && v1[i] !== ".") {
        vnum1 = vnum1 * 10 + (v1[i] - "0");
        i++;
      }

      // storing numeric part of
      // version 2 in vnum2
      while (j < v2.length && v2[j] !== ".") {
        vnum2 = vnum2 * 10 + (v2[j] - "0");
        j++;
      }

      if (vnum1 > vnum2) return 1;
      if (vnum2 > vnum1) return -1;

      // if equal, reset variables and
      // go for next numeric part
      vnum1 = vnum2 = 0;
      i++;
      j++;
    }
    return 0;
  };

  const pakRead = (evt) => {
    // Reset progress indicator on new file selection.
    setProgress(0);
    setShowProgress(true);
    setShowButtons(false);
    ChromeSamples.log("reading pak");
    var data = new Uint8Array(pakSize);
    readFile(data)
      .then((value) => {
        let pakNum = pak + 1;
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

      <Dialog
        open={showLowVersionError}
        //onClose={handleCloseWarning}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">
          {"Low Version Warning!"}
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            This version is not compatible with N64 controller pak managment!
            make sure to flash version 1.6.1 or higher!
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <NavLink to="/">
            <Button>Close</Button>
          </NavLink>
        </DialogActions>
      </Dialog>

      <div className="container">
        {okVersion && (
          <Paper
            sx={{
              m: "auto",
              p: 2,
              width: "100%",
            }}
          >
            <Box
              sx={{
                m: "auto",
                width: "95%",
              }}
            >
              <div id="divFileSelect">
                {showButtons && (
                  <Stack spacing={3}>
                    <Typography align="center">N64 Controller Pak Managment</Typography>
                    <Select
                      placeholder="1"
                      isSearchable={false}
                      value={pak}
                      options={myrange.map((merange) => ({
                        key: merange,
                        text: merange,
                        value: merange,
                      }))}
                      onChange={(x) => setPak(x)}
                      getOptionLabel={(x) => x.value}
                    />
                    <Divider />
                    <Button
                      id="btnPakRead"
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
                )}
              </div>
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
        )}
      </div>
    </div>
  );
}

export default N64ctrlpak;
