var canvas,
  results,
  r,
  ctx,
  flag = false,
  prevX = 0,
  currX = 0,
  prevY = 0,
  currY = 0,
  dot_flag = false;

var x = "#000000",
  y = 14;
var pointSize = 5;
var submit_count = 0;
var xyCord = [];

function init() {
  canvas = document.getElementById("can");

  ctx = canvas.getContext("2d");

  ctx.canvas.width = 650;
  ctx.canvas.height = 650;

  results = document.getElementById("results");
  r = results.getContext("2d");

  r.canvas.width = 650;
  r.canvas.height = 650;
  w = canvas.width;
  h = canvas.height;
  submit_count = 0;
  //ctx.fillStyle = "gray";
  //ctx.font = "20px monospace";
  //ctx.fillText("draw or randomly generate points.", 10, 30);

  canvas.addEventListener(
    "mousemove",
    function (e) {
      findxy("move", e);
    },
    false
  );
  canvas.addEventListener(
    "mousedown",
    function (e) {
      findxy("down", e);
    },
    false
  );
  canvas.addEventListener(
    "mouseup",
    function (e) {
      findxy("up", e);
    },
    false
  );
  canvas.addEventListener(
    "mouseout",
    function (e) {
      findxy("out", e);
    },
    false
  );
}

function draw() {
  ctx.fillStyle = "#000000"; // black color

  ctx.beginPath();
  ctx.arc(prevX, prevY, pointSize, 0, Math.PI * 2, true);
  ctx.fill();
}

function erase() {
  ctx.clearRect(0, 0, w, h);
  r.clearRect(0, 0, w, h);
  xyCord.splice(2, xyCord.length - 2);
}

function save() {
  document.getElementById("can").style.border = "2px solid";
  var dataURL = canvas.toDataURL();
  document.getElementById("can").src = dataURL;
  document.getElementById("can").style.display = "inline";
}
function save1() {
  canvas = document.getElementById("results");
  const link = document.createElement("a");
  link.download = "download.png";
  link.href = canvas.toDataURL();
  link.click();
  link.delete;
}

function findxy(res, e) {
  if (res == "down") {
    prevX = currX;
    prevY = currY;
    currX = e.clientX - canvas.offsetLeft;
    currY = e.clientY - canvas.offsetTop;

    flag = true;
    dot_flag = true;
    if (dot_flag) {
      ctx.beginPath();
      ctx.fillStyle = x;
      ctx.arc(currX, currY, pointSize, 0, Math.PI * 2, true);
      ctx.fill();
      /*ctx.fillRect(currX, currY, 14, 14);*/
      ctx.closePath();
      dot_flag = false;
      xyCord.push([currX, currY]);
    }
  }
  if (res == "up" || res == "out") {
    flag = false;
  }
}
function isCanvasBlank(canvas) {
  return !canvas
    .getContext("2d")
    .getImageData(0, 0, canvas.width, canvas.height)
    .data.some((channel) => channel !== 0);
}

function submit() {
  var canvas = document.getElementById("can");
  if (!isCanvasBlank(canvas)) {
    if (submit_count > 0) {
      //pass
    }
    submit_count = submit_count + 1;

    hideSubmit();
  } else alert("Canvas is Empty!");
}

function hideSubmit() {
  results = document.getElementById("results");
  r = results.getContext("2d");
  r.fillStyle = "gray";
  r.font = "20px monospace";
  r.fillText("loading...", 10, 30);
  $.ajax({
    url: "",
    type: "POST",
    contentType: "application/json",

    data: JSON.stringify({
      xyCords: xyCord,
      models: $("#model_selector").val(),
    }),

    success: function (response) {
      console.log(response.img_data);
      $(".output").text(response.img_data);
      drawResults(response);
    },
  });
}

function drawResults(response) {
  r.clearRect(0, 0, w, h);
  for (let [x, y] of xyCord) {
    r.beginPath();
    r.fillStyle = "#000000";
    r.arc(x, y, pointSize, 0, Math.PI * 2, true);
    r.fill();
    r.closePath();
  }
  for (let [x, y] of response.img_data) {
    r.beginPath();
    r.fillStyle = "#FF0000";
    r.arc(x, y, pointSize, 0, Math.PI * 2, true);
    r.fill();
    r.closePath();
  }
}

function random() {
  console.log("Generating random numbers!  ");
  var c = document.getElementById("can");
  var ctx = c.getContext("2d");
  var total_points = Math.floor(Math.random() * (21 - 3) + 3);
  randomPoints(ctx, total_points, "black");
}

function randomPoints(canvas, count, color) {
  for (var i = 0; i < count; i++) {
    var x = Math.floor(Math.random() * 650);
    var y = Math.floor(Math.random() * 650);
    canvas.fillStyle = color;
    canvas.beginPath();
    canvas.arc(x, y, pointSize, 0, Math.PI * 2, true);
    canvas.fill();
    xyCord.push([x, y]);
  }
}
