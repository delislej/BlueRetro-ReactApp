import React, { useState, useEffect, useRef } from "react";
//import Select from 'react-select'
import { brUuid } from './Btutils';
import Logbox, {ChromeSamples} from "./Logbox";
//import { useGamepads } from 'awesome-react-gamepads';
var bluetoothDevice;

const Presetsmaker = () => {

  var jsonTest = {
    "name":"Default Gamepad only",
    "desc":"Generic preset that should be good for most games. Only map gamepad buttons & axes.",
    "console":"Default",
    "map":[
        ["PAD_LX_LEFT",  "PAD_LX_LEFT",  0, 100, 50, 135, 0, 0, 0],
        ["PAD_LX_RIGHT", "PAD_LX_RIGHT", 0, 100, 50, 135, 0, 0, 0],
        ["PAD_LY_DOWN",  "PAD_LY_DOWN",  0, 100, 50, 135, 0, 0, 0],
        ["PAD_LY_UP",    "PAD_LY_UP",    0, 100, 50, 135, 0, 0, 0],
        ["PAD_RX_LEFT",  "PAD_RX_LEFT",  0, 100, 50, 135, 0, 0, 0],
        ["PAD_RX_RIGHT", "PAD_RX_RIGHT", 0, 100, 50, 135, 0, 0, 0],
        ["PAD_RY_DOWN",  "PAD_RY_DOWN",  0, 100, 50, 135, 0, 0, 0],
        ["PAD_RY_UP",    "PAD_RY_UP",    0, 100, 50, 135, 0, 0, 0],
        ["PAD_LD_LEFT",  "PAD_LD_LEFT",  0, 100, 50, 135, 0, 0, 0],
        ["PAD_LD_RIGHT", "PAD_LD_RIGHT", 0, 100, 50, 135, 0, 0, 0],
        ["PAD_LD_DOWN",  "PAD_LD_DOWN",  0, 100, 50, 135, 0, 0, 0],
        ["PAD_LD_UP",    "PAD_LD_UP",    0, 100, 50, 135, 0, 0, 0],
        ["PAD_RD_LEFT",  "PAD_RD_LEFT",  0, 100, 50, 135, 0, 0, 0],
        ["PAD_RD_RIGHT", "PAD_RD_RIGHT", 0, 100, 50, 135, 0, 0, 0],
        ["PAD_RD_DOWN",  "PAD_RD_DOWN",  0, 100, 50, 135, 0, 0, 0],
        ["PAD_RD_UP",    "PAD_RD_UP",    0, 100, 50, 135, 0, 0, 0],
        ["PAD_RB_LEFT",  "PAD_RB_LEFT",  0, 100, 50, 135, 0, 0, 0],
        ["PAD_RB_RIGHT", "PAD_RB_RIGHT", 0, 100, 50, 135, 0, 0, 0],
        ["PAD_RB_DOWN",  "PAD_RB_DOWN",  0, 100, 50, 135, 0, 0, 0],
        ["PAD_RB_UP",    "PAD_RB_UP",    0, 100, 50, 135, 0, 0, 0],
        ["PAD_MM",       "PAD_MM",       0, 100, 50, 135, 0, 0, 0],
        ["PAD_MS",       "PAD_MS",       0, 100, 50, 135, 0, 0, 0],
        ["PAD_MT",       "PAD_MT",       0, 100, 50, 135, 0, 0, 0],
        ["PAD_MQ",       "PAD_MQ",       0, 100, 50, 135, 0, 0, 0],
        ["PAD_LM",       "PAD_LM",       0, 100, 50, 135, 0, 0, 0],
        ["PAD_LS",       "PAD_LS",       0, 100, 50, 135, 0, 0, 0],
        ["PAD_LT",       "PAD_LT",       0, 100, 50, 135, 0, 0, 0],
        ["PAD_LJ",       "PAD_LJ",       0, 100, 50, 135, 0, 0, 0],
        ["PAD_RM",       "PAD_RM",       0, 100, 50, 135, 0, 0, 0],
        ["PAD_RS",       "PAD_RS",       0, 100, 50, 135, 0, 0, 0],
        ["PAD_RT",       "PAD_RT",       0, 100, 50, 135, 0, 0, 0],
        ["PAD_RJ",       "PAD_RJ",       0, 100, 50, 135, 0, 0, 0]
    ]
}
  
  
  //const [brService, setBrService] = useState(null);
  const [pageInit, setPageInit] = useState(false);
  const [buttonList, setButtonList] = useState([]);
  //const [boundList, setBoundList] = useState(Array(32).fill("not Set"));
  const n64 = useRef([]);
  const btnPressed = useRef(-1);
  //const time = useRef(performance.now());
  const allowButtonRead = useRef(false);
  const readButton = (button) => {
    console.log(button);
    allowButtonRead.current = true;
    btnPressed.current = button;
  };

  const onDisconnected = () => {
    ChromeSamples.log('> Bluetooth Device disconnected');
    setPageInit(false);
  }

  const downloadJson = (obj) => {
    const element = document.createElement("a");
    let temp = new Blob([JSON.stringify(obj)], {type: "application/json"});
    element.href = URL.createObjectURL(temp);
    element.download = "userFile.json";
    document.body.appendChild(element); 
    element.click();
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
        //brService = service;
        //return getAppVersion();
    })
    .then(_ => {
        ChromeSamples.log('Init Cfg DOM...');
        setButtonList(getBindButtons(n64.current));
        setPageInit(true);
    })
    .catch(error => {
        ChromeSamples.log('Argh! ' + error);
    });
  }
  

  useEffect(()=>{n64.current = require('../controllers/n64.json');})

  const getBindButtons = (thing) => {
    let temp = [];
    //console.log("boundList: " + boundList);
    for (let i = 0; i < thing.map.length; i++) {
      if(thing.map[i][1] !== ""){
        temp.push({element:<button onClick={()=>{
          if(!allowButtonRead.current === true){
          readButton(i)}
          else{console.log("already binding button!")}
        }}>bind {thing.map[i][1]} button: </button>, key: i})
      }
      
    }
    return temp;
  }

  /*
  useGamepads({
    onConnect: (gamepad) => ChromeSamples.log('Gamepad Connected: ', gamepad),
    //onUpdate: (gamepad) => console.log(gamepad),
    onGamepadButtonUp: (button) => {
      if(allowButtonRead.current === true){
      let temp = boundList;
      temp[btnPressed.current] = button.buttonName;
      setBoundList(temp);
      time.current = performance.now();
      allowButtonRead.current = false;
    }},
    onGamepadAxesChange: (axes) => {
      if((allowButtonRead.current === true && axes.value > .5) || (allowButtonRead.current === true && axes.value < -.5)){
        let foundAxes = axes.axesName;
        if(axes.value > 0){
          foundAxes+="+";
        }
        else{
          foundAxes+="-";
        }
        console.log("axes detected");
        let temp = boundList;
        temp[btnPressed.current] = foundAxes;
        setBoundList(temp);
        time.current = performance.now();
        allowButtonRead.current = false;}
      },
    onKonamiSuccess: () => console.log("konami Success")
  });*/

  const makeButtons = () => {
    let buttons = buttonList.map(button => (
      <div className={"button" + button.key} key={button.key}>{button.element} bound: {/*boundList[button.key]*/}</div>
    ))
    return <div>
      {buttons}
      <button onClick={() => {downloadJson(jsonTest)}}> Download Preset </button>
      </div>};

  return (
    <div className="Blueretro">
      <div className="container">
        <div className="row align-items-center my-5">
          <div className="col-lg-7">
          </div>
          <div className="col-lg-5">
            <h1 className="font-weight-light">Contact</h1>
            {!pageInit && <div id="divBtConn" >  
            <button style={{borderRadius:"12px", margin:"auto"}} id="btBtn" onClick={() => {btConn()}}>Connect BlueRetro</button><br/>
            <small>
              <i>Disconnect all controllers from BlueRetro before connecting for configuration.</i>
            </small>
        </div>}
          {pageInit && makeButtons()}
          </div>
          <Logbox/>
        </div>
      </div>
    </div>
  );
};

export default Presetsmaker;