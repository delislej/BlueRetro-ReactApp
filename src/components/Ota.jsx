import { useState } from 'react';
import ProgressBar from 'react-bootstrap/ProgressBar'
import { brUuid, ota_abort, ota_end, ota_start, mtu } from './Btutils';
import Logbox from './Logbox';
import { ChromeSamples } from './Logbox';

var bluetoothDevice;
let brService;

function Ota(){
  const [progress, setProgress] = useState(0);
  const [btConnected, setBtConnected] = useState(false);
  var reader;
  var start;
  var end;
  var cancel = 0;

  const getAppVersion = () => {
    return new Promise(function(resolve, reject) {
    ChromeSamples.log('Get Api version CHRC...');
      brService.getCharacteristic(brUuid[9])
      .then(chrc => {
        ChromeSamples.log('Reading App version...');
          return chrc.readValue();
      })
      .then(value => {
          var enc = new TextDecoder("utf-8");
          ChromeSamples.log('App version: ' + enc.decode(value));
          resolve();
      })
      .catch(error => {
          resolve();
      });
  });
}

const firmwareUpdate = () => {// Reset progress indicator on new file selection.
    reader = new FileReader();
    reader.onerror = errorHandler;
    reader.onabort = function(e) {
      ChromeSamples.log('File read cancelled');
    };
    reader.onload = function(e) {
        writeFirmware(reader.result, setProgress);
    }
  
    // Read in the image file as a binary string.
    reader.readAsArrayBuffer(document.getElementById("fwFile").files[0]);
  }

  const abortFwUpdate = () => {
    ChromeSamples.log("aborting");
    cancel = 1;
    setBtConnected(false);
    ChromeSamples.clearLog();
  }

  const onDisconnected = () => {
    ChromeSamples.log('> Bluetooth Device disconnected');
    cancel = 0;
    setBtConnected(false);
  }

  const btConn = () => { 
    ChromeSamples.clearLog();
    cancel = 0;
    ChromeSamples.log('Requesting Bluetooth Device...');
  navigator.bluetooth.requestDevice(
      {filters: [{name: 'BlueRetro'}],
      optionalServices: [brUuid[0]]})
  .then(device => {
    ChromeSamples.log('Connecting to GATT Server...');
      bluetoothDevice = device;
      console.log(bluetoothDevice);
      bluetoothDevice.addEventListener('gattserverdisconnected', onDisconnected);
      return bluetoothDevice.gatt.connect();
  })
  .then(server => {
    ChromeSamples.log('Getting BlueRetro Service...');
      return server.getPrimaryService(brUuid[0]);
  })
  .then(service => {
      brService = service;
      return getAppVersion();
  })
  .then(_ => {
    ChromeSamples.log('Init Cfg DOM...');
      setBtConnected(true);
  })
  .catch(error => {
    ChromeSamples.log('Argh! ' + error);
  });
}

const writeFirmware = (data) => {
  var cmd = new Uint8Array(1);
  let ctrl_chrc = null;
  ChromeSamples.log("brService characteristics: " + brService);
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
      return writeFwRecursive(chrc, data, 0);
  })
  .then(_ => {
      cmd[0] = ota_end;
      return ctrl_chrc.writeValue(cmd)
  })
  .catch(error => {
    ChromeSamples.log('Argh! ' + error);
      cancel = 0;
      cmd[0] = ota_abort;
      return ctrl_chrc.writeValue(cmd)
  });
}

const errorHandler = (evt) => {
  switch(evt.target.error.code) {
      case evt.target.error.NOT_FOUND_ERR:
        ChromeSamples.log('File Not Found!');
          break;
      case evt.target.error.NOT_READABLE_ERR:
        ChromeSamples.log('File is not readable');
          break;
      case evt.target.error.ABORT_ERR:
          break; // noop
      default:
        ChromeSamples.log('An error occurred reading this file.');
  };
}

const writeFwRecursive = (chrc, data, offset) => {
  return new Promise(function(resolve, reject) {
      if (cancel === 1) {
        ChromeSamples.log("aborted");
        new Error("Cancelled");
      }
      setProgress(Math.round((offset/data.byteLength)*100));
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
              resolve(writeFwRecursive(chrc, data, offset));
          }
          else {
              end = performance.now();
              ChromeSamples.log('FW upload done. Took: '  + (end - start)/1000 + ' sec');
              resolve();
          }
      })
      .catch(error => {
          reject(error);
      });
  });
}

  return (
  <div className="about">
    <div className="container">
      <div >     
        <div style={{margin:"auto", width:"50%"}}>
          <h1 className="font-weight-light">OTA Firmware Update</h1>
          <div>
            {!btConnected && <div id="divBtConn">
              <button id="btConn" onClick={() => {setProgress(0); btConn();}}>
              Connect BlueRetro
              </button>
              <br/>
              <small>
                <i>
                  Disconnect all controllers from BlueRetro before connecting for update.
                </i>
              </small>
            </div>}
              {btConnected && 
              <div>
                <div id="progress_bar">
                  <div className="percent">
                    <ProgressBar now={progress} label={`${progress}%`}/>
                  </div>
                </div>
                <div id="divFwSelect" >
                  Select firmware:
                  <input type="file" id="fwFile" name="fw.bin"/>
                  <button id="btnFwUpdate" onClick={() => firmwareUpdate(setProgress)}>Update Firmware</button>
                </div>
                <div id="divFwUpdate" >  
                  <button id="btnFwUpdateCancel" onClick={() => abortFwUpdate(setBtConnected)}>Cancel</button>
                </div>
              </div>
              }
          </div>
        
        </div>
      </div>
      <Logbox/>
    </div>
  </div>
      );
}

export default Ota