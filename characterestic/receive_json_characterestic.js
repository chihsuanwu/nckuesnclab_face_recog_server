const bleno = require('@abandonware/bleno');
const fs = require('fs')

const Characteristic = bleno.Characteristic;


//receive json
class ReceiveJsonCharacteristic extends Characteristic {
    constructor() {
        super(
            {
                uuid: '2A18',
                properties: ['write']
            }
        );
    }

    onWriteRequest(data, offset, withoutResponse, callback) {
        console.log(data.toString());
  
        var result = Characteristic.RESULT_SUCCESS;
        
        callback(result);
    }
}

module.exports = ReceiveJsonCharacteristic;
