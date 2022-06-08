import React, { useState, useEffect } from "react";
import Select from "react-select";
import { Typography } from "@mui/material";
import { Button } from "@mui/material";
import { btnList, btn } from "../utils/constants";
import savePresetInput from "../utils/savePresetInput";
import { useNavigate } from "react-router-dom";
import { Paper } from "@mui/material";
import { gameConsoleControllers } from "../utils/constants";
import { controllers } from "../utils/constants";
import Accordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import AccordionActions from "@mui/material/AccordionActions";
import Stack from "@mui/material/Stack";
import { useFilePicker } from "use-file-picker";

const Presetsmaker = (props) => {
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
  const [expanded, setExpanded] = useState(false);
  const [isDisabled, setIsDisabled] = useState(true);
  const [openFileSelector, { filesContent, clear }] = useFilePicker({
    accept: ".json",
    multiple: false,
    readAs: "Text",
  });
  var filterArr = [];

  const navigate = useNavigate();

  useEffect(() => {
    if (props.btDevice === null) {
      navigate("/");
    }
    if (props.globalCfg[0] === 255) {
      navigate("/");
    }
  }, [props.btDevice, props.globalCfg, navigate]);

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

  const downloadJson = (obj) => {
    const element = document.createElement("a");
    let temp = new Blob([JSON.stringify(obj)], { type: "application/json" });
    element.href = URL.createObjectURL(temp);
    element.download = "userFile.json";
    document.body.appendChild(element);
    element.click();
  };

  const makeJson = (x, y, z) => {
    let temp = {
      gameConsoleController: x,
      bluetoothController: y,
      bindings: z,
    };
    return temp;
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
            placeholder="Default"
            isSearchable={false}
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

  const handleChange = (panel) => (event, isExpanded) => {
    if (panel === "panel1") {
      setIsDisabled(true);
    }
    setExpanded(isExpanded ? panel : false);
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

  const saveUploadedBindings = (file) => {
    var buttonKeys = Object.keys(btn);
    let json = {
      name: "preset maker json",
      desc: "used as a shell for making presets",
      console: "NA",
      map: [],
    };
    let tempMap = [];

    for (let i = 0; i < file.bindings.length; i++) {
      if (file.bindings[i].bindings.length < 1) {
        let arr = [];
        arr.push(buttonKeys[file.bindings[i].value]);
        arr.push(buttonKeys[file.bindings[i].value]);
        arr.push(0);
        arr.push(100);
        arr.push(50);
        arr.push(135);
        arr.push(0);
        arr.push(0);
        arr.push(0);
        tempMap.push(arr);
      } else {
        for (let j = 0; j < file.bindings[i].bindings.length; j++) {
          let arr = [];
          arr.push(buttonKeys[file.bindings[i].bindings[j].value]);
          arr.push(buttonKeys[file.bindings[i].value]);
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
    <Paper sx={{ p: 2, marginBottom: "25px", width: { xs: "90%", lg: "66%" } }}>
      <Accordion
        elevation={5}
        expanded={expanded === "panel1"}
        onChange={handleChange("panel1")}
      >
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          aria-controls="panel1a-content"
          id="panel1a-header"
        >
          <Typography>Controller Selection</Typography>
        </AccordionSummary>
        <AccordionDetails sx={{ alignItems: "center" }}>
          <Stack spacing={3}>
            <Typography>Bindings</Typography>

            <Select
              defaultValue={""}
              isSearchable={false}
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
              isSearchable={false}
              name="colors"
              options={controllerOptions}
              onChange={(x) => {
                handleControllerChange(x);
              }}
              className="basic-multi-select"
              classNamePrefix="select"
            />
          </Stack>
        </AccordionDetails>
        <AccordionActions>
          <Button
            variant="outlined"
            onClick={() => {
              if (
                selectedController !== -1 &&
                selectedGameConsoleController !== -1
              ) {
                createSelects(
                  selectedGameConsoleController,
                  selectedController
                );
                setIsDisabled(false);
                setExpanded("panel2");
              }
            }}
          >
            Start
          </Button>
        </AccordionActions>
      </Accordion>
      <Accordion
        elevation={5}
        expanded={expanded === "panel2"}
        disabled={isDisabled}
        onChange={handleChange("panel2")}
      >
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          aria-controls="panel1a-content"
          id="panel1a-header"
        >
          <Typography>Bindings</Typography>
        </AccordionSummary>
        <AccordionDetails sx={{ alignItems: "center" }}>
          <Stack
            spacing={3}
            sx={{ height: { xs: "300px", lg: "700" }, overflowY: "auto" }}
          >
            <Select
              defaultValue={""}
              isSearchable={false}
              name="input"
              options={inputOptions}
              onChange={(x) => {
                handleInputChange(x);
              }}
              className="basic-multi-select"
              classNamePrefix="select"
            />
            {selects}
          </Stack>
        </AccordionDetails>
        <AccordionActions>
          <Stack direction={"row"} spacing={1}>
            <Button
              variant="outlined"
              onClick={() => {
                saveBindings();
              }}
            >
              Save Bindings
            </Button>

            <Button
              variant="outlined"
              onClick={() => {
                downloadJson(
                  makeJson(
                    selectedGameConsoleController,
                    selectedController,
                    consoleController
                  )
                );
              }}
            >
              Save to File
            </Button>
          </Stack>
        </AccordionActions>
      </Accordion>

      <Accordion
        elevation={5}
        expanded={expanded === "panel3"}
        onChange={handleChange("panel3")}
      >
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          aria-controls="panel1a-content"
          id="panel1a-header"
        >
          <Typography>Upload Preset</Typography>
        </AccordionSummary>
        <AccordionDetails sx={{ alignItems: "center" }}>
          <Stack spacing={3}>
            <Select
              defaultValue={""}
              isSearchable={false}
              name="input"
              options={inputOptions}
              onChange={(x) => {
                handleInputChange(x);
              }}
              className="basic-multi-select"
              classNamePrefix="select"
            />
            <Button
              variant="outlined"
              id="fileSelector"
              onClick={() => {
                openFileSelector();
              }}
            >
              {filesContent.length > 0 ? filesContent[0].name : "Select .json"}
            </Button>
            {filesContent.length > 0 ? (
              <Button
                variant="outlined"
                id="btnPakWrite"
                onClick={() => {
                  saveUploadedBindings(JSON.parse(filesContent[0].content));
                  clear();
                }}
              >
                Write
              </Button>
            ) : null}
          </Stack>
        </AccordionDetails>
      </Accordion>
    </Paper>
  );
};

export default Presetsmaker;
