import React from "react";

import { maxMainInput, btn, brUuid } from '../components/Utils';

function Presets() {
  return (
    <div className="Presets">
      <div id="divBtConn">
    <button id="btConn" onClick={() => {Navigator.bluetooth.requestDevice(
        {filters: [{name: 'BlueRetro'}],
        optionalServices: [brUuid[0]]})}}>Connect BlueRetro</button><br/>
    <small><i>Disconnect all controllers from BlueRetro before connecting for configuration.</i></small>
</div>
<div id="divInputCfg" style={{display:'none',marginBottom:"1em"}}>
    <h2 style={{margin:0}}>Mapping Config</h2>
    <p id="desc">placeholder</p>
</div>
    </div>
  );
}


var presets = [];
var bluetoothDevice;
let brService = null;
var pageInit = 0;
var consoles = []

function initInputSelect() {
    //push all console names from JSON files
    for (var i = 0; i < presets.length; i++) {
        consoles.push(presets[i].console)
    }
    //filter out non-unique items
    consoles = consoles.filter(onlyUnique)
    //set placeholder description
    document.getElementById("desc").textContent = "Select a system and then preset";
    var div = document.createElement("outputandconsole");
    var main = document.createElement("select");

    for (let i = 0; i < maxMainInput; i++) {
        var option  = document.createElement("option");
        option.value = i;
        option.text = "Output " + (i + 1);
        main.add(option);
    }
    main.id = "inputSelect";
    div.appendChild(main);

    var main2 = document.createElement("select");
    //add placeholder option
    let option2  = document.createElement("option");
        option2.value = -1;
        option2.text = "All";
        main2.add(option2);
    //add console filter options    
    for (let i = 0; i < consoles.length; i++) {
        let option3  = document.createElement("option");
        option3.value = i;
        option3.text = consoles[i];
        main2.add(option3);
    }
    main2.id = "consoleName";
    main2.addEventListener("change", chooseConsole);
    div.appendChild(main);
    //add preset drop down menu
    var main3 = document.createElement("select");
    main3.id = "presetsName";
    main3.addEventListener("change", selectInput);
    div.appendChild(main3);

    var divInputCfg = document.getElementById("divInputCfg");
    divInputCfg.appendChild(div);
    //populate preset list with all options by default
    populateConsolePresets(undefined);
}

function initOutputMapping() {
    
    let divSave = document.createElement("saveButton");

    var btn = document.createElement("button");
    btn.id = "inputSave";
    btn.innerText = 'Save';
    btn.addEventListener("click", saveInput);
    divSave.appendChild(btn);
    divSave.setAttribute("style", "margin-top:1em;");

    var div = document.createElement("div");
    div.id = "inputSaveText";
    div.setAttribute("style", "display:none;margin-top:1em;");
    var p = document.createElement("p");
    p.setAttribute("style", "font-style:italic;font-size:small;color:green;");
    p.innerText = "Config saved, mapping changes take effect immediately.";

    div.appendChild(p);
    divSave.appendChild(div);

    //Append first cfg
    let divMappingGrp = document.createElement("save");
    var divInputCfg = document.getElementById("divInputCfg");
    divMappingGrp.appendChild(divSave);
    divInputCfg.appendChild(divMappingGrp);
}

function fetchMap(presets, files, idx) {
    return new Promise(function(resolve, reject) {
        fetch("map/" + files[idx].name)
        .then(rsp => {
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

function initBlueRetroCfg() {
    getMapList('https://api.github.com/repos/darthcloud/BlueRetroWebCfg/contents/map/')
    .then(files => {
        return fetchMap(presets, files, 0);
    })
    .then(_ => {
        initInputSelect();
        initOutputMapping();
        pageInit = 1;
    })
    .catch(error => {
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

        console.log('Input: '+ cfgId + "\n" + 'Preset: ' + preset);
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
      console.log('Init Cfg DOM...');
        brService = service;
        if (!pageInit) {
            initBlueRetroCfg();
        }
        document.getElementById("divBtConn").style.display = 'none';
        document.getElementById("divInputCfg").style.display = 'block';
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