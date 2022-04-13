import React, { useState } from "react";
import Select from 'react-select'
import { btn, brUuid } from '../components/Utils';

let mapListFile = require('../mapList.json');
var presets = [];
var bluetoothDevice;
let brService = null;
var consoles = []


function Presets() {
  const [pageInit, setPageInit] = useState(false);
  const [description, setDescription] = useState("");
  
  const [selectionConsoles, setSelectionConsoles] = useState([
    { value: -1, label: 'Select a console', test: "lol"}
  ]);

  const [selectionPresets, setSelectionPresets] = useState([
    { value: -1, label: 'Select a Preset' }
  ]);

  const [selectedPreset, setSelectedPreset] = useState(-1);
  
  return (
    <div className="Presets">
        <div id="divBtConn">  
            <button id="btBtn" onClick={() => {btConn(setSelectionConsoles, setPageInit)}}>Connect BlueRetro</button><br/>
            <small><i>Disconnect all controllers from BlueRetro before connecting for configuration.</i></small>
        </div>
    {pageInit && <div id="divInputCfg" style={{marginBottom:"1em"}}>
        {description}
    <h2 style={{margin:0}}>Mapping Config</h2>
    <Select options={selectionConsoles} onChange={(x)=>{setSelectionPresets(populateConsolePresets(x.value));}} />
    <Select options={selectionPresets} onChange={(x)=>{setDescription(getPresetDescription(x.value))
    setSelectedPreset(x.value);
    }} />
    </div>}
    
    <button id="save" onClick={() => {saveInput(selectedPreset)}}>save</button>
    </div>
  );
}

function getPresetDescription(presetNum){
    if(presetNum === -1){
        return "Select a preset";
    }
    else{
        return presets[presetNum].desc;
    }
}

function populateConsolePresets(selectedConsole) {
    //add "select preset first as -1 to prevent trying to save the placeholder"
    let list = [{value:-1, label: "select a preset"}];
    //add presets to the list that match the selected console type
    if (selectedConsole !== -1) {
        for (let i = 0; i < presets.length; i++) {
            if (presets[i].console === consoles[selectedConsole]) {
               list.push({value: i, label: presets[i].name}) 
            }
        }
    }
    //no filter selected, show whole preset list
    else {
        for (let i = 0; i < presets.length; i++) {
            list.push({value: i, label: presets[i].name});
        }
    }
    return list;
}

function getPresets(mapListFile) {
    presets = []
    for(let i = 0; i < mapListFile.length; i++){
        presets.push(require('../map/' + mapListFile[i].name));
    }
    return presets;
}

function initInputSelect(hook) {
    //push all console names from JSON files
    presets = getPresets(mapListFile);
    console.log("in console func");
    for (var i = 0; i < presets.length; i++) {
        consoles.push(presets[i].console)
    }
    let consoleArr = [{value: -1, label: "Select Console"}]
    //filter out non-unique items
    consoles = consoles.filter(onlyUnique)
    for (let i = 0; i < consoles.length; i++) {
        consoleArr.push({value: i, label: consoles[i]})
    }
    hook(consoleArr);
}

//standard function to filter out non-unique items from an array
function onlyUnique(value, index, self) {
    return self.indexOf(value) === index;
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

function saveInput(presetNumber) {
    console.log(presetNumber);
    //get consoleName and preset name
    //make sure preset is not placeholder before we do anything
    if (presetNumber !== -1) {
        var nbMapping = presets[presetNumber].map.length;
        var cfgSize = nbMapping*8 + 3;
        var cfg = new Uint8Array(cfgSize);
        var cfgId = presetNumber;
        var j = 0;
        cfg[j++] = 0;
        cfg[j++] = 0;
        cfg[j++] = nbMapping;

        //console.log('Input: '+ cfgId + "\n" + 'Preset: ' + preset);
        for (var i = 0; i < nbMapping; i++) {
            cfg[j++] = btn[presets[presetNumber].map[i][0]];
            cfg[j++] = btn[presets[presetNumber].map[i][1]];
            cfg[j++] = presets[presetNumber].map[i][2] + cfgId;
            cfg[j++] = presets[presetNumber].map[i][3];
            cfg[j++] = presets[presetNumber].map[i][4];
            cfg[j++] = presets[presetNumber].map[i][5];
            cfg[j++] = presets[presetNumber].map[i][6];
            cfg[j++] = Number(presets[presetNumber].map[i][7]) | (Number(presets[presetNumber].map[i][8]) << 4);
        }

        return new Promise(function(resolve, reject) {
            writeInputCfg(cfgId, cfg)
            .then(_ => {
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

function btConn(hook, pageInitHook) {
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
        initInputSelect(hook);
        brService = service;
        console.log(presets)
        pageInitHook(true);
    })
    .catch(error => {
      console.log('Argh! ' + error);
    });
}

export default Presets;