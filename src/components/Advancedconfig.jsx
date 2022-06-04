import React, { useEffect, useState } from "react";
import Accordion from "@mui/material/Accordion";
import Box from "@mui/material/Box";
import { brUuid, sys_deep_sleep, sys_reset } from "./Btutils";
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
import { btnList } from "./Btutils";
import { useNavigate } from "react-router-dom";
import { ChromeSamples } from "./Logbox";

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

  const [system, setSystem] = useState("");
  const [multiTap, setMultiTap] = useState("");
  const [inquiry, setInquiry] = useState("");
  const [expanded, setExpanded] = useState(false);
  const navigate = useNavigate();
  useEffect(() => {
    console.log(props.globalCfg);
    if (props.globalCfg[0] === 255) {
      navigate("/");
    }
    setSystem(props.globalCfg[0]);
    setMultiTap(props.globalCfg[1]);
    setInquiry(props.globalCfg[2]);
  }, [props.globalCfg, navigate]);

  function saveGlobal() {
    var data = props.globalCfg;
    data[0] = system;
    data[1] = multiTap;
    data[2] = inquiry;
    return new Promise(function (resolve, reject) {
      ChromeSamples.log("Get Global Config CHRC...");
      props.btService
        .getCharacteristic(brUuid[1])
        .then((chrc) => {
          ChromeSamples.log("Writing Global Config...");
          return chrc.writeValue(data);
        })
        .then((_) => {
          ChromeSamples.log("Global Config saved");
          resolve();
        })
        .catch((error) => {
          reject(error);
        });
    });
  }

  function saveOutput() {
    var data = new Uint8Array(2);
    data[0] = controllerMode;
    data[1] = controllerAccessory;
    var cfgId = controller;
    return new Promise(function (resolve, reject) {
      ChromeSamples.log("Get Output " + cfgId + " CTRL CHRC...");
      props.btService
        .getCharacteristic(brUuid[2])
        .then((chrc) => {
          ChromeSamples.log("Set Output " + cfgId + " on CTRL chrc...");
          var outputCtrl = new Uint16Array(1);
          outputCtrl[0] = Number(cfgId);
          return chrc.writeValue(outputCtrl);
        })
        .then((_) => {
          ChromeSamples.log("Get Output " + cfgId + " DATA CHRC...");
          return props.btService.getCharacteristic(brUuid[3]);
        })
        .then((chrc) => {
          ChromeSamples.log("Writing Output " + cfgId + " Config...");
          return chrc.writeValue(data);
        })
        .then((_) => {
          //document.getElementById("outputSaveText").style.display = "block";
          if (data[0] === 3) {
            //document.getElementById("outputSaveMouse").style.display = "block";
          }
          ChromeSamples.log("Output " + cfgId + " Config saved");
          resolve();
        })
        .catch((error) => {
          reject(error);
        });
    });
  }

  function setDeepSleep(evt) {
    var cmd = new Uint8Array(1);
    let ctrl_chrc = null;
    props.btService
      .getCharacteristic(brUuid[7])
      .then((chrc) => {
        ctrl_chrc = chrc;
        cmd[0] = sys_deep_sleep;
        return ctrl_chrc.writeValue(cmd);
      })
      .catch((error) => {
        ChromeSamples.log("Argh! " + error);
        return ctrl_chrc.writeValue(cmd);
      });
  }

  function setReset(evt) {
    var cmd = new Uint8Array(1);
    let ctrl_chrc = null;
    props.btService
      .getCharacteristic(brUuid[7])
      .then((chrc) => {
        ctrl_chrc = chrc;
        cmd[0] = sys_reset;
        return ctrl_chrc.writeValue(cmd);
      })
      .catch((error) => {
        ChromeSamples.log("Argh! " + error);
        return ctrl_chrc.writeValue(cmd);
      });
  }

  const handleChange = (panel) => (event, isExpanded) => {
    setExpanded(isExpanded ? panel : false);
  };

  return (
    <Paper
      sx={{
        width: "75%",
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
                <InputLabel id="memory pak select">System</InputLabel>
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
                    saveGlobal();
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
                <Button id="btnPakRead" variant="outlined" onClick={() => {}}>
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
                  setReset();
                }}
              >
                Deep Sleep
              </Button>
              <Button
                id="sysDeepSleep"
                variant="outlined"
                onClick={() => {
                  setDeepSleep();
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
