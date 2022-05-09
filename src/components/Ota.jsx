import { useState } from 'react';
import ProgressBar from 'react-bootstrap/ProgressBar'

function Ota(){
  const [progress, setProgress] = useState(0);
    return (
        <div className="about">
          <div className="container">
            <div className="row align-items-center my-5">
              
              <div className="col-lg-5">
                <h1 className="font-weight-light">OTA Firmware Update</h1>
                
                <div>
      <div id="divBtConn">
      <button id="btConn" onClick={() => btConn()}>Connect BlueRetro</button>
      <small><i>Disconnect all controllers from BlueRetro before connecting for update.</i></small>
  </div>
  <div id="divFwSelect" >
      Select firmware:
      <input type="file" id="fwFile" name="fw.bin"/>
      <button id="btnFwUpdate" onClick={() => firmwareUpdate(setProgress)}>Update Firmware</button>
  </div>
  <div id="divFwUpdate" >
      <div id="progress_bar">
        <div className="percent">
          <ProgressBar now={progress} label={`${progress}%`}/>
          <p>{progress}</p>
        </div>
        </div>
      <button id="btnFwUpdateCancel" onClick={() => abortFwUpdate()}>Cancel</button>
  </div>
  </div>
              </div>
            </div>
          </div>
        </div>
      );
}

var brUuid = [
  '56830f56-5180-fab0-314b-2fa176799a00',
  '56830f56-5180-fab0-314b-2fa176799a01',
  '56830f56-5180-fab0-314b-2fa176799a02',
  '56830f56-5180-fab0-314b-2fa176799a03',
  '56830f56-5180-fab0-314b-2fa176799a04',
  '56830f56-5180-fab0-314b-2fa176799a05',
  '56830f56-5180-fab0-314b-2fa176799a06',
  '56830f56-5180-fab0-314b-2fa176799a07',
  '56830f56-5180-fab0-314b-2fa176799a08',
  '56830f56-5180-fab0-314b-2fa176799a09'
];

const mtu = 244;
const ota_start = 0xA5;
const ota_abort = 0xDE;
const ota_end = 0x5A;

var bluetoothDevice;
let brService = null;
var reader;
var start;
var end;
var cancel = 0;

function getAppVersion() {
  return new Promise(function(resolve, reject) {
    console.log('Get Api version CHRC...');
      brService.getCharacteristic(brUuid[9])
      .then(chrc => {
        console.log('Reading App version...');
          return chrc.readValue();
      })
      .then(value => {
          var enc = new TextDecoder("utf-8");
          console.log('App version: ' + enc.decode(value));
          resolve();
      })
      .catch(error => {
          resolve();
      });
  });
}

function abortFwUpdate() {
  console.log("aborting");
  cancel = 1;
}

function errorHandler(evt) {
  switch(evt.target.error.code) {
      case evt.target.error.NOT_FOUND_ERR:
          console.log('File Not Found!');
          break;
      case evt.target.error.NOT_READABLE_ERR:
          console.log('File is not readable');
          break;
      case evt.target.error.ABORT_ERR:
          break; // noop
      default:
          console.log('An error occurred reading this file.');
  };
}

function updateProgress(total, loaded,) {
  console.log(Math.round((loaded / total) * 100));
  // Increase the progress bar length.
}

function firmwareUpdate(progressBarHook) {
  // Reset progress indicator on new file selection.
  reader = new FileReader();
  reader.onerror = errorHandler;
  reader.onabort = function(e) {
    console.log('File read cancelled');
  };
  reader.onload = function(e) {
      writeFirmware(reader.result, progressBarHook);
  }

  // Read in the image file as a binary string.
  reader.readAsArrayBuffer(document.getElementById("fwFile").files[0]);
}

function writeFwRecursive(chrc, data, offset, progressBarHook) {
  return new Promise(function(resolve, reject) {
      if (cancel === 1) {
        console.log("aborted");
        new Error("Cancelled");
      }
      progressBarHook(Math.round((offset/data.byteLength)*100));
      //updateProgress(data.byteLength, offset, progressBarHook);
      var tmpViewSize = data.byteLength - offset;
      if (tmpViewSize > mtu) {
          tmpViewSize = mtu;
      }
      var tmpView = new DataView(data, offset, tmpViewSize);
      chrc.writeValue(tmpView)
      .then(_ => {
          offset += Number(mtu);
          if (offset < data.byteLength) {
              resolve(writeFwRecursive(chrc, data, offset, progressBarHook));
          }
          else {
              end = performance.now();
              
              console.log('FW upload done. Took: '  + (end - start)/1000 + ' sec');
              resolve();
          }
      })
      .catch(error => {
          reject(error);
      });
  });
}

function writeFirmware(data, progressBarHook) {
  var cmd = new Uint8Array(1);
  let ctrl_chrc = null;
  brService.getCharacteristic(brUuid[7])
  .then(chrc => {
      ctrl_chrc = chrc;
      cmd[0] = ota_start;
      return ctrl_chrc.writeValue(cmd)
  })
  .then(_ => {
      return brService.getCharacteristic(brUuid[8])
  })
  .then(chrc => {
      start = performance.now();
      return writeFwRecursive(chrc, data, 0, progressBarHook);
  })
  .then(_ => {
      cmd[0] = ota_end;
      return ctrl_chrc.writeValue(cmd)
  })
  .catch(error => {
    console.log('Argh! ' + error);
      
      cancel = 0;
      cmd[0] = ota_abort;
      return ctrl_chrc.writeValue(cmd)
  });
}

function onDisconnected() {
  console.log('> Bluetooth Device disconnected');
  cancel = 0;
  
}

function btConn() {
  console.log('Requesting Bluetooth Device...');
  navigator.bluetooth.requestDevice(
      {filters: [{name: 'BlueRetro'}],
      optionalServices: [brUuid[0]]})
  .then(device => {
    console.log('Connecting to GATT Server...');
      bluetoothDevice = device;
      bluetoothDevice.addEventListener('gattserverdisconnected', onDisconnected);
      return bluetoothDevice.gatt.connect();
  })
  .then(server => {
    console.log('Getting BlueRetro Service...');
      return server.getPrimaryService(brUuid[0]);
  })
  .then(service => {
      brService = service;
      return getAppVersion();
  })
  .then(_ => {
    console.log('Init Cfg DOM...');
      
  })
  .catch(error => {
    console.log('Argh! ' + error);
  });
}

export default Ota