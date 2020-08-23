import { Vector } from './vector';

let colors = ["rgb(110, 64, 170)", "rgb(114, 64, 171)", "rgb(117, 63, 173)", "rgb(121, 63, 174)", "rgb(125, 63, 175)", "rgb(129, 62, 176)", "rgb(134, 62, 177)", "rgb(138, 62, 178)", "rgb(142, 62, 178)", "rgb(146, 61, 179)", "rgb(150, 61, 179)", "rgb(154, 61, 179)", "rgb(158, 61, 179)", "rgb(162, 61, 179)", "rgb(167, 60, 179)", "rgb(171, 60, 178)", "rgb(175, 60, 178)", "rgb(179, 60, 177)", "rgb(183, 60, 177)", "rgb(187, 60, 176)", "rgb(191, 60, 175)", "rgb(195, 61, 173)", "rgb(199, 61, 172)", "rgb(203, 61, 171)", "rgb(207, 61, 169)", "rgb(210, 62, 167)", "rgb(214, 62, 166)", "rgb(217, 63, 164)", "rgb(221, 63, 162)", "rgb(224, 64, 160)", "rgb(228, 65, 157)", "rgb(231, 65, 155)", "rgb(234, 66, 153)", "rgb(237, 67, 150)", "rgb(240, 68, 148)", "rgb(242, 69, 145)", "rgb(245, 70, 142)", "rgb(248, 71, 139)", "rgb(250, 73, 136)", "rgb(252, 74, 134)", "rgb(254, 75, 131)", "rgb(255, 77, 128)", "rgb(255, 78, 124)", "rgb(255, 80, 121)", "rgb(255, 82, 118)", "rgb(255, 84, 115)", "rgb(255, 86, 112)", "rgb(255, 88, 109)", "rgb(255, 90, 106)", "rgb(255, 92, 102)", "rgb(255, 94, 99)", "rgb(255, 96, 96)", "rgb(255, 99, 93)", "rgb(255, 101, 90)", "rgb(255, 103, 87)", "rgb(255, 106, 84)", "rgb(255, 109, 81)", "rgb(255, 111, 78)", "rgb(255, 114, 76)", "rgb(255, 117, 73)", "rgb(255, 120, 71)", "rgb(255, 122, 68)", "rgb(255, 125, 66)", "rgb(255, 128, 63)", "rgb(255, 131, 61)", "rgb(255, 135, 59)", "rgb(255, 138, 57)", "rgb(255, 141, 56)", "rgb(255, 144, 54)", "rgb(253, 147, 52)", "rgb(251, 150, 51)", "rgb(249, 154, 50)", "rgb(246, 157, 49)", "rgb(244, 160, 48)", "rgb(242, 164, 47)", "rgb(239, 167, 47)", "rgb(237, 170, 46)", "rgb(234, 173, 46)", "rgb(231, 177, 46)", "rgb(229, 180, 46)", "rgb(226, 183, 47)", "rgb(223, 187, 47)", "rgb(220, 190, 48)", "rgb(218, 193, 49)", "rgb(215, 196, 50)", "rgb(212, 199, 51)", "rgb(209, 202, 52)", "rgb(206, 205, 54)", "rgb(204, 208, 56)", "rgb(201, 211, 58)", "rgb(198, 214, 60)", "rgb(196, 217, 62)", "rgb(193, 220, 65)", "rgb(191, 223, 67)", "rgb(188, 225, 70)", "rgb(186, 228, 73)", "rgb(183, 230, 76)", "rgb(181, 233, 80)", "rgb(179, 235, 83)", "rgb(177, 238, 87)"];

let width;
let height;
//let width = 960;
//let height = 500;

let canvas = document.getElementById('canvas');
let ctx = canvas.getContext('2d');

let offscreenCanvas = document.getElementById('offscreenCanvas');
let offscreenCtx = offscreenCanvas.getContext('2d');

let mouseVector = new Vector();
let mouseState = 0;

function scaleCanvas() {
  width = window.innerWidth;
  height = window.innerHeight;

  for (let c of [canvas, offscreenCanvas]) {
    c.width = width;
    c.height = height;

    c.style.width = `${width}px`;
    c.style.height = `${height}px`;
  }
}

scaleCanvas();
window.onresize = scaleCanvas;

document.oncontextmenu = function(e) {
  e.preventDefault();
  return false;
};

function mouseMoveHandler(e) {
  mouseVector.x = e.clientX;
  mouseVector.y = e.clientY;

  //console.log(mouseVector);
}

function mouseDownHandler(e) {
  mouseState = e.which;
}

function mouseUpHander(e) {
  mouseState = 0;
}

canvas.onmousemove = mouseMoveHandler;

canvas.onmousedown = mouseDownHandler;
canvas.onmouseup = mouseUpHander;

let lastUpdateTime = performance.now();

let fpsArr = [];
let frame = 0;

let templateBoid = {
  position: new Vector(),
  velocity: new Vector(),

  last: []
};

let boidCount = 100;

let boids = [];

let flockmateRadius = 90,
    separationDistance = 60,
    maxVelocity = 3,
    separationForce = 0.03,
    alignmentForce = 0.03,
    cohesionForce = 0.03,
    mouseForce = 0.1;

let ruleForces = [
  alignmentForce,
  cohesionForce,
  separationForce
];

generateBoids();

function generateBoids() {
  if (boids.length > boidCount) {
    boids.splice(0, boids.length - boidCount);
  }

  for (let i = Number(boids.length); i < boidCount; i++) {
    boids.push(Object.assign({}, templateBoid));
  
    boids[i].position = new Vector(Math.random() * width, Math.random() * height);
    boids[i].velocity = new Vector(1 - Math.random() * 2, 1 - Math.random() * 2).scale(maxVelocity);
  }
}

let elBoidCount = document.getElementById('boidCount');

elBoidCount.oninput = () => {
  boidCount = parseInt(elBoidCount.value);
  generateBoids();
};

offscreenCtx.globalAlpha = 0.85;

async function update() {
  let timeNow = performance.now();
  let deltaTime = (timeNow - lastUpdateTime) / 1000;
  lastUpdateTime = timeNow;

  fpsArr.push(Math.round(1 / deltaTime));
  if (fpsArr.length > 10) fpsArr.shift();

  offscreenCtx.clearRect(0, 0, width, height);
  offscreenCtx.drawImage(canvas, 0, 0, width, height);

  ctx.clearRect(0, 0, width, height);
  ctx.drawImage(offscreenCanvas, 0, 0, width, height);

  for (let b of boids) {
    let alignment = new Vector();
    let cohesion = new Vector();
    let separation = new Vector();

    b.acceleration = new Vector();

    for (let b2 of boids) {
      if (b === b2) break;

      let diff = b2.position.clone().sub(b.position);
      let dist = diff.length();

      if (dist && dist < separationDistance) {
        separation.add(diff.clone().scaleTo(-1 / dist)).changed = true;
      }

      if (dist < flockmateRadius) {
        cohesion.add(diff).changed = true;
        alignment.add(b2.velocity).changed = true;
      }
    }

    let forces = [alignment, cohesion, separation];

    //console.log(alignment.clone().scaleTo(maxVelocity));

    for (let i = 0; i < 3; i++) {
      if (forces[i].changed) {
        //if (i === 0) console.log(i, ruleForces[i]);
        forces[i].scaleTo(maxVelocity).sub(b.velocity).truncate(ruleForces[i]);
        b.acceleration.add(forces[i]);
      }
    }

    if (mouseState !== 0) {
      let diff = b.position.clone().sub(mouseVector.clone()).truncate(mouseForce);

      if (mouseState === 1) {
        b.acceleration.sub(diff);
      } else {
        b.acceleration.add(diff);
      }
    }

    b.last.push(b.acceleration.length() / (alignmentForce + cohesionForce + separationForce));

    if (b.last.length > 20) {
      b.last.shift();
    }
  }

  for (let b of boids) {
    b.position.add(b.velocity.add(b.acceleration).truncate(maxVelocity));

    if (b.position.y > height) {
      b.position.y -= height;
    } else if (b.position.y < 0) {
      b.position.y += height;
    }
  
    if (b.position.x > width) {
      b.position.x -= width;
    } else if (b.position.x < 0) {
      b.position.x += width;
    }

    let color = 'rgb(242, 69, 145)'; //colors[Math.floor(mean(b.last) * 100)];
    //console.log(color);
    //let colorSplit = color.replace('rgb(', '').replace(')', '').split(', ').map((x) => parseInt(x));

    //console.log(colorSplit);

    drawTriangleFromVector(b.position.x, b.position.y, b.velocity, color, -(triangleVectorSize / 2));

    //let dotColor = `rgb(${colorSplit.slice().map((x) => x - 200).join(', ')})`;

    ctx.beginPath();

    ctx.fillStyle = 'red'; //dotColor;

    ctx.arc(b.position.x, b.position.y, 2, 0, 2 * Math.PI);
    ctx.fill();

    //if (!b.acceleration.isZero()) drawTriangleFromVector(b.position.x, b.position.y, b.acceleration, 'rgba(255, 0, 0, .5)', 20);
  }

  if (mouseState !== 0) for (let i = 0; i < mouseArrows; i++) {
    let vec = new Vector(Math.cos(2 * Math.PI * i / mouseArrows), Math.sin(2 * Math.PI * i / mouseArrows));

    drawTriangleFromVector(mouseVector.x, mouseVector.y, vec, mouseState === 1 ? 'blue' : 'red', mouseState === 1 ? -mouseSpacing : (mouseSpacing / 1.5), 3.14159);
  }

  frame++;

  requestAnimationFrame(update);
}

let mouseArrows = 5;
let mouseSpacing = 25;

let triangleVectorSize = 5;
let triangleVectorHeight = triangleVectorSize * 2;

function drawTriangleFromVector(x, y, vector, color, spacing, angleOffset = 0) {
  ctx.save();

  ctx.translate(x, y);
  //console.log(angleOffset);
  ctx.rotate(vector.directionFromOrigin() + 1.5708);

  ctx.beginPath();

  ctx.fillStyle = color;

  ctx.moveTo(-triangleVectorSize, -spacing);
  
  ctx.lineTo(triangleVectorSize, -spacing);
  ctx.lineTo(0, -triangleVectorHeight - spacing);

  ctx.fill();

  ctx.restore();
}

function mean(array) {
  return array.reduce((a, b) => a + b) / array.length;
}

update();