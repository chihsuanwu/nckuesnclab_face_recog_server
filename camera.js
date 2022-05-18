const v4l2camera = require("v4l2camera");
const jimp = require("jimp");

const cam = new v4l2camera.Camera("/dev/video0");

console.log(cam.formats);
cam.configSet({
    formatName: 'MJPG',
    format: 1196444237,
    width: 640,
    height: 480,
    interval: { numerator: 1, denominator: 30 }
});
//console.log(cam.configGet());


cam.start();
cam.capture((success) => {
  var frame = cam.frameRaw();
  require("fs").createWriteStream("result.jpg").end(Buffer(frame));
  cam.stop();

  zipImg();
});

function zipImg() {
  jimp.read("result.jpg")
    .then(img => {
      return img.quality(50)
        .write("new.jpg");
    })
    .catch(error => {
      console.error(error);
    });
}
