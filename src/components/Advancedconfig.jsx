import React, { useEffect, useState } from "react";
import Accordion from "@mui/material/Accordion";
import Box from "@mui/material/Box";
import { brUuid } from "./Btutils";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
import Select from "@mui/material/Select";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import Button from "@mui/material/Button";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import { Divider, Typography } from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { btnList } from "./Btutils"
import { useNavigate } from "react-router-dom";
import { ChromeSamples } from "./Logbox";

function Advancedconfig(props) {

  var systemCfg = [
    'Auto',
    'Parallel_1P_PP',
    'Parallel_2P_PP',
    'NES',
    'PCE',
    'MD-Genesis',
    'SNES',
    'CD-i',
    'CD32',
    '3DO',
    'Jaguar',
    'PSX',
    'Saturn',
    'PC-FX',
    'JVS',
    'N64',
    'DC',
    'PS2',
    'GC',
    'Wii-Ext',
    "VB",
    "Parallel_1P_OD",
    "Parallel_2P_OD",
    "SEA Board",
];

var multitapCfg = [
    'None',
    'Slot 1',
    'Slot 2',
    'Dual',
    'Alt',
];

var inquiryMode = [
    'Auto',
    'Manual',
];

var devCfg = [
    'GamePad',
    'GamePadAlt',
    'Keyboard',
    'Mouse',
];


const [system, setSystem] = useState("");
const [multiTap, setMultiTap] = useState("");
const [inquiry, setInquiry] = useState("");
const navigate = useNavigate();
useEffect(()=>{
if(props.globalCfg[0] === 255){
  navigate("/");
}
setSystem(props.globalCfg[0]);
setMultiTap(props.globalCfg[1]);
setInquiry(props.globalCfg[2]);
},[props.globalCfg])

function saveGlobal() {
  var data = props.globalCfg;
  data[0] = system;
  data[1] = multiTap;
  data[2] = inquiry;
  return new Promise(function(resolve, reject) {
      ChromeSamples.log('Get Global Config CHRC...');
      props.btService.getCharacteristic(brUuid[1])
      .then(chrc => {
        ChromeSamples.log('Writing Global Config...');
          return chrc.writeValue(data);
      })
      .then(_ => {
          ChromeSamples.log('Global Config saved');
          resolve();
      })
      .catch(error => {
          reject(error);
      });
  });
}

  return (
    <div className="Blueretro">
      <Box
        sx={{
          my: 1,
          mx: "auto",
          p: 2,
          width: "75%",
        }}
      >
        <Stack spacing={3}>
                <Typography align="center">Advance Configuration</Typography>
                <Divider />
                  <Accordion elevation={18} sx={{minWidth:"300px"}}>
                    <AccordionSummary
                      expandIcon={<ExpandMoreIcon />}
                      aria-controls="panel1a-content"
                      id="panel1a-header"
                    >
                      <Typography>Global Config</Typography>
                    </AccordionSummary>
                    <AccordionDetails sx={{ alignItems: "center" }}>
                      <Stack spacing={3}>
                        <FormControl sx={{ minWidth: "100%" }}>
                          <InputLabel id="memory pak select">
                            System
                          </InputLabel>
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
                        
                        <FormControl sx={{ minWidth: "100%" }}>
                          <InputLabel id="memory pak select">
                            MultiTap
                          </InputLabel>
                          <Select
                            value={multiTap}
                            onChange={(x) => setMultiTap(x.target.value)}
                          >
                            {multitapCfg.map((number, index) => (
                              <MenuItem key={index+10} value={index}>
                                {number}
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                        
                        <FormControl sx={{ minWidth: "100%" }}>
                          <InputLabel id="memory pak select">
                          Inquiry mode
                          </InputLabel>
                          <Select
                            value={inquiry}
                            onChange={(x) => setInquiry(x.target.value)}
                          >
                            {inquiryMode.map((number, index) => (
                              <MenuItem key={index+20} value={index}>
                                {number}
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                        <Divider />
                        <Button
                          id="btnPakRead"
                          variant="outlined"
                          onClick={() => {
                            saveGlobal();
                          }}
                        >
                          Save Config
                        </Button>
                      </Stack>
                    </AccordionDetails>
                  </Accordion>


                {/*<Accordion elevation={18} sx={{ minWidth: "90%" }}>
                  <AccordionSummary
                    expandIcon={<ExpandMoreIcon />}
                    aria-controls="panel1a-content"
                    id="panel1a-header"
                  >
                    <Typography>Controller Slot Config</Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Stack spacing={3}>
                      <FormControl sx={{ minWidth: "100%" }}>
                        <InputLabel id="memory bank select">
                          Active Memory Bank
                        </InputLabel>
                        <Select
                          value={system}
                          onChange={(x) => {
                            setSystem(x.target.value);
                          }}
                        >
                          {systemCfg.map((number, index) => (
                            <MenuItem key={index} value={number}>
                              {number}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                      <Button
                        id="btnPakRead"
                        variant="outlined"
                        onClick={() => {
                          console.log(system);
                        }}
                      >
                        Save
                      </Button>
                    </Stack>
                  </AccordionDetails>
                </Accordion>*/}
              </Stack>
            
      </Box>
    </div>
  );
}

export default Advancedconfig;
