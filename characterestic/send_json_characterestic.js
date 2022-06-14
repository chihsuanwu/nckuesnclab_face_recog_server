const bleno = require('@abandonware/bleno');
const fs = require('fs')

const Characteristic = bleno.Characteristic;

//send json
class SendJsonCharacteristic extends Characteristic {

    loadJson() {
        fs.readFile('unlabeled.json', function (err, data) {
            if (err) throw err;
            this.json_receive = data
            this.len = data.length;

            console.log(data);
        }.bind(this));
    }

    
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

        this.json_receive = undefined;

        this.len = 0;

        this.loadJson();
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
      let buffer = Buffer.concat([Buffer.from(index), this.json_receive.slice(this.start, this.start + this.maxSize)]);
      // update data
      this.callback(buffer);
    }
}

module.exports = SendJsonCharacteristic;
