import React, { useState, useEffect } from "react";
import Select from 'react-select'
import { brUuid, savePresetInput } from './Btutils';
import Logbox, {ChromeSamples} from "./Logbox";

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
  
  //hook to render game console lable
  const [gameConsole, setGameConsole] = useState(-1);
  
  //hook to render preset lable
  const [selectedPreset, setSelectedPreset] = useState(-1);

  const [validSave, setValidSave] = useState(false);

  const myrange = [1,2,3,4,5,6,7,8,9,10,11,12];
  

    
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
                    let temp = getPresets(arr);
                    setPresets(temp);
                }
                else{
                  let temp = getPresets(JSON.parse(localStorage.getItem("fileNames"))); 
                  setPresets(temp);
                }
            } catch (e) {
                console.error(e);
            }
        })();
 }, []);

 const btConn = () => {
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
    ChromeSamples.log('Init Cfg DOM...');
      initInputSelect();
      setBrService(service);
      setPageInit(true);
  })
  .catch(error => {
    ChromeSamples.log('Argh! ' + error);
  });
}

const onDisconnected = () => {
  ChromeSamples.log('> Bluetooth Device disconnected');
  setPageInit(false);
  }

const initInputSelect = () => {
  //push all console names from JSON files
  let consoles = [];
  for (var i = 0; i < presets.length; i++) {
      consoles.push(presets[i].console)
  }
  let consoleArr = [{value: -1, label: "Select Console"}]
  //filter out non-unique items
  consoles = consoles.filter(onlyUnique)
  for (let i = 0; i < consoles.length; i++) {
      consoleArr.push({value: i, label: consoles[i]}) 
  }
  setConsoles(consoleArr);
  //initialize presets list to unfiltered
  handleConsoleChange(consoleArr[0]);
}

//standard function to filter out non-unique items from an array
const onlyUnique = (value, index, self) => {
  return self.indexOf(value) === index;
}

  //handle react select labels
  const handleConsoleChange = (obj) => {
    setGameConsole(obj);
    setSelectedPreset(null);
    setDescription(null);
    setPresetList(populateConsolePresets(obj.value, presets, consoles));
  };

  const populateConsolePresets = (selectedConsole) => {
    //add "select preset first as -1 to prevent trying to save the placeholder"
    let list = [{value:-1, label: "select a preset"}];
    //add presets to the list that match the selected console type
    if (selectedConsole !== -1 && consoles.length > 1) {
        for (let i = 0; i < presets.length; i++) {
            if (presets[i].console === consoles[selectedConsole+1].label) {
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

  //handle react select label
  const handlePresetChange = (obj) => {
    setValidSave(false);
    setSelectedPreset(obj);
    setDescription(getPresetDescription(presets[obj.value]));
    if(obj.value !== -1){
      setValidSave(true);
    }
  };

  const getPresetDescription = (preset) => {
    //if preset is undefined set to default otherwise retrun description
    if(preset === undefined){
        return "";
    }
    else{
        return preset.desc;
    }
  }

  const getPresets = (presetNames) => {
    //get presets locally from preset names list
    let presets = [];
    for(let i = 0; i < presetNames.length; i++){
        presets.push(require('../map/' + presetNames[i]));
    }
    return presets;
    }

  return (
    <div className="Presets" style={{display: "flex",
      justifyContent: "center",
      alignItems:"center",
      flexDirection: "column",
      }}>
        {!pageInit && <div id="divBtConn" >  
            <button style={{borderRadius:"12px", margin:"auto"}} id="btBtn" onClick={() => {btConn()}}>Connect BlueRetro</button><br/>
            <small>
              <i>Disconnect all controllers from BlueRetro before connecting for configuration.</i>
            </small>
        </div>}
    {pageInit && <div id="divInputCfg" >
        
    <h2 >Preset Configuration</h2>
    <div>
      <div style={{width: "100%"}}>
       <b>Input</b>
        <Select 
          placeholder="1"
          isSearchable={false}
          value={input}
          options={myrange.map(merange => ({key: merange, text:merange, value: merange }))}
          onChange={x => setInput(x)}
          getOptionLabel={x => x.value}
        />
        <b>Console</b>
        <Select
          placeholder="Select Console"
          isSearchable={false}
          value={gameConsole}
          options={consoles}
          onChange={x => handleConsoleChange(x)}
          getOptionLabel={x => x.label}
        />
        <br />
        <b>Preset</b>
        <Select
          placeholder="Select Preset"
          isSearchable={false}
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
    <Logbox/>
    {validSave && <button id="save" style={{width: '50%'}} onClick={() => {savePresetInput(presets, selectedPreset.value, brService, input.value)}}>save</button>}
    </div>
  );
}

export default Presets;