const bleno = require('@abandonware/bleno');

const ImageCharacterestic = require('./characterestic/image_characterestic');
const SendJsonCharacteristic = require('./characterestic/send_json_characterestic');
const ReceiveJsonCharacteristic = require('./characterestic/receive_json_characterestic');


const BlenoPrimaryService = bleno.PrimaryService;

class MyService extends BlenoPrimaryService {
    constructor() {
        super(
            {
                uuid: '180F',
                characteristics: [
                    new ImageCharacterestic(),
                    new SendJsonCharacteristic(),
                    new ReceiveJsonCharacteristic(),
                ]
            }
        );
    }
}


const primaryService = new MyService();

// Below is some basic BLE event
bleno.on('stateChange', function(state) {
    console.log('on -> stateChange: ' + state);

    if (state === 'poweredOn') {
        bleno.startAdvertising('NCLAB', [primaryService.uuid]);
    } else {
        bleno.stopAdvertising();
    }
});

bleno.on('advertisingStart', function(error) {
    console.log('on -> advertisingStart: ' + (error ? 'error ' + error : 'success'));

    if (!error) {
        bleno.setServices([primaryService], function(error) {
            console.log('setServices: '  + (error ? 'error ' + error : 'success'));
        });
    }
});

bleno.on('accept', function(clientAddress) {
    console.log('on -> accept: ' + (clientAddress));
});



