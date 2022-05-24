import React, { useState, useEffect } from "react";
//import Select from "react-select";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import Select from "@mui/material/Select";
import { brUuid, savePresetInput } from "./Btutils";
import Logbox, { ChromeSamples } from "./Logbox";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Button from "@mui/material/Button";
import Paper from "@mui/material/Paper";
import { Divider, Typography } from "@mui/material";

var bluetoothDevice;

function Presets() {
  //blue retro service ID used for saving preset
  const [brService, setBrService] = useState(null);

  //flag to render selection menus
  const [pageInit, setPageInit] = useState(false);

  const [description, setDescription] = useState("");

  const [presets, setPresets] = useState(null);

  const [spiffs, setSpiffs] = useState("lolSpiffs");

  //hook that controls which game controller we are configuring
  const [controller, setController] = useState(1);

  const [consoles, setConsoles] = useState(null);

  const [presetList, setPresetList] = useState([
    { value: -1, label: "Select a Preset" },
  ]);

  //hook to render game console lable
  const [gameConsole, setGameConsole] = useState(-1);

  //hook to render preset lable
  const [selectedPreset, setSelectedPreset] = useState(-1);

  const [validSave, setValidSave] = useState(false);

  const myrange = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];

  useEffect(() => {
    //check if we have local file list, and that it is not too old
    (async function () {
      try {
        let da = new Date();
        if (
          localStorage.getItem("lastAccess") === null ||
          localStorage.getItem("fileNames") === null ||
          localStorage.getItem("fileNames") === {} ||
          da.getTime() > localStorage.getItem("lastAccess") + 15000
        ) {
          //we either don't have the file names or the last update was a while ago
          //set access time to current time
          localStorage.setItem("lastAccess", da.getTime());

          const response = await fetch(
            "https://api.github.com/repos/darthcloud/BlueRetroWebCfg/contents/map/"
          );
          const json = await response.json();
          let arr = [];
          for (let i = 0; i < json.length; i++) {
            arr.push(json[i].name);
          }
          localStorage.setItem("fileNames", JSON.stringify(arr));
          let temp = getPresets(arr);
          setPresets(temp);
        } else {
          let temp = getPresets(JSON.parse(localStorage.getItem("fileNames")));
          setPresets(temp);
        }
      } catch (e) {
        console.error(e);
      }
    })();
  }, []);

  const btConn = () => {
    ChromeSamples.log("Requesting Bluetooth Device...");
    navigator.bluetooth
      .requestDevice({
        filters: [{ name: "BlueRetro" }],
        optionalServices: [brUuid[0]],
      })
      .then((device) => {
        ChromeSamples.log("Connecting to GATT Server...");
        bluetoothDevice = device;
        bluetoothDevice.addEventListener(
          "gattserverdisconnected",
          onDisconnected
        );
        return bluetoothDevice.gatt.connect();
      })
      .then((server) => {
        ChromeSamples.log("Getting BlueRetro Service...");
        return server.getPrimaryService(brUuid[0]);
      })
      .then((service) => {
        ChromeSamples.log("Init Cfg DOM...");
        initInputSelect();
        getAppVersion(service);
        setBrService(service);
        setPageInit(true);
      })
      .catch((error) => {
        ChromeSamples.log("Argh! " + error);
      });
  };

  const getAppVersion = (brService) => {
    return new Promise(function (resolve, reject) {
      ChromeSamples.log("Get Api version CHRC...");
      brService
        .getCharacteristic(brUuid[9])
        .then((chrc) => {
          ChromeSamples.log("Reading App version...");
          return chrc.readValue();
        })
        .then((value) => {
          var enc = new TextDecoder("utf-8");
          ChromeSamples.log("App version: " + enc.decode(value));
          console.log(
            "split: " + enc.decode(value).split(" ")[1].split("_spiffs")
          );
          setSpiffs(enc.decode(value).split(" "));
          resolve();
        })
        .catch((error) => {
          resolve();
        });
    });
  };

  const handleControllerChange = (event) => {
    setController(event.target.value);
  };

  const onDisconnected = () => {
    ChromeSamples.log("> Bluetooth Device disconnected");
    setPageInit(false);
  };

  const initInputSelect = () => {
    //push all console names from JSON files
    let consoles = [];
    for (var i = 0; i < presets.length; i++) {
      consoles.push(presets[i].console);
    }
    let consoleArr = [{ value: -1, label: "Select Console" }];
    //filter out non-unique items
    consoles = consoles.filter(onlyUnique);

    for (let i = 0; i < consoles.length; i++) {
      consoleArr.push({ value: i, label: consoles[i] });
    }
    console.log(consoleArr);
    setConsoles(consoleArr);
  };

  //standard function to filter out non-unique items from an array
  const onlyUnique = (value, index, self) => {
    return self.indexOf(value) === index;
  };

  //handle react select labels
  const handleConsoleChange = (obj) => {
    console.log(obj);
    setGameConsole(obj.target.value);
    setSelectedPreset(-1);
    setDescription("");
    setPresetList(populateConsolePresets(obj.target.value, presets, consoles));
    console.log(presetList);
  };

  const populateConsolePresets = (selectedConsole) => {
    //add "select preset first as -1 to prevent trying to save the placeholder"
    let list = [{ value: -1, label: "select a preset" }];
    //add presets to the list that match the selected console type
    if (selectedConsole !== -1 && consoles.length > 1) {
      for (let i = 0; i < presets.length; i++) {
        if (presets[i].console === consoles[selectedConsole + 1].label) {
          list.push({ value: i, label: presets[i].name });
        }
      }
    }
    //no filter selected, show whole preset list
    else {
      for (let i = 0; i < presets.length; i++) {
        list.push({ value: i, label: presets[i].name });
      }
    }
    return list;
  };

  //handle react select label
  const handlePresetChange = (obj) => {
    setValidSave(false);
    setSelectedPreset(obj.target.value);
    setDescription(getPresetDescription(presets[obj.target.value]));
    if (obj.target.value !== -1) {
      setValidSave(true);
    }
  };

  const getPresetDescription = (preset) => {
    //if preset is undefined set to default otherwise retrun description
    if (preset === undefined) {
      return "";
    } else {
      return preset.desc;
    }
  };

  const getPresets = (presetNames) => {
    //get presets locally from preset names list
    let presets = [];
    for (let i = 0; i < presetNames.length; i++) {
      presets.push(require("../map/" + presetNames[i]));
    }
    return presets;
  };

  return (
    <div className="Presets">
      {!pageInit && (
        <div id="divBtConn">
          <button
            style={{ borderRadius: "12px", margin: "auto" }}
            id="btBtn"
            onClick={() => {
              btConn();
            }}
          >
            Connect BlueRetro
          </button>
          <br />
          <small>
            <i>
              Disconnect all controllers from BlueRetro before connecting for
              configuration.
            </i>
          </small>
        </div>
      )}
      {pageInit && (
        <div id="divInputCfg">
          <Paper elevation={5}>
            <Typography sx={{ height: "100px", overflowY: "scroll" }}>
              {spiffs}
            </Typography>
          </Paper>
          <h2>Preset Configuration</h2>
          <div>
            <Paper
              sx={{
                mx: "auto",
                p: 2,
                width: "90%",
                backgroundColor: "#e6eaf3",
              }}
            >
              <Box
                sx={{
                  mx: "auto",
                  p: 2,
                  width: "95%",
                }}
              >
                <Stack spacing={2}>
                  <b>Controller</b>
                  <FormControl sx={{ m: 1, width: 300, mt: 3 }}>
                    <InputLabel id="demo-simple-select-helper-label">
                      Controller
                    </InputLabel>
                    <Select
                      value={controller}
                      onChange={(x) => handleControllerChange(x)}
                    >
                      {myrange.map((number, index) => (
                        <MenuItem key={index} value={number}>
                          {number}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                  <b>Console</b>
                  <FormControl>
                    <InputLabel id="demo-simple-select-helper-label">
                      Console
                    </InputLabel>
                    <Select
                      value={gameConsole}
                      onChange={(x) => handleConsoleChange(x)}
                    >
                      {consoles.map((console, index) => (
                        <MenuItem key={index + 13} value={console.value}>
                          {console.label}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                  <br />
                  <b>Preset</b>
                  <InputLabel id="demo-simple-select-helper-label">
                    Preset
                  </InputLabel>
                  <Select
                    value={selectedPreset}
                    onChange={(x) => handlePresetChange(x)}
                  >
                    {presetList.map((presetItem, index) => (
                      <MenuItem key={index + 13} value={presetItem.value}>
                        {presetItem.label}
                      </MenuItem>
                    ))}
                  </Select>

                  <Paper elevation={5}>
                    <Typography sx={{ height: "100px", overflowY: "scroll" }}>
                      {description}
                    </Typography>
                  </Paper>
                </Stack>
                <Divider />
                {validSave && (
                  <Box sx={{ textAlign: "center" }}>
                    <Button
                      id="save"
                      onClick={() => {
                        savePresetInput(
                          presets,
                          selectedPreset,
                          brService,
                          controller
                        );
                      }}
                    >
                      Save Preset
                    </Button>
                  </Box>
                )}
              </Box>
            </Paper>
          </div>
        </div>
      )}
      <Logbox />
    </div>
  );
}

export default Presets;
