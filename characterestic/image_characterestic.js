const bleno = require('@abandonware/bleno');
const fs = require('fs')

const Characteristic = bleno.Characteristic;


class ImageCharacterestic extends Characteristic {

    loadFile() {
        fs.readFile(this.imagePath, function (err, data) {
            if (err) throw err;
            this.img = data;
            this.len = data.length;
        }.bind(this));
    }

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

        this.imagePath = 'image/new.jpg';

        this.img = undefined;
        this.len = 0;

        this.loadFile();
    }
  
    onSubscribe(maxValueSize, updateValueCallback) {
  

        console.log(maxValueSize);
        this.start = 0;
        this.maxSize = maxValueSize - 2;
        this.blocks = Math.floor(this.len / this.maxSize);
        
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
      let buffer = Buffer.concat([Buffer.from(index), this.img.slice(this.start, this.start + this.maxSize)]);
      // update data
      this.callback(buffer);
    }

    onWriteRequest(data, offset, withoutResponse, callback) {
        this.imagePath = data.toString();
        console.log(this.imagePath);
      
        this.loadFile();

        var result = Characteristic.RESULT_SUCCESS;
        callback(result);
    }
  
    onReadRequest(offset, callback) {
        var result = Characteristic.RESULT_SUCCESS;
        var data = Buffer.from(this.imagePath);
        
        callback(result, data);
    }; 
}

module.exports = ImageCharacterestic;
