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
        this.start = [];
    }



    onWriteRequest(data, offset, withoutResponse, callback) {
        let newdata = Object.values(data)

        

        // console.log(data);
        // console.log(data.toString());
        // console.log(Object.values(data));
        let num=parseInt(newdata[0], 10)*256+parseInt(newdata[1], 10)
        console.log(num);
       
        newdata.splice(0, 2)

        

        let i
        for(i=0;i<newdata.length;i++){
            this.start.push(String.fromCharCode(newdata[i]))
            // console.log( String.fromCharCode(newdata[i]));
       

        }


        // let text =String.fromCharCode(newdata)
        if ( num == '1'){
            let p =this.start.join('')
            console.log(p);
            this.start=[]

            fs.writeFile('./labeled.json', p,function (error) {
                console.log(error)
                console.log('文件寫入成功')
              })
            
        }
        
        // console.log(this.start[1])
        // console.log(typeof newdata);
        // var myAString = String.fromCharCode(newdata.Spalte)
        // console.log(myAString);
        // let i
        // for(i=0;i<this.start.length;i++){
        //     console.log(this.start[i]);
        // }

        
        
        
  
        var result = Characteristic.RESULT_SUCCESS;
        
        callback(result);
    }
}

module.exports = ReceiveJsonCharacteristic;
