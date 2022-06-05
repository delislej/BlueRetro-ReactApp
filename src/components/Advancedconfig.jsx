import React, { useEffect, useState } from "react";
import Accordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
import AccordionActions from "@mui/material/AccordionActions";
import Select from "@mui/material/Select";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import Button from "@mui/material/Button";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import { Divider, Typography } from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { useNavigate } from "react-router-dom";
import ChromeSamples from "../utils/ChromeSamples";
import setReset from "../utils/setReset";
import setDeepSleep from "../utils/setDeepSleep";
import saveGlobalCfg from "../utils/saveGlobalCfg";
import saveOutputCfg from "../utils/saveOutputCfg"


function Advancedconfig(props) {
  var systemCfg = [
    "Auto",
    "Parallel_1P_PP",
    "Parallel_2P_PP",
    "NES",
    "PCE",
    "MD-Genesis",
    "SNES",
    "CD-i",
    "CD32",
    "3DO",
    "Jaguar",
    "PSX",
    "Saturn",
    "PC-FX",
    "JVS",
    "N64",
    "DC",
    "PS2",
    "GC",
    "Wii-Ext",
    "VB",
    "Parallel_1P_OD",
    "Parallel_2P_OD",
    "SEA Board",
  ];

  const controllerRange = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
  var devCfg = ["GamePad", "GamePadAlt", "Keyboard", "Mouse"];
  var accCfg = ["None", "Memory", "Rumble", "Both"];
  var multitapCfg = ["None", "Slot 1", "Slot 2", "Dual", "Alt"];
  var inquiryMode = ["Auto", "Manual"];
  const [controller, setController] = useState(0);
  const [controllerMode, setControllerMode] = useState(0);
  const [controllerAccessory, setControllerAccessory] = useState(0);
  const [inUse, setInUse] = useState(false);

  const [system, setSystem] = useState("");
  const [multiTap, setMultiTap] = useState("");
  const [inquiry, setInquiry] = useState("");
  const [expanded, setExpanded] = useState(false);
  const navigate = useNavigate();
  useEffect(() => {
    if (props.globalCfg[0] === 255) {
      navigate("/");
    }
    setSystem(props.globalCfg[0]);
    setMultiTap(props.globalCfg[1]);
    setInquiry(props.globalCfg[2]);
  }, [props.globalCfg, navigate]);


  const handleChange = (panel) => (event, isExpanded) => {
    setExpanded(isExpanded ? panel : false);
  };

  const handleSaveOutput = async () => {
    if (inUse === true) {
      ChromeSamples.log("Device is in use!");
    } else {
      setInUse(true);
    var data = new Uint8Array(2);
    data[0] = controllerMode;
    data[1] = controllerAccessory;
    let cfgId = controller;
    setInUse(true);
    saveOutputCfg(props.btService, data, cfgId)
    .then((_)=>{setInUse(false);})
    .catch((error) => {setInUse(false);});
    
    }
  }

  const handleSaveGlobal = async () => {
    if (inUse === true) {
      ChromeSamples.log("Device is in use!");
    } else {
      setInUse(true);
      let globalCfg = props.globalCfg;
      globalCfg[0] = system;
      globalCfg[1] = multiTap;
      globalCfg[2] = inquiry;
      await saveGlobalCfg(props.btService, globalCfg);

      await new Promise((resolve) => setTimeout(resolve, 500));

      setInUse(false);
    }
  };

  return (
    <Paper
      sx={{
        width: "66%",
        p: 2,
        marginBottom: "25px",
      }}
    >
      <Stack spacing={3}>
        <Typography>Advance Configuration</Typography>
        <Divider />
        <Accordion
          elevation={18}
          expanded={expanded === "panel1"}
          onChange={handleChange("panel1")}
        >
          <AccordionSummary
            expandIcon={<ExpandMoreIcon />}
            aria-controls="panel1a-content"
            id="panel1a-header"
          >
            <Typography>Global Config</Typography>
          </AccordionSummary>
          <AccordionDetails sx={{ alignItems: "center" }}>
            <Stack spacing={3}>
              <FormControl>
                <InputLabel id="System select">System</InputLabel>
                <Select
                  value={system}
                  onChange={(x) => setSystem(x.target.value)}
                >
                  {systemCfg.map((number, index) => (
                    <MenuItem key={index} value={index}>
                      {number}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControl>
                <InputLabel id="memory pak select">MultiTap</InputLabel>
                <Select
                  value={multiTap}
                  onChange={(x) => setMultiTap(x.target.value)}
                >
                  {multitapCfg.map((number, index) => (
                    <MenuItem key={index + 10} value={index}>
                      {number}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControl>
                <InputLabel id="inquiry mode select">Inquiry mode</InputLabel>
                <Select
                  value={inquiry}
                  onChange={(x) => setInquiry(x.target.value)}
                >
                  {inquiryMode.map((number, index) => (
                    <MenuItem key={index + 20} value={index}>
                      {number}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <AccordionActions>
                <Button
                  id="btnPakRead"
                  variant="outlined"
                  onClick={() => {
                    handleSaveGlobal();
                  }}
                >
                  Save Config
                </Button>
              </AccordionActions>
            </Stack>
          </AccordionDetails>
        </Accordion>

        <Divider />
        <Accordion
          elevation={18}
          expanded={expanded === "panel2"}
          onChange={handleChange("panel2")}
        >
          <AccordionSummary
            expandIcon={<ExpandMoreIcon />}
            aria-controls="panel1a-content"
            id="panel1a-header"
          >
            <Typography>Controller Config</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Stack spacing={3}>
              <FormControl>
                <InputLabel id="controller">controller</InputLabel>
                <Select
                  value={controller}
                  onChange={(x) => {
                    setController(x.target.value);
                  }}
                >
                  {controllerRange.map((number, index) => (
                    <MenuItem key={index} value={index}>
                      {number}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <FormControl>
                <InputLabel id="controller mode">controller mode</InputLabel>
                <Select
                  value={controllerMode}
                  onChange={(x) => {
                    setControllerMode(x.target.value);
                  }}
                >
                  {devCfg.map((number, index) => (
                    <MenuItem key={index} value={index}>
                      {number}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <FormControl>
                <InputLabel id="controller Accessory">
                  controller Accessory
                </InputLabel>
                <Select
                  value={controllerAccessory}
                  onChange={(x) => {
                    setControllerAccessory(x.target.value);
                  }}
                >
                  {accCfg.map((number, index) => (
                    <MenuItem key={index} value={index}>
                      {number}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <AccordionActions>
                <Button
                  id="saveOutput"
                  variant="outlined"
                  onClick={() => {
                    handleSaveOutput();
                  }}
                >
                  Save Config
                </Button>
              </AccordionActions>
            </Stack>
          </AccordionDetails>
        </Accordion>

        <Divider />

        <Accordion
          elevation={18}
          sx={{ minWidth: "90%" }}
          expanded={expanded === "panel3"}
          onChange={handleChange("panel3")}
        >
          <AccordionSummary
            expandIcon={<ExpandMoreIcon />}
            aria-controls="panel1a-content"
            id="panel1a-header"
          >
            <Typography>Miscellanious options</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Stack spacing={3}>
              <Button
                id="sysReset"
                variant="outlined"
                onClick={() => {
                  setReset(props.btService);
                }}
              >
                Deep Sleep
              </Button>
              <Button
                id="sysDeepSleep"
                variant="outlined"
                onClick={() => {
                  setDeepSleep(props.btService);
                }}
              >
                Reset BlueRetro Device
              </Button>
            </Stack>
          </AccordionDetails>
        </Accordion>
      </Stack>
    </Paper>
  );
}

export default Advancedconfig;
