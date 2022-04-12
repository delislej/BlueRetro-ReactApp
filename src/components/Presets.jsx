import React, { useState, Component } from "react";
import Select from 'react-select'
import { maxMainInput, btn, brUuid } from '../components/Utils';

var presets = [];
var bluetoothDevice;
let brService = null;
var pageInit = 0;
var consoles = []

function Presets() {
const [selectionConsoles, setSelectionConsoles] = useState([
    { value: -1, label: 'Select a console' }
  ]);

  const [selectionPresets, setSelectionPresets] = useState([
    { value: -1, label: 'Select a Preset' }
  ]);
  return (
    <div className="Presets">
      <div id="divBtConn">
    <button id="btBtn" onClick={() => {btConn(setSelectionConsoles)}}>Connect BlueRetro</button><br/>
    </div>
    if(){<button id="save" onClick={() => {saveInput()}}>save</button>}
    <small><i>Disconnect all controllers from BlueRetro before connecting for configuration.</i></small>

<div id="divInputCfg" style={{marginBottom:"1em"}}>
    <h2 style={{margin:0}}>Mapping Config</h2>
    <Select options={selectionConsoles} />
</div>
    </div>
  );
}



function initInputSelect(hook) {
    //push all console names from JSON files
    console.log("in console func");
    for (var i = 0; i < presets.length; i++) {
        consoles.push(presets[i].console)
    }
    console.log(consoles)
    let consoleArr = []
    //filter out non-unique items
    consoles = consoles.filter(onlyUnique)
    for (let i = 0; i < consoles.length; i++) {
        consoleArr.push({value: i, label: consoles[i]})
    }
    console.log(consoleArr);
    hook(consoleArr);
}

function fetchMap(presets, files, idx) {
    return new Promise(function(resolve, reject) {
        fetch("https://raw.githubusercontent.com/darthcloud/BlueRetroWebCfg/master/map/" + files[idx].name)
        .then(rsp => {
            console.log(rsp);
            return rsp.json();
        })
        .then(data => {
            presets.push(data);
            if (++idx < files.length) {
                resolve(fetchMap(presets, files, idx));
            }
            else {
                resolve(presets);
            }
        })
        .catch(error => {
            reject(error);
        });
    });
}

function getMapList(url) {
    return new Promise(function(resolve, reject) {
        fetch(url)
        .then(rsp => {
            return rsp.json();
        })
        .then(data => {
            console.log(data)
            resolve(data);
        })
        .catch(error => {
            reject(error);
        });
    });
}

//standard function to filter out non-unique items from an array
function onlyUnique(value, index, self) {
    return self.indexOf(value) === index;
}

function initBlueRetroCfg(hook) {
    console.log("in init, hook: " + hook)
    getMapList('https://api.github.com/repos/darthcloud/BlueRetroWebCfg/contents/map/')
    .then(files => {
        return fetchMap(presets, files, 0);
    })
    .then(_ => {
        console.log("not error")
        initInputSelect(hook)
    })
    .catch(error => {
        console.log("error")
        console.log('Argh! ' + error);
    });
}

function writeWriteRecursive(cfg, inputCtrl, ctrl_chrc, data_chrc) {
    return new Promise(function(resolve, reject) {
      console.log('Set Input Ctrl CHRC... ' + inputCtrl[1]);
        ctrl_chrc.writeValue(inputCtrl)
        .then(_ => {
            console.log('Writing Input Data CHRC...');
            var tmpViewSize = cfg.byteLength - inputCtrl[1];
            if (tmpViewSize > 512) {
                tmpViewSize = 512;
            }
            var tmpView = new DataView(cfg.buffer, inputCtrl[1], tmpViewSize);
            return data_chrc.writeValue(tmpView);
        })
        .then(_ => {
            console.log('Input Data Written');
            inputCtrl[1] += Number(512);
            if (inputCtrl[1] < cfg.byteLength) {
                resolve(writeWriteRecursive(cfg, inputCtrl, ctrl_chrc, data_chrc));
            }
            else {
                resolve();
            }
        })
        .catch(error => {
            reject(error);
        });
    });
}

function writeInputCfg(cfgId, cfg) {
    return new Promise(function(resolve, reject) {
        let ctrl_chrc = null;
        let data_chrc = null;
        brService.getCharacteristic(brUuid[4])
        .then(chrc => {
            ctrl_chrc = chrc;
            return brService.getCharacteristic(brUuid[5])
        })
        .then(chrc => {
            var inputCtrl = new Uint16Array(2);
            inputCtrl[0] = Number(cfgId);
            inputCtrl[1] = 0;
            data_chrc = chrc;
            return writeWriteRecursive(cfg, inputCtrl, ctrl_chrc, data_chrc);
        })
        .then(_ => {
            resolve(cfg);
        })
        .catch(error => {
            reject(error);
        });
    });
}

function saveInput() {
    //get consoleName and preset name
    var preset = Number(document.getElementById("presetsName").value);
    //make sure preset is not placeholder before we do anything
    if (preset !== -1) {

        document.getElementById("inputSaveText").style.display = 'none';
        var nbMapping = presets[preset].map.length;
        var cfgSize = nbMapping*8 + 3;
        var cfg = new Uint8Array(cfgSize);
        var cfgId = Number(document.getElementById("inputSelect").value);
        var j = 0;
        cfg[j++] = 0;
        cfg[j++] = 0;
        cfg[j++] = nbMapping;

        //console.log('Input: '+ cfgId + "\n" + 'Preset: ' + preset);
        for (var i = 0; i < nbMapping; i++) {
            cfg[j++] = btn[presets[preset].map[i][0]];
            cfg[j++] = btn[presets[preset].map[i][1]];
            cfg[j++] = presets[preset].map[i][2] + cfgId;
            cfg[j++] = presets[preset].map[i][3];
            cfg[j++] = presets[preset].map[i][4];
            cfg[j++] = presets[preset].map[i][5];
            cfg[j++] = presets[preset].map[i][6];
            cfg[j++] = Number(presets[preset].map[i][7]) | (Number(presets[preset].map[i][8]) << 4);
        }

        return new Promise(function(resolve, reject) {
            writeInputCfg(cfgId, cfg)
            .then(_ => {
                document.getElementById("inputSaveText").style.display = 'block';
                console.log('Input ' + cfgId + ' Config saved');
                resolve();
            })
            .catch(error => {
                reject(error);
            });
        });
    }
}

function onDisconnected() {
  console.log('> Bluetooth Device disconnected');
    document.getElementById("divBtConn").style.display = 'block';
    document.getElementById("divInputCfg").style.display = 'none';
}

function btConn(hook) {
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
      console.log('Init Cfg DOM...');
        brService = service;
        if (!pageInit) {
            initBlueRetroCfg(hook);
        }
    })
    .catch(error => {
      console.log('Argh! ' + error);
    });
}

function selectInput() {
    //only change the description if selected input is not the placeholder
    if (Number(document.getElementById("presetsName").value) === -1) {
        document.getElementById("desc").textContent = "Select a console and preset!";
    }
    else {
        document.getElementById("desc").textContent = presets[Number(this.value)].desc;
    }
}

function clearConsolePresets() {
    //clear the presets list then change the description to "select a console and preset!"
    var presetsList = document.getElementById("presetsName");
    var presetsListLength = presetsList.length;
    for (let i = 0; i < presetsListLength; i++) {
        presetsList.remove(0);
    }
    document.getElementById("desc").textContent = "Select a console and preset!";
}

function populateConsolePresets(selectedConsole) {
    //add "select preset first as -1 to prevent trying to save the placeholder"
    var list = document.getElementById("presetsName")
    list.add(new Option("Select preset", -1));
    //add presets to the list that match the selected console type
    if (selectedConsole !== undefined) {
        for (let i = 0; i < presets.length; i++) {
            if (presets[i].console === selectedConsole) {
                list.add(new Option(presets[i].name, i));
            }
        }
    }
    //no filter selected, show whole preset list
    else {
        for (let i = 0; i < presets.length; i++) {
            list.add(new Option(presets[i].name, i));
        }
    }
}

function chooseConsole(e) {
    //when changing consoles we clear the presets list and populate it with presets from the newly selected system
    clearConsolePresets()
    populateConsolePresets(consoles[e.target.value])
}


export default Presets;