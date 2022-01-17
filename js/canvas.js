const UP = "ArrowUp",
      LEFT = "ArrowLeft",
      DOWN = "ArrowDown",
      RIGHT = "ArrowRight";

const W = "KeyW",
      A = "KeyA",
      S = "KeyS",
      D = "KeyD";

const YEAR = 12 * 30 * 24 * 60 * 60;
const SHUFFLES = 0;

function init() {
  window.canvas = document.getElementById("canvas");
  window.ctx = window.canvas.getContext("2d");
      
  window.mouseX = 0;
  window.mouseY = 0;

  document.addEventListener("keydown", onKeyDown);
  window.canvas.addEventListener("mousemove", onMouseMove, true);
  window.canvas.addEventListener("mouseup", onMouseUp, true);

  window.tiles =
    Array.from({ length: 4 }, (_, i) =>
    Array.from({ length: 4 }, (_, j) => i * 4 + j));
  window.slot = [0, 0];

  var possible = [],
      lastMove,
      selection;
  for (var i = 0; i < SHUFFLES; i++) {
    if (window.slot[0] > 0 && lastMove != RIGHT)
      possible.push([[-1, 0], LEFT]);
    if (window.slot[1] > 0 && lastMove != DOWN)
      possible.push([[0, -1], UP]);
    if (window.slot[0] < 3 && lastMove != LEFT)
      possible.push([[1, 0], RIGHT]);
    if (window.slot[1] < 3 && lastMove != UP)
      possible.push([[0, 1], DOWN]);
    selection = possible[Math.floor(Math.random() * possible.length)];
    move(...selection[0]);
    lastMove = selection[1];
  }

  window.currentScore = { moves: 0, time: 0, exists: true };
  processCookie();
  
  window.timeKeeper = undefined;

  updateDimensions();
  renderMeta();
}

function onMouseMove() {
  window.mouseX = window.event.pageX;
  window.mouseY = window.event.pageY;
}

function onMouseUp() {
  if (Math.pow(window.mouseX - window.restartX, 2) +
      Math.pow(window.mouseY - window.restartY, 2) <
      Math.pow(window.restartR, 2)) {
    if (window.timeKeeper) window.clearInterval(window.timeKeeper);
    init();
    alert("restart");
    return;
  }
}

function onKeyDown(e) {
  if (e.code == UP || e.code == W)
    move(0, -1);
  else if (e.code == LEFT || e.code == A)
    move(-1, 0);
  else if (e.code == DOWN || e.code == S)
    move(0, 1);
  else if (e.code == RIGHT || e.code == D)
    move(1, 0);
}

function move(dx, dy) {
  alert(dx + ", " + dy);
}

function updateDimensions() {
  var width = window.canvas.getBoundingClientRect().width,
      height = window.canvas.getBoundingClientRect().height;

  window.canvas.width = width;
  window.canvas.height = height;
  window.tileDim = Math.min(width, height) / 5;

  var boardDim = 4 * window.tileDim;
  window.offsetX = (width - boardDim) / 2;
  window.offsetY = (height - boardDim) / 2;

  window.restartX = width - window.tileDim / 4;
  window.restartY = window.tileDim / 4;
  window.restartR = window.tileDim / 7;

  for (var i = 0; i < 16; i++)
    renderTile(i);
  renderMeta();
}

function renderTile(index) {
  var ix = index % 4,
      iy = Math.floor(index / 4),
      x = ix * window.tileDim + window.offsetX,
      y = iy * window.tileDim + window.offsetY,
      r = window.tileDim / 20,
      margin = window.tileDim / 50;

  window.ctx.beginPath();
  window.ctx.lineWidth = 2;
  window.ctx.strokeStyle = "black";
  window.ctx.moveTo(x + r + margin, y + margin);
  window.ctx.lineTo(x + window.tileDim - r - margin, y + margin);
  window.ctx.quadraticCurveTo(
    x + window.tileDim - margin,
    y + margin,
    x + window.tileDim - margin,
    y + r + margin
  );
  window.ctx.lineTo(
    x + window.tileDim - margin,
    y + window.tileDim - r - margin
  );
  window.ctx.quadraticCurveTo(
    x + window.tileDim - margin,
    y + window.tileDim - margin,
    x + window.tileDim - r - margin,
    y + window.tileDim - margin
  );
  window.ctx.lineTo(x + r + margin, y + window.tileDim - margin);
  window.ctx.quadraticCurveTo(
    x + margin,
    y + window.tileDim - margin,
    x + margin,
    y + window.tileDim - r - margin
  );
  window.ctx.lineTo(x + margin, y + r + margin);
  window.ctx.quadraticCurveTo(
    x + margin, y + margin,
    x + r + margin, y + margin
  );
  window.ctx.stroke();
  
  var fontSize = window.tileDim / 2,
      cx = x + window.tileDim / 2,
      cy = y + window.tileDim / 2 + fontSize / 3,
      value = window.tiles[iy][ix];
  if (value > 0) {
    window.ctx.textAlign = "center";
    window.ctx.font = fontSize + "px Courier New";
    window.ctx.fillStyle = "black";
    window.ctx.fillText(value, cx, cy);
    window.ctx.textAlign = "left";
  }
}

function renderMeta() {
  var margin = window.tileDim / 10,
      fontSize = window.tileDim / 6;
      bx = margin,
      by = window.canvas.height - margin,
      cx = margin,
      cy = fontSize + margin;
  var current = scoreToText(window.currentScore),
      bestM = scoreToText(window.bestM),
      bestT = scoreToText(window.bestT);

  window.ctx.clearRect(0, 0, window.canvas.width, window.offsetY);
  window.ctx.clearRect(
    0,
    window.canvas.height - window.offsetY,
    window.canvas.width,
    window.offsetY
  );

  window.ctx.font = fontSize + "px Courier New";
  window.ctx.fillStyle = "black";
  window.ctx.fillText("[current: " + current + "]", cx, cy);
  window.ctx.fillText(
    "[best(m): " + bestM + "] " + "[best(t): " + bestT + "]", bx, by);
  renderRestart();
}

function renderRestart() {
  var x = window.restartX,
      y = window.restartY,
      r = window.restartR,
      th = window.tileDim / 30,
      ar = window.tileDim / 25;

  window.ctx.translate(x, y);
  window.ctx.rotate(Math.PI * 7 / 4);
  window.ctx.beginPath(); 
  window.ctx.moveTo(r - ar, -ar);
  window.ctx.lineTo(r + ar, -ar);
  window.ctx.lineTo(r, ar);
  window.ctx.closePath();
  window.ctx.fillStyle = "black";
  window.ctx.fill();

  window.ctx.beginPath(); 
  window.ctx.arc(0, 0, r, Math.PI * 5 / 12, 2 * Math.PI);
  window.ctx.strokeStyle = "black";
  window.ctx.lineWidth = th;
  window.ctx.stroke();
  window.ctx.rotate(-Math.PI * 7 / 4);
  window.ctx.translate(-x, -y);
}

function scoreToText(score) {
  if (score.exists)
    return score.moves + "|" + score.time
  return "-"
}

function processCookie() {
  window.bestM = { moves: 0, time: 0, exists: false };
  window.bestT = { moves: 0, time: 0, exists: false };

  var cookie = document.cookie.split(";");
  for (var i = 0; i < cookie.length; i++) {
    var pair = cookie[i].split("=");
    if ("bestMoves" == pair[0].trim()) {
      var score = pair[1].trim().split("|");
      window.bestM = {
        moves: parseInt(score[0]),
        time: parseInt(score[1]),
        exists: true,
      };
    } else if ("bestTime" == pair[0].trim()) {
      var score = pair[1].trim().split("|");
      window.bestT = {
        moves: parseInt(score[0]),
        time: parseInt(score[1]),
        exists: true,
      }
    }
  }
  renderMeta();
}

function setCookie(score, cookie) {
  if (score.exists)
    document.cookie =
      cookie + "=" + score.moves + "|" + score.time + ";" +
      "max-age=" + YEAR + ";";
}
