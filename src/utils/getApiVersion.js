import ChromeSamples from "./ChromeSamples"

export function getApiVersion(brService) {
    return new Promise(function(resolve, reject) {
        ChromeSamples.log('Get Api version CHRC...');
        brService.getCharacteristic(brUuid[6])
        .then(chrc => {
          ChromeSamples.log('Reading Api version...');
            return chrc.readValue();
        })
        .then(value => {
          ChromeSamples.log('Api version size: ' + value.byteLength);
            let apiVersion = value.getUint8(0);
            ChromeSamples.log('Api version: ' + apiVersion);
            resolve();
        })
        .catch(error => {
            reject(error);
        });
    });
  }

  export default getApiVersion;