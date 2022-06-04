import React, { useState, useEffect, useCallback } from "react";
//import Select from "react-select";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import Select from "@mui/material/Select";
import { savePresetInput } from "./Btutils";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Button from "@mui/material/Button";
import Checkbox from "@mui/material/Checkbox";
import FormControlLabel from "@mui/material/FormControlLabel";
import Paper from "@mui/material/Paper";
import { Divider, Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";

function Presets(props) {
  const navigate = useNavigate();
  //flag to render selection menus
  const [pageInit, setPageInit] = useState(false);

  const [description, setDescription] = useState("");

  const [presets, setPresets] = useState(null);

  const [showAllConsoles, setShowAllConsoles] = useState(false);

  //hook that controls which game controller we are configuring
  const [controller, setController] = useState(1);

  const [consoles, setConsoles] = useState(null);

  const [presetList, setPresetList] = useState([
    { value: -1, label: "Select a Preset" },
  ]);

  //hook to render game console lable
  const [gameConsole, setGameConsole] = useState("Select Console");

  //hook to render preset lable
  const [selectedPreset, setSelectedPreset] = useState(-1);

  const [validSave, setValidSave] = useState(false);

  const myrange = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];

  const handleConsoleChange = useCallback((obj, presets, consoles) => {
    setGameConsole(obj.target.value);
    setSelectedPreset(-1);
    setDescription("");
    //add "select preset first as -1 to prevent trying to save the placeholder"
    let list = [{ value: -1, label: "select a preset" }];
    //add presets to the list that match the selected console type
    if (obj.target.value !== "Select Console" && consoles.length > 1) {
      for (let i = 0; i < presets.length; i++) {
        if (presets[i].console === obj.target.value) {
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

    setPresetList(list);
  }, []);

  useEffect(() => {
    if(props.btDevice === null){
      navigate("/");
    }
    if (props.globalCfg[0] === 255) {
      navigate("/");
    }
  }, [props.btDevice, props.globalCfg, navigate]);

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

          let presets = getPresets(arr);
          setPresets(presets);
          //push all console names from JSON files
          let consoles = [];
          for (let i = 0; i < presets.length; i++) {
            consoles.push(presets[i].console);
          }
          let consoleArr = [{ value: "Select Console" }];
          //filter out non-unique items
          consoles = consoles.filter(onlyUnique);
          for (let i = 0; i < consoles.length; i++) {
            consoleArr.push({ value: consoles[i] });
          }
          setConsoles(consoleArr);
          //use consoleArr and presets to set starting filter
        } else {
          let presets = getPresets(
            JSON.parse(localStorage.getItem("fileNames"))
          );
          setPresets(presets);

          //push all console names from JSON files
          let consoles = [];
          for (let i = 0; i < presets.length; i++) {
            consoles.push(presets[i].console);
          }
          let consoleArr = [{ value: "Select Console" }];
          //filter out non-unique items
          consoles = consoles.filter(onlyUnique);
          for (let i = 0; i < consoles.length; i++) {
            consoleArr.push({ value: consoles[i] });
          }
          setConsoles(consoleArr);
          //use consoleArr and presets to set starting filter
          switch (props.brSpiffs) {
            case "n64":
              handleConsoleChange(
                { target: { value: "N64" } },
                presets,
                consoleArr
              );
              break;
            case "nes":
              handleConsoleChange(
                { target: { value: "NES" } },
                presets,
                consoleArr
              );
              break;
            case "cdi":
              handleConsoleChange(
                { target: { value: "CD-i" } },
                presets,
                consoleArr
              );
              break;
            case "dc":
              handleConsoleChange(
                { target: { value: "DC" } },
                presets,
                consoleArr
              );
              break;
            case "gc":
              handleConsoleChange(
                { target: { value: "GC" } },
                presets,
                consoleArr
              );
              break;
            case "jag":
              handleConsoleChange(
                { target: { value: "Jaguar" } },
                presets,
                consoleArr
              );
              break;
            default:
              handleConsoleChange(
                { target: { value: "Select Console" } },
                presets,
                consoleArr
              );
          }
          setPageInit(true);
        }
      } catch (e) {
        console.error(e);
      }
    })();
  }, [props.brSpiffs, handleConsoleChange]);

  const handleShowAllConsoles = () => {
    handleConsoleChange(
      { target: { value: "Select Console" } },
      presets,
      consoles
    );
    setShowAllConsoles(!showAllConsoles);
  };

  const handleControllerChange = (event) => {
    setController(event.target.value);
  };

  //standard function to filter out non-unique items from an array
  const onlyUnique = (value, index, self) => {
    return self.indexOf(value) === index;
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
    <Box className="Presets" sx={{
      width: "75%",
      marginBottom:"25px"
    }}>
      {pageInit && (
        <Paper className="preset paper"
          sx={{mx: "auto",
          p: 2,}}
        >
          
            <Stack spacing={2} >
              <FormControl>
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
              <FormControlLabel
                value="Show all Consoles"
                control={
                  <Checkbox
                    onChange={() => {
                      handleShowAllConsoles();
                    }}
                  />
                }
                label="Show all Consoles"
                labelPlacement="end"
              />
              {showAllConsoles && (
                <FormControl>
                  <InputLabel id="demo-simple-select-helper-label">
                    Console
                  </InputLabel>
                  <Select
                    value={gameConsole}
                    onChange={(x) => handleConsoleChange(x, presets, consoles)}
                  >
                    {consoles.map((console, index) => (
                      <MenuItem key={index + 50} value={console.value}>
                        {console.value}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              )}
              <br />
              <FormControl>
                <InputLabel id="demo-simple-select-helper-derp">
                  Preset
                </InputLabel>
                <Select
                  value={selectedPreset}
                  onChange={(x) => handlePresetChange(x)}
                >
                  {presetList.map((presetItem, index) => (
                    <MenuItem key={index + 100} value={presetItem.value}>
                      {presetItem.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <Paper elevation={5}>
                <Typography sx={{ height: "125px", overflowY: "scroll", p: 2 }}>
                  {description}
                </Typography>
              </Paper>
              {validSave && <Divider />}
              {validSave && (
                <Box sx={{ textAlign: "center" }}>
                  
                  <Button
                    id="save"
                    variant="outlined"
                    onClick={() => {
                      savePresetInput(
                        presets,
                        selectedPreset,
                        props.btService,
                        controller
                      );
                    }}
                  >
                    Save Preset
                  </Button>
                </Box>
              )}
            </Stack>
        </Paper>
      )}
    </Box>
  );
}

export default Presets;
