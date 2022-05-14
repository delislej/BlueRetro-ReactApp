import { ChromeSamples } from "./Logbox";
export const brUuid = [
    '56830f56-5180-fab0-314b-2fa176799a00',
    '56830f56-5180-fab0-314b-2fa176799a01',
    '56830f56-5180-fab0-314b-2fa176799a02',
    '56830f56-5180-fab0-314b-2fa176799a03',
    '56830f56-5180-fab0-314b-2fa176799a04',
    '56830f56-5180-fab0-314b-2fa176799a05',
    '56830f56-5180-fab0-314b-2fa176799a06',
    '56830f56-5180-fab0-314b-2fa176799a07',
    '56830f56-5180-fab0-314b-2fa176799a08',
    '56830f56-5180-fab0-314b-2fa176799a09',
    '56830f56-5180-fab0-314b-2fa176799a0a',
    '56830f56-5180-fab0-314b-2fa176799a0b',
];

export const block = 4096;

export const pakSize = 32 * 1024;

export const mtu = 244;

export const ota_start = 0xA5;

export const ota_abort = 0xDE;

export const ota_end = 0x5A;

export const btn = {
    "PAD_LX_LEFT":0,
    "PAD_LX_RIGHT":1,
    "PAD_LY_DOWN":2,
    "PAD_LY_UP":3,
    "PAD_RX_LEFT":4,
    "PAD_RX_RIGHT":5,
    "PAD_RY_DOWN":6,
    "PAD_RY_UP":7,
    "PAD_LD_LEFT":8,
    "PAD_LD_RIGHT":9,
    "PAD_LD_DOWN":10,
    "PAD_LD_UP":11,
    "PAD_RD_LEFT":12,
    "PAD_RD_RIGHT":13,
    "PAD_RD_DOWN":14,
    "PAD_RD_UP":15,
    "PAD_RB_LEFT":16,
    "PAD_RB_RIGHT":17,
    "PAD_RB_DOWN":18,
    "PAD_RB_UP":19,
    "PAD_MM":20,
    "PAD_MS":21,
    "PAD_MT":22,
    "PAD_MQ":23,
    "PAD_LM":24,
    "PAD_LS":25,
    "PAD_LT":26,
    "PAD_LJ":27,
    "PAD_RM":28,
    "PAD_RS":29,
    "PAD_RT":30,
    "PAD_RJ":31,
    "MOUSE_X_LEFT":4,
    "MOUSE_X_RIGHT":5,
    "MOUSE_Y_DOWN":6,
    "MOUSE_Y_UP":7,
    "MOUSE_WX_LEFT":12,
    "MOUSE_WX_RIGHT":13,
    "MOUSE_WY_DOWN":14,
    "MOUSE_WY_UP":15,
    "MOUSE_LEFT":28,
    "MOUSE_MIDDLE":27,
    "MOUSE_RIGHT":24,
    "MOUSE_4":16,
    "MOUSE_5":17,
    "MOUSE_6":18,
    "MOUSE_7":19,
    "MOUSE_8":29,
    "KB_A":0,
    "KB_D":1,
    "KB_S":2,
    "KB_W":3,
    "KB_LEFT":8,
    "KB_RIGHT":9,
    "KB_DOWN":10,
    "KB_UP":11,
    "KB_Q":16,
    "KB_R":17,
    "KB_E":18,
    "KB_F":19,
    "KB_ESC":20,
    "KB_ENTER":21,
    "KB_LWIN":22,
    "KB_HASH":23,
    "KB_Z":25,
    "KB_LCTRL":26,
    "KB_X":29,
    "KB_LSHIFT":30,
    "KB_SPACE":31,
    "KB_B":32,
    "KB_C":33,
    "KB_G":34,
    "KB_H":35,
    "KB_I":36,
    "KB_J":37,
    "KB_K":38,
    "KB_L":39,
    "KB_M":40,
    "KB_N":41,
    "KB_O":42,
    "KB_P":43,
    "KB_T":44,
    "KB_U":45,
    "KB_V":46,
    "KB_Y":47,
    "KB_1":48,
    "KB_2":49,
    "KB_3":50,
    "KB_4":51,
    "KB_5":52,
    "KB_6":53,
    "KB_7":54,
    "KB_8":55,
    "KB_9":56,
    "KB_0":57,
    "KB_BACKSPACE":58,
    "KB_TAB":59,
    "KB_MINUS":60,
    "KB_EQUAL":61,
    "KB_LEFTBRACE":62,
    "KB_RIGHTBRACE":63,
    "KB_BACKSLASH":64,
    "KB_SEMICOLON":65,
    "KB_APOSTROPHE":66,
    "KB_GRAVE":67,
    "KB_COMMA":68,
    "KB_DOT":69,
    "KB_SLASH":70,
    "KB_CAPSLOCK":71,
    "KB_F1":72,
    "KB_F2":73,
    "KB_F3":74,
    "KB_F4":75,
    "KB_F5":76,
    "KB_F6":77,
    "KB_F7":78,
    "KB_F8":79,
    "KB_F9":80,
    "KB_F10":81,
    "KB_F11":82,
    "KB_F12":83,
    "KB_PSCREEN":84,
    "KB_SCROLL":85,
    "KB_PAUSE":86,
    "KB_INSERT":87,
    "KB_HOME":88,
    "KB_PAGEUP":89,
    "KB_DEL":90,
    "KB_END":91,
    "KB_PAGE_DOWN":92,
    "KB_NUMLOCK":93,
    "KB_KP_DIV":94,
    "KB_KP_MULTI":95,
    "KB_KP_MINUS":96,
    "KB_KP_PLUS":97,
    "KB_KP_ENTER":98,
    "KB_KP_1":99,
    "KB_KP_2":100,
    "KB_KP_3":101,
    "KB_KP_4":102,
    "KB_KP_5":103,
    "KB_KP_6":104,
    "KB_KP_7":105,
    "KB_KP_8":106,
    "KB_KP_9":107,
    "KB_KP_0":108,
    "KB_KP_DOT":109,
    "KB_LALT":110,
    "KB_RCTRL":111,
    "KB_RSHIFT":112,
    "KB_RALT":113,
    "KB_RWIN":114,
};

function writeWriteRecursive(cfg, inputCtrl, ctrl_chrc, data_chrc) {
    return new Promise(function(resolve, reject) {
        ChromeSamples.log('Set Input Ctrl CHRC... ' + inputCtrl[1]);
        ctrl_chrc.writeValue(inputCtrl)
        .then(_ => {
            ChromeSamples.log('Writing Input Data CHRC...');
            var tmpViewSize = cfg.byteLength - inputCtrl[1];
            if (tmpViewSize > 512) {
                tmpViewSize = 512;
            }
            var tmpView = new DataView(cfg.buffer, inputCtrl[1], tmpViewSize);
            return data_chrc.writeValue(tmpView);
        })
        .then(_ => {
            ChromeSamples.log('Input Data Written');
            inputCtrl[1] += Number(512);
            if (inputCtrl[1] < cfg.byteLength) {
                resolve(writeWriteRecursive(cfg, inputCtrl, ctrl_chrc, data_chrc));
            }
            else {
                resolve();
            }
        })
        .catch(error => {
            reject(error);
        });
    });
}


function writeInputCfg(cfgId, cfg, brService) {
    return new Promise(function(resolve, reject) {
        let ctrl_chrc = null;
        let data_chrc = null;
        brService.getCharacteristic(brUuid[4])
        .then(chrc => {
            ctrl_chrc = chrc;
            return brService.getCharacteristic(brUuid[5])
        })
        .then(chrc => {
            var inputCtrl = new Uint16Array(2);
            inputCtrl[0] = Number(cfgId);
            inputCtrl[1] = 0;
            data_chrc = chrc;
            return writeWriteRecursive(cfg, inputCtrl, ctrl_chrc, data_chrc);
        })
        .then(_ => {
            resolve(cfg);
        })
        .catch(error => {
            reject(error);
        });
    });
}


export function savePresetInput(presets, presetNumber, brService, input) {
    //make sure preset is not placeholder before we do anything
    if (presetNumber !== -1) {
        var nbMapping = presets[presetNumber].map.length;
        var cfgSize = nbMapping*8 + 3;
        var cfg = new Uint8Array(cfgSize);
        var cfgId = input-1;
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
            cfg[j++] = Number(presets[presetNumber].map[i][7]) | (Number(presets[presetNumber].map[i][8]) << 4);
        }

        return new Promise(function(resolve, reject) {
            writeInputCfg(cfgId, cfg, brService)
            .then(_ => {
                ChromeSamples.log('Input ' + cfgId + ' Config saved');
                resolve();
            })
            .catch(error => {
                reject(error);
            });
        });
    }
}


