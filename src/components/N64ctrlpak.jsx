import React, { useState, useRef } from "react";
import { Modal, Button } from "react-bootstrap";
import Logbox, { ChromeSamples } from "./Logbox";
import { brUuid, mtu, block, pakSize, getAppVersion } from "./Btutils";
import ProgressBar from 'react-bootstrap/ProgressBar'
import { useFilePicker } from 'use-file-picker';
import Select from 'react-select'
import { Box } from "@mui/material";

var bluetoothDevice;
let brService = null;
var cancel = 0;

function N64ctrlpak() {
  const startTime = useRef(0);
  const [show, setShow] = useState(false);
  const handleClose = () => setShow(false);
  const handleFormat = () => setShow(true);
  const [btConnected, setBtConnected] = useState(false);
  const [showProgress, setShowProgress] = useState(false);
  const [showCancel, setShowCancel] = useState(false);
  const [showButtons, setShowButtons] = useState(false);
  const [progress, setProgress] = useState(0);
  const [pak, setPak] = useState(0);
  const [openFileSelector, { filesContent, clear }] = useFilePicker({
    accept: '.mpk', multiple: false, readAs: 'ArrayBuffer'
  });

  const myrange = [1,2,3,4];
  
  const pakRead = (evt) => {
    // Reset progress indicator on new file selection.
    setProgress(0);
    setShowProgress(true);
    setShowButtons(false);
    ChromeSamples.log("reading pak");
    var data = new Uint8Array(pakSize);
    readFile(data)
    .then(value => {
        let pakNum = pak + 1;
        downloadFile(new Blob([value.buffer], {type: "application/mpk"}),
            'ctrl_pak' + pakNum + '.mpk');
        setShowProgress(false);
        setShowCancel(false);
        setShowButtons(true);
    })
    .catch(error => {
        ChromeSamples.log('Argh! ' + error);
        setShowCancel(false);
        setShowProgress(false);
        setShowButtons(true);
        cancel = 0;
    });
  }
  
  const pakWrite = (evt) => {
    writeFile(filesContent[0].content.slice(0, pakSize));
  }

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
  setTimeout(function() {
      window.URL.revokeObjectURL(url);
  }, 1000);
}

const abortFileTransfer = () => {
  cancel = 1;
}

const transferProgress = (total, loaded) => {
  var percentLoaded = Math.round((loaded / total) * 100);
  // Increase the progress bar length.
  if (percentLoaded < 100) {
    setProgress(percentLoaded);
  }
}

// Init function taken from MPKEdit by bryc:
// https://github.com/bryc/mempak/blob/dbd78db6ac55575838c6e107e5ea1e568981edc4/js/state.js#L8
const pakFormat = (evt) => {
      handleClose();
      setProgress(0);
      function writeAt(ofs) {for(let i = 0; i < 32; i++) data[ofs + i] = block[i];}

      const data = new Uint8Array(32768);
      const block = new Uint8Array(32);

      // generate id block
      block[1]  = 0 | (Math.random() * 256 & 0x3F);
      block[5]  = 0 | (Math.random() * 256 & 0x7);
      block[6]  = 0 | (Math.random() * 256);
      block[7]  = 0 | (Math.random() * 256);
      block[8]  = 0 | (Math.random() * 256 & 0xF);
      block[9]  = 0 | (Math.random() * 256);
      block[10] = 0 | (Math.random() * 256);
      block[11] = 0 | (Math.random() * 256);
      block[25] = 0x01; // device bit
      block[26] = 0x01; // bank size int (must be exactly '01')

      // calculate pakId checksum
      let sumA = 0, sumB = 0xFFF2;
      for(let i = 0; i < 28; i += 2){
      sumA += (block[i] << 8) + block[i + 1];
      sumA &= 0xFFFF;
      }
      sumB -= sumA;
      // store checksums
      block[28] = sumA >> 8;
      block[29] = sumA & 0xFF;
      block[30] = sumB >> 8;
      block[31] = sumB & 0xFF;

      // write checksum block to multiple sections in header page
      writeAt(32);
      writeAt(96);
      writeAt(128);
      writeAt(192);

      // init IndexTable and backup (plus checksums)
      for(let i = 5; i < 128; i++) {
          data[256 + (i * 2) + 1] = 3;
          data[512 + (i * 2) + 1] = 3;
      }
      data[257] = 0x71;
      data[513] = 0x71;

      //for(let i = 0; i < 32; i++) data[i] = i; // write label - needs to be verified
      //data[0] = 0x81; // libultra's 81 mark

      writeFile(data.buffer);
}

const readRecursive = (chrc, data, offset) => {
  return new Promise(function(resolve, reject) {
      if (cancel === 1) {
          throw new Error('Cancelled');
      }
      transferProgress(pakSize, offset);
      chrc.readValue()
      .then(value => {
          var tmp = new Uint8Array(value.buffer);
          data.set(tmp, offset);
          offset += value.byteLength;
          if (offset < (pakSize)) {
              resolve(readRecursive(chrc, data, offset));
          }
          else {
              setProgress(100);
              setShowCancel(false);
              ChromeSamples.log('File download done. Took: '  + Math.round((performance.now() - startTime.current))/1000 + ' sec');
              resolve(data);
          }
      })
      .catch(error => {
        console.log("error in readRecursive: " + error);
          reject(error);
      });
  });
}

const writeRecursive = (chrc, data, offset) => {
  return new Promise(function(resolve, reject) {
      var curBlock = ~~(offset / block) + 1;
      if (cancel === 1) {
          throw new Error('Cancelled');
      }
      transferProgress(data.byteLength, offset);
      let tmpViewSize = (curBlock * block) - offset;
      if (tmpViewSize > mtu) {
          tmpViewSize = mtu;
      }
      var tmpView = new DataView(data, offset, tmpViewSize);
      chrc.writeValue(tmpView)
      .then(_ => {
          offset += tmpViewSize;
          if (offset < data.byteLength) {
              resolve(writeRecursive(chrc, data, offset));
          }
          else {
              setProgress(100);
              ChromeSamples.log('File upload done. Took: '  + Math.round((performance.now() - startTime.current))/1000 + ' sec');
              resolve();
          }
      })
      .catch(error => {
          reject(error);
      });
  });
}

const readFile = (data) => {
    setShowCancel(true);
  return new Promise(function(resolve, reject) {
      var offset = new Uint32Array(1);
      let ctrl_chrc = null;
      setShowProgress(true);
      brService.getCharacteristic(brUuid[10])
      .then(chrc => {
          ctrl_chrc = chrc;
          offset[0] = Number(pak) * pakSize;
          return ctrl_chrc.writeValue(offset)
      })
      .then(_ => {
          return brService.getCharacteristic(brUuid[11])
      })
      .then(chrc => {
          startTime.current = performance.now();
          return readRecursive(chrc, data, 0);
      })
      .then(_ => {
          offset[0] = 0;
          return ctrl_chrc.writeValue(offset)
      })
      .then(_ => {
          resolve(data);
      })
      .catch(error => {
          reject(error);
      });
  });
}

const writeFile = (data) => {
  setShowButtons(false);
  setShowProgress(true);
  setShowCancel(true);
  var offset = new Uint32Array(1);
  let ctrl_chrc = null;
  
  brService.getCharacteristic(brUuid[10])
  .then(chrc => {
      console.log("formatting")
      ctrl_chrc = chrc;
      offset[0] = Number(pak) * pakSize;
      return ctrl_chrc.writeValue(offset)
  })
  .then(_ => {
      return brService.getCharacteristic(brUuid[11])
  })
  .then(chrc => {
      startTime.current = performance.now();
      setShowButtons(false);
      return writeRecursive(chrc, data, 0);
  })
  .then(_ => {
      offset[0] = 0;
      return ctrl_chrc.writeValue(offset)
  })
  .then(_ => {
      clear();
      setShowButtons(true);
      setShowCancel(false);
      setShowProgress(false);
  })
  .catch(error => {
      ChromeSamples.log('Argh! ' + error);
      setShowButtons(true);
      setShowCancel(false);
      setShowProgress(false);
      cancel = 0;
  });
}

const onDisconnected = () => {
  ChromeSamples.log('> Bluetooth Device disconnected');
  cancel = 0;
  setShowProgress(false);
  setShowButtons(false);
  setBtConnected(false);
}

const btConn = () => {
  ChromeSamples.clearLog();
  ChromeSamples.log('Requesting Bluetooth Device...');
  navigator.bluetooth.requestDevice(
      {filters: [{name: 'BlueRetro'}],
      optionalServices: [brUuid[0]]})
  .then(device => {
      ChromeSamples.log('Connecting to GATT Server...');
      bluetoothDevice = device;
      bluetoothDevice.addEventListener('gattserverdisconnected', onDisconnected);
      return bluetoothDevice.gatt.connect();
  })
  .then(server => {
      ChromeSamples.log('Getting BlueRetro Service...');
      return server.getPrimaryService(brUuid[0]);
  })
  .then(service => {
      brService = service;
      return getAppVersion(brService);
  })
  .then(_ => {
      ChromeSamples.log('Init Cfg DOM...');
      setBtConnected(true);
      setShowButtons(true);
  })
  .catch(error => {
      ChromeSamples.log('Argh! ' + error);
  });
}

  return (
    <div className="about">
      <Modal show={show} onHide={handleClose}>
        <Modal.Header closeButton>
          <Modal.Title>Format Memory Pak</Modal.Title>
        </Modal.Header>
        <Modal.Body><p>This will format your memory pak!</p> <p>There is no way to undo this!</p></Modal.Body>
        <Modal.Footer>
          <Button variant="primary" onClick={handleClose}>
            Close
          </Button>
          <Button variant="danger" onClick={() => {pakFormat();}}>
            Format Memory Pak
          </Button>
        </Modal.Footer>
      </Modal>
    
      <div className="container">
          <div className="row align-items-center my-5">
            {!btConnected && <div id="divBtConn">
              <button id="btConn" onClick={() =>{btConn()}}>Connect BlueRetro</button><br/>
              <small><i>Disconnect all controllers from BlueRetro before connecting for pak management.</i></small>
            </div>}
            <Box></Box>
            <div id="divFileSelect">
                {showButtons && 
                <div style={{display: 'flex', flexWrap:"wrap"}}>
                    <p>Select BlueRetro controller pak bank:</p>
                    <Select 
                    placeholder="1"
                    isSearchable={false}
                    value={pak}
                    options={myrange.map(merange => ({key: merange, text:merange, value: merange }))}
                    onChange={x => setPak(x)}
                    getOptionLabel={x => x.value}
                  />
                  <hr style={{width:"100%"}}/>
                    <button id="btnPakRead" onClick={() =>{pakRead()}}>Read</button>
                    <button id="btnPakWrite" onClick={() =>{pakWrite()}}>Write</button>
                    <hr style={{width:"100%"}}/>
                    <button id="fileSelector" onClick={() =>{openFileSelector()}}>{filesContent.length > 0 ? filesContent[0].name: "Select .mpk"}</button>
                    <hr style={{width:"100%"}}/>
                    <Button variant="danger" id="btnPakFormat" onClick={() =>{handleFormat()}}>Format</Button>
                </div>}
                {
                showProgress && <div id="divFileTransfer" >
                      <div id="progress_bar">
                      <ProgressBar now={progress} label={`${progress}%`}/>
                      </div>
                </div>
                }
                {showCancel && <button id="btnFileTransferCancel" onClick={() => {abortFileTransfer()}}>Cancel</button>}
            </div>
        </div>
        <Logbox/>
      </div>
    </div>
  );
}

export default N64ctrlpak;