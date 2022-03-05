var v4l2camera = require("v4l2camera");

var cam = new v4l2camera.Camera("/dev/video0");

//cam.width = 300;
//cam.height = 200;

cam.start();
cam.capture((success) => {
  var frame = cam.frameRaw();
  require("fs").createWriteStream("result.jpg").end(Buffer(frame));
  cam.stop();
});
