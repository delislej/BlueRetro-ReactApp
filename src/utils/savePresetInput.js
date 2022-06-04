import ChromeSamples from "../utils/ChromeSamples";
import writeInputCfg from "./writeInputCfg";
import {btn} from "../utils/constants";

export function savePresetInput(presets, presetNumber, brService, input) {
    //make sure preset is not placeholder before we do anything
    if (presetNumber !== -1) {
      var nbMapping = presets[presetNumber].map.length;
      var cfgSize = nbMapping * 8 + 3;
      var cfg = new Uint8Array(cfgSize);
      var cfgId = input - 1;
      var j = 0;
      cfg[j++] = 0;
      cfg[j++] = 0;
      cfg[j++] = nbMapping;
      for (var i = 0; i < nbMapping; i++) {
        cfg[j++] = btn[presets[presetNumber].map[i][0]];
        cfg[j++] = btn[presets[presetNumber].map[i][1]];
        cfg[j++] = presets[presetNumber].map[i][2] + cfgId;
        cfg[j++] = presets[presetNumber].map[i][3];
        cfg[j++] = presets[presetNumber].map[i][4];
        cfg[j++] = presets[presetNumber].map[i][5];
        cfg[j++] = presets[presetNumber].map[i][6];
        cfg[j++] =
          Number(presets[presetNumber].map[i][7]) |
          (Number(presets[presetNumber].map[i][8]) << 4);
      }
  
      return new Promise(function (resolve, reject) {
        writeInputCfg(cfgId, cfg, brService)
          .then((_) => {
            ChromeSamples.log("Input " + cfgId + " Config saved");
            resolve();
          })
          .catch((error) => {
            reject(error);
          });
      });
    }
  }

  export default savePresetInput;