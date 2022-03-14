var bleno = require('@abandonware/bleno');
var util = require('util');
var os = require('os');
var exec = require('child_process').exec;

var fs = require('fs')
var img = undefined;
var len = 0;

fs.readFile('result.jpg', function(err, data) {
  console.log("load image")
  console.log(data);
  console.log("length:" + data.length);
  len = data.length;
  img = data;
})


start = 0;


var Descriptor = bleno.Descriptor;
var Characteristic = bleno.Characteristic;

function MyCharacteristic() {
  MyCharacteristic.super_.call(this, {
    uuid: '2A19',
    properties: ['notify']
  });
};

util.inherits(MyCharacteristic, Characteristic);


var callback = undefined;
var blocks = 0;
var maxSize = 0;

MyCharacteristic.prototype.onSubscribe = function(maxValueSize, updateValueCallback) {
  console.log(maxValueSize);
  start = 0;
  maxSize = maxValueSize - 2;
  blocks = Math.floor(len / maxSize);

  callback = updateValueCallback;

  let index = [Math.floor(blocks / 256), blocks % 256];
  let buffer = Buffer.concat([Buffer.from(index), img.slice(start,start+maxSize)]);
  callback(buffer);
};

MyCharacteristic.prototype.onNotify = function() {


  start += maxSize;
  blocks -= 1;
  if (blocks >= 0) {
    console.log("on notify, start: " + start + ", blocks: " + blocks);
    let index = [Math.floor(blocks / 256), blocks % 256];
    let buffer = Buffer.concat([Buffer.from(index), img.slice(start,start+maxSize)]);
    callback(buffer);
  } 
};




function MyCharacteristic2() {
  MyCharacteristic2.super_.call(this, {
    uuid: '2A18',
    properties: ['write']
  });
};

util.inherits(MyCharacteristic2, Characteristic);

MyCharacteristic2.prototype.onWriteRequest = function(data, offset, withoutResponse, callback){
  console.log(data);

var result = Characteristic.RESULT_SUCCESS;

callback(result);
};





var BlenoPrimaryService = bleno.PrimaryService;

function MyService() {
  MyService.super_.call(this, {
      uuid: '180F ',
      characteristics: [
          new MyCharacteristic(),
          new MyCharacteristic2(),
      ]
  });
}

util.inherits(MyService, BlenoPrimaryService);






var primaryService = new MyService();

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




