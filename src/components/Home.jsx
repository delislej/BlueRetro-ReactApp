import React from "react";


function Home() {
  return (
    <div className="home">
      <div className="container">
        <div>
          <button id= "derp" onClick={console.log("button")}></button>
          </div>
        </div>
      </div>
  );
}
/*
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
      return getApiVersion();
  })
  .catch(error => {
      if (error.name == 'NotFoundError') {
          return;
      }
      throw error;
  })
  .then(() => {
      if (!pageInit) {
        console.log('Init Cfg DOM...');
          initBlueRetroCfg();
      }
      return loadGlobalCfg();
  })
  .then(() => {
      return loadOutputCfg(0);
  })
  .then(() => {
      return loadInputCfg(0);
  })
  .then(() => {
      document.getElementById("divBtConn").style.display = 'none';
      //document.getElementById("divBtDisconn").style.display = 'block';
      document.getElementById("divGlobalCfg").style.display = 'block';
      document.getElementById("divOutputCfg").style.display = 'block';
      document.getElementById("divInputCfg").style.display = 'block';
  })
  .catch(error => {
    console.log('Argh! ' + error);
  });
}

*/
export default Home;