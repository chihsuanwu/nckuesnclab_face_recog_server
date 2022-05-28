var bleno = require('@abandonware/bleno');
var util = require('util');
var os = require('os');
var exec = require('child_process').exec;

var Descriptor = bleno.Descriptor;

var imagepath='image/en01.jpg';

const utf8 = require('utf8');

// Load image
var fs = require('fs')
var img = undefined;
var len = 0;



fs.readFile(imagepath, function(err, data) {
  console.log("load image")
  console.log(data);
  console.log("length:" + data.length);
  len = data.length;
  img = data;
})

fs.readFile('unlabeled.json', function (err, data_json) {
  if (err) throw err;
  json_receive=data_json
  console.log(data_json);
});

const Characteristic = bleno.Characteristic;


// For sending image
class MyCharacteristic extends Characteristic {
  constructor() {
    super(
      {
        uuid: '2A19',
        properties: ['read','notify','write']
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


    // this.readData();
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

MyCharacteristic.prototype.onWriteRequest = function(data, offset, withoutResponse, callback){
  // console.log(data.toString());
  imagepath=data.toString();
  console.log(imagepath);

  fs.readFile(imagepath, function(err, data) {
    console.log("load image onSubscribe")
    console.log(data);
    console.log("length:" + data.length);
    len = data.length;
    img = data;
  })



var result = Characteristic.RESULT_SUCCESS;
callback(result);
};

MyCharacteristic.prototype.onReadRequest = function(offset, callback) {
  var result = Characteristic.RESULT_SUCCESS;
  var data =Buffer.from(imagepath);;
  
  callback(result, data);
}; 


//receive json
function MyCharacteristic2() {
  MyCharacteristic2.super_.call(this, {
    uuid: '2A18',
    properties: ['write']
  });
};

util.inherits(MyCharacteristic2, Characteristic);


MyCharacteristic2.prototype.onWriteRequest = function(data, offset, withoutResponse, callback){
  console.log(data.toString());

var result = Characteristic.RESULT_SUCCESS;


callback(result);
};

//send json
class MyCharacteristic3 extends Characteristic {
  constructor() {
    super(
      {
        uuid: '2A1A',
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
    let buffer = Buffer.concat([Buffer.from(index), json_receive.slice(this.start, this.start + this.maxSize)]);
    // update data
    this.callback(buffer);
  }
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
          new MyCharacteristic3(),
          // new MyCharacteristic4(),
          
          
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



