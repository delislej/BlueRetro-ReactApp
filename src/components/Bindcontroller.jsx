import React, { useState, useEffect, useRef } from "react";
//import Select from 'react-select'
import { brUuid } from './Btutils';
import Logbox, {ChromeSamples} from "./Logbox";
import { useGamepads } from 'awesome-react-gamepads';
var bluetoothDevice;

const Bindcontroller = () => {
  //const [brService, setBrService] = useState(null);
  const [pageInit, setPageInit] = useState(false);
  const [buttonList, setButtonList] = useState([]);
  const [boundList, setBoundList] = useState(Array(32).fill("not Set"));
  const n64 = useRef([]);
  const btnPressed = useRef(-1);
  const time = useRef(performance.now());
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
  

  useEffect(()=>{n64.current = require('../controllers/n64.json')})

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
  });

  const makeButtons = () => {
    
    return buttonList.map(button => (
    <div className={"button" + button.key} key={button.key}>{button.element} bound: {boundList[button.key]}</div>
  ))};

  return (
    <div className="Blueretro">
      <div class="container">
        <div class="row align-items-center my-5">
          <div class="col-lg-7">
          </div>
          <div class="col-lg-5">
            <h1 class="font-weight-light">Contact</h1>
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

export default Bindcontroller;