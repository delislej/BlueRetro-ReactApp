import React, { useState, useEffect } from "react";
import Select from "react-select";
//import { brUuid } from "./Btutils";
//import { ChromeSamples } from "./Logbox";
import { Typography } from "@mui/material";
import { Button } from "@mui/material";
import Box from "@mui/material/Box";
//import { useGamepads } from 'awesome-react-gamepads';
//var bluetoothDevice;
import { btnList, btn } from "../utils/constants";
import savePresetInput from "../utils/savePresetInput";
import { useNavigate } from "react-router-dom";

const Presetsmaker = (props) => {
  const controllers = [
    "Default",
    "Keyboard",
    "Mouse",
    "PS3",
    "PS4 / PS5",
    "Wiimote",
    "Wiimote + Classic",
    "Wiimote + Nunchuck",
    "WiiU / Switch Pro",
    "Switch NES",
    "Switch SNES",
    "Switch MD / Genesis",
    "Switch N64",
    "Switch Joycon",
    "Xbox One/X|S",
    "Steam",
  ];
  const gameConsoleControllers = [
    "NeoGeo (Parallel 1P)",
    "PCE",
    "PCE 6 btns",
    "NES",
    "SNES",
    "CD-i",
    "JVS",
    "3DO",
    "Jaguar",
    "Jaguar 6D",
    "PC-FX",
    "VB",
    "N64",
    "GameCube",
    "Atari / SMS",
    "MD / Genesis",
    "Saturn",
    "Dreamcast",
    "PSX / PS2",
  ];
  const myrange = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
  const [controller, setController] = useState([]);
  const [controllerOptions, setControllerOptions] = useState([]);
  const [gcControllerOptions, setGcControllerOptions] = useState([]);
  const [selectedController, setSelectedController] = useState(-1);
  const [selectedGameConsoleController, setSelectedGameConsoleController] =
    useState(-1);
  const [consoleController, setConsoleController] = useState([]);
  const [selects, setSelects] = useState(null);
  const [input, setInput] = useState(1);
  const [inputOptions, setInputOptions] = useState({ value: 0, label: 0 });
  var filterArr = [];

  const navigate = useNavigate();

  /*useEffect(() => {
    if (props.btDevice === null) {
      navigate("/");
    }
    if (props.globalCfg[0] === 255) {
      navigate("/");
    }
  }, [props.btDevice, props.globalCfg, navigate]);*/

  useEffect(() => {
    var cons = controllers.map(function (value, index) {
      return { value: index, label: value };
    });
    setControllerOptions(cons);

    var gcCons = gameConsoleControllers.map(function (value, index) {
      return { value: index, label: value };
    });
    setGcControllerOptions(gcCons);

    var inputs = myrange.map(function (input, index) {
      return { value: index, label: input };
    });

    setInputOptions(inputs);
    // eslint-disable-next-line
  }, []);

  const handleGcControllerChange = (gcCon) => {
    setSelectedGameConsoleController(gcCon.value + 16);
    var gameConsoleController = btnList.map(function (value, index) {
      return { value: index, label: value[gcCon.value + 16], bindings: [] };
    });
    var temp = [];
    for (let i = 0; i < gameConsoleController.length; i++) {
      if (gameConsoleController[i].label === "") {
        continue;
      } else {
        temp.push(gameConsoleController[i]);
      }
    }
    setConsoleController(temp);
  };

  const handleControllerChange = (con) => {
    setSelectedController(con.value);
    var bluetoothController = btnList.map(function (value, index) {
      return { value: index, label: value[con.value] };
    });
    var temp2 = [];
    for (let i = 0; i < bluetoothController.length; i++) {
      if (bluetoothController[i].label === "") {
        continue;
      } else {
        temp2.push(bluetoothController[i]);
      }
    }
    setController(temp2);
    createSelects(selectedGameConsoleController, selectedController);
  };

  const handleButtonBind = (index, bindings, actionType) => {
    if (actionType.action === "select-option") {
      filterArr.push(actionType.option.value);
    }

    if (actionType.action === "remove-value") {
      filterArr = filterArr.filter(function (value) {
        return value !== actionType.removedValue.value;
      });
    }

    var temp = consoleController;
    temp[index].bindings = bindings;
    setConsoleController(temp);
  };

  const createSelects = (gcCon, con) => {
    if (gcCon === -1 || con === -1) {
      return null;
    }

    var selectTemp = [];
    consoleController.forEach((element, index) => {
      selectTemp.push(
        <form key={index}>
          <label id="aria-label" htmlFor="aria-example-input">
            {element.label}
          </label>
          <Select
            defaultValue={element.value}
            isMulti
            filterOption={filterOption}
            isClearable={false}
            name="colors"
            options={controller}
            onChange={(x, actionType) => {
              handleButtonBind(index, x, actionType);
            }}
            className="basic-multi-select"
            classNamePrefix="select"
          />
        </form>
      );
    });
    setSelects(selectTemp);
  };

  const handleInputChange = (x) => {
    setInput(x.value + 1);
  };

  const filterOption = (option) => {
    if (filterArr.includes(option.value)) {
      return false;
    }
    return true;
  };

  const saveBindings = () => {
    var buttonKeys = Object.keys(btn);
    let json = {
      name: "preset maker json",
      desc: "used as a shell for making presets",
      console: "NA",
      map: [],
    };
    let tempMap = [];

    for (let i = 0; i < consoleController.length; i++) {
      if (consoleController[i].bindings.length < 1) {
        let arr = [];
        arr.push(buttonKeys[consoleController[i].value]);
        arr.push(buttonKeys[consoleController[i].value]);
        arr.push(0);
        arr.push(100);
        arr.push(50);
        arr.push(135);
        arr.push(0);
        arr.push(0);
        arr.push(0);
        tempMap.push(arr);
      } else {
        for (let j = 0; j < consoleController[i].bindings.length; j++) {
          let arr = [];
          arr.push(buttonKeys[consoleController[i].bindings[j].value]);
          arr.push(buttonKeys[consoleController[i].value]);
          arr.push(0);
          arr.push(100);
          arr.push(50);
          arr.push(135);
          arr.push(0);
          arr.push(0);
          arr.push(0);
          tempMap.push(arr);
        }
      }
    }
    json.map = tempMap;
    savePresetInput(json, props.btService, input);
  };

  return (
    <Box>
      <Typography>Bindings</Typography>
      <Select
        defaultValue={""}
        name="input"
        options={inputOptions}
        onChange={(x) => {
          handleInputChange(x);
        }}
        className="basic-multi-select"
        classNamePrefix="select"
      />
      <Select
        defaultValue={""}
        name="colors"
        options={gcControllerOptions}
        onChange={(x) => {
          handleGcControllerChange(x);
        }}
        className="basic-multi-select"
        classNamePrefix="select"
      />
      <Select
        defaultValue={""}
        name="colors"
        options={controllerOptions}
        onChange={(x) => {
          handleControllerChange(x);
        }}
        className="basic-multi-select"
        classNamePrefix="select"
      />
      <Button
        onClick={() => {
          createSelects(selectedGameConsoleController, selectedController);
        }}
      >
        Start
      </Button>
      {selects}
      <Button
        onClick={() => {
          saveBindings();
        }}
      >
        Save Bindings
      </Button>
    </Box>
  );
};

export default Presetsmaker;
