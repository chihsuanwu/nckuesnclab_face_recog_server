var bleno = require('@abandonware/bleno');
var util = require('util');
var os = require('os');
var exec = require('child_process').exec;

// Load image
var fs = require('fs')
var img = undefined;
var len = 0;

fs.readFile('new.jpg', function(err, data) {
  console.log("load image")
  console.log(data);
  console.log("length:" + data.length);
  len = data.length;
  img = data;
})


const Characteristic = bleno.Characteristic;


// For sending image
class MyCharacteristic extends Characteristic {
  constructor() {
    super(
      {
        uuid: '2A19',
        properties: ['notify']
      }
    );

    
    this.callback = undefined; // notify update value callback

    this.start = 0;

    this.blocks = 0;
    this.maxSize = 0;
  }

  onSubscribe(maxValueSize, updateValueCallback) {
    console.log(maxValueSize);
    this.start = 0;
    this.maxSize = maxValueSize - 2;
    this.blocks = Math.floor(len / this.maxSize);
  
    this.callback = updateValueCallback;
  
    this.sendData();
  };

  onNotify() {
    this.start += this.maxSize;
    this.blocks -= 1;

    // If not finish sending all 
    if (this.blocks >= 0) {
      console.log("on notify, start: " + this.start + ", blocks: " + this.blocks);
      
      this.sendData();
    } 
  };

  sendData() {
    // calc index
    let index = [Math.floor(this.blocks / 256), this.blocks % 256];
    // load part of img to buffer
    let buffer = Buffer.concat([Buffer.from(index), img.slice(this.start, this.start + this.maxSize)]);
    // update data
    this.callback(buffer);
  }
}


// TEST write, currently uselss
class MyCharacteristic2 extends Characteristic {
  constructor() {
    super(
      {
        uuid: '2A18',
        properties: ['write']
      }
    );
  }

  onWriteRequest(data, offset, withoutResponse, callback) {
    console.log(data);
  
    var result = Characteristic.RESULT_SUCCESS;
  
    callback(result);
  };
}


const BlenoPrimaryService = bleno.PrimaryService;

class MyService extends BlenoPrimaryService {
  constructor() {
    super(
      {
        uuid: '180F ',
        characteristics: [
          new MyCharacteristic(),
          new MyCharacteristic2(),
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
    bleno.startAdvertising('Battery', [primaryService.uuid]);
  } else {
    bleno.stopAdvertising();
  }
});

bleno.on('advertisingStart', function(error) {
  console.log('on -> advertisingStart: ' + (error ? 'error ' + error : 'success'));

  if (!error) {
    bleno.setServices([primaryService], function(error){
      console.log('setServices: '  + (error ? 'error ' + error : 'success'));
    });
  }
});

bleno.on('accept', function(clientAddress) {
  console.log('on -> accept: ' + (clientAddress));
});




