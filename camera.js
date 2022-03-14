var v4l2camera = require("v4l2camera");

var cam = new v4l2camera.Camera("/dev/video0");

console.log(cam.formats);
cam.configSet({
    formatName: 'MJPG',
    format: 1196444237,
    width: 320,
    height: 240,
    interval: { numerator: 1, denominator: 30 }
});
//console.log(cam.configGet());


cam.start();
cam.capture((success) => {
  var frame = cam.frameRaw();
  require("fs").createWriteStream("result.jpg").end(Buffer(frame));
  cam.stop();
});
