import React, { useState, useEffect } from "react";
import Select from 'react-select'
import { brUuid, savePresetInput } from './Btutils';

var bluetoothDevice;

function Presets() {
  
  //blue retro service ID used for saving preset
  const [brService, setBrService] = useState(null);
  
  //flag to render selection menus
  const [pageInit, setPageInit] = useState(false);
  
  const [description, setDescription] = useState("");
  
  const [presets, setPresets] = useState(null);
  
  //hook that controls which controller we are configuring
  const [input, setInput] = useState({value: 1});
  
  const [consoles, setConsoles] = useState(null);
  
  const [presetList, setPresetList] = useState([
    { value: -1, label: 'Select a Preset' }
  ]);
  
  //list of selectable consoles, used to filter preset list
  const [selectionConsoles, setSelectionConsoles] = useState([
    { value: -1, label: 'Select a console', test: "lol"}
  ]);

  //list of preset names used to load JSON files
  const [presetsNames, setPresetNames] = useState("");

  //hook to render game console lable
  const [gameConsole, setGameConsole] = useState(-1);
  
  //hook to render preset lable
  const [selectedPreset, setSelectedPreset] = useState(-1);

  const myrange = [1,2,3,4,5,6,7,8,9,10,11,12];
  
  //handle react select labels
  const handleConsoleChange = (obj) => {
    setGameConsole(obj);
    setSelectedPreset(null);
    setDescription(null);
    setPresetList(populateConsolePresets(obj.value, presets, consoles));
  };
  
  //handle react select label
  const handlePresetChange = (obj) => {
    setSelectedPreset(obj);
    setDescription(getPresetDescription(presets[obj.value]));
  };
    
  useEffect(() => {
      //check if we have local file list, and that it is not too old
        (async function() {
            try {
                let da = new Date();
                if(localStorage.getItem("lastAccess") === null || localStorage.getItem("fileNames") === null || localStorage.getItem("fileNames") === {} || da.getTime() > (localStorage.getItem("lastAccess") + 15000)){
                    //we either don't have the file names or the last update was a while ago
                    //set access time to current time
                    localStorage.setItem("lastAccess", da.getTime());

                    const response = await fetch(
                        'https://api.github.com/repos/darthcloud/BlueRetroWebCfg/contents/map/'
                    ); 
                    const json = await response.json();
                    let arr = [];
                    for(let i = 0; i < json.length; i++){
                        arr.push(json[i].name);
                    }
                    localStorage.setItem("fileNames", JSON.stringify(arr));
                    setPresetNames(arr);
                }
                else{
                   setPresetNames(JSON.parse(localStorage.getItem("fileNames")));
                }
            } catch (e) {
                console.error(e);
            }
        })();
 }, []);
    
  return (
    <div className="Presets">
        <div id="divBtConn" style={{paddingLeft:"20%", width:"50%", paddingRight:"20%"}}>  
            <button style={{borderRadius:"12px"}} id="btBtn" onClick={() => {btConn(setSelectionConsoles, presetsNames, setPresets, setPageInit, setBrService, setConsoles)}}>Connect BlueRetro</button><br/>
            <small>
              <i>Disconnect all controllers from BlueRetro before connecting for configuration.</i>
            </small>
        </div>
    {pageInit && <div id="divInputCfg" style={{marginBottom:"1em"}}>
        
    <h2 >Mapping Config</h2>
    <div>
      <div style={{marginLeft:"20%", width:"50%"}}>
       <b>Input</b>
        <Select 
          placeholder="1"
          value={input}
          options={myrange.map(merange => ({key: merange, text:merange, value: merange }))}
          onChange={x => setInput(x)}
          getOptionLabel={x => x.value}
        />
        <b>Console</b>
        <Select
          placeholder="Select Console"
          value={gameConsole}
          options={selectionConsoles}
          onChange={x => handleConsoleChange(x)}
          getOptionLabel={x => x.label}
        />
        <br />
        <b>Preset</b>
        <Select
          placeholder="Select Preset"
          value={selectedPreset}
          options={presetList}
          onChange={x => handlePresetChange(x)}
          getOptionLabel={x => x.label}
          getOptionValue={x => x}
        />
      </div>
      {description}
    </div>
    </div>
    }
    <button id="save" onClick={() => {savePresetInput(presets, selectedPreset.value, brService, input.value)}}>save</button>
    </div>
  );
}

function getPresetDescription(preset){
    //if preset is undefined set to default otherwise retrun description
    if(preset === undefined){
        return "Select a preset";
    }
    else{
        return preset.desc;
    }
}


function populateConsolePresets(selectedConsole, presets, consoles) {
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

function getPresets(presetNames) {
    //get presets locally from preset names list
    let presets = [];
    for(let i = 0; i < presetNames.length; i++){
        presets.push(require('../map/' + presetNames[i]));
    }
    return presets;
}

function initInputSelect(presetNamesHook, presetsHook, consoleListHook, consolesHook) {
    //push all console names from JSON files
    let consoles = [];
    let presets = getPresets(presetNamesHook);
    for (var i = 0; i < presets.length; i++) {
        consoles.push(presets[i].console)
    }
    let consoleArr = [{value: -1, label: "Select Console"}]
    //filter out non-unique items
    consoles = consoles.filter(onlyUnique)
    for (let i = 0; i < consoles.length; i++) {
        consoleArr.push({value: i, label: consoles[i]})
    }
    presetsHook(presets);
    consolesHook(consoles);
    consoleListHook(consoleArr);
}

//standard function to filter out non-unique items from an array
function onlyUnique(value, index, self) {
    return self.indexOf(value) === index;
}

function onDisconnected() {
  console.log('> Bluetooth Device disconnected');
    document.getElementById("divBtConn").style.display = 'block';
    document.getElementById("divInputCfg").style.display = 'none';
}

function btConn(setConsoleListHook, presetNames, presetsHook, pageInitHook, brServiceHook, consolesHook) {
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
        initInputSelect(presetNames, presetsHook, setConsoleListHook, consolesHook);
        brServiceHook(service);
        pageInitHook(true);
    })
    .catch(error => {
      console.log('Argh! ' + error);
    });
}

export default Presets;